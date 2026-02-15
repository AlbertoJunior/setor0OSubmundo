import { gameLocalize, getObject, localize, localizeFormat } from "../../../../../utils/utils.mjs";
import { ChatCreator } from "../../../../../utils/chat-creator.mjs";
import { ActorEnhancementField } from "../../../../../field/actor-fields.mjs";
import { EnhancementRepository } from "../../../../../repository/enhancement-repository.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { EnhancementUtils } from "../../../../../core/enhancement/enhancement-utils.mjs";
import { ActiveEffectsUtils } from "../../../../../core/effect/active-effects-utils.mjs";
import { ActorUtils } from "../../../../../core/actor/actor-utils.mjs";
import { EnhancementDialog } from "../../../../../creators/dialog/enhancement-dialog.mjs";
import { createOptionsAndSetOnSelects } from "../../../../../creators/element/element-creator-jscript.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { EnhancementMessageCreator } from "../../../../../creators/message/enhancement-message.mjs";
import { ConfirmationDialog } from "../../../../../creators/dialog/confirmation-dialog.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { EnhancementDuration } from "../../../../../enums/enhancement-enums.mjs";
import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../../../enums/active-effects-enums.mjs";
import { CombatUtils } from "../../../../../core/combat/combat-utils.mjs";

export function updateEnhancementLevelsOptions(enhancementId, selects) {
  const enhancementLevels = EnhancementRepository.getEnhancementEffectsByEnhancementId(enhancementId);
  createOptionsAndSetOnSelects(Array.from(selects), enhancementLevels);
}

export function selectLevelOnOptions(enhancement, selects, activeEffects) {
  const levels = enhancement.levels;
  Array.from(selects).forEach((select, index) => {
    const levelId = levels[`nv${index + 1}`]?.id;
    if (levelId != '') {
      const option = Array.from(select.options).find(option => option.value == levelId);
      if (option) {
        option.selected = true;

        const isActive = activeEffects.has(levelId);
        setupViewButtonIsVisibleAndItemIsChecked(select.parentElement, isActive);
      }
    }
  });
}

function setupViewButtonIsVisibleAndItemIsChecked(parent, isActive) {
  $(parent).find(`a[data-action=${OnEventType.VIEW}]`).toggleClass('hidden');
  $(parent).find(`a[data-action=${OnEventType.CHECK}]`)
    .toggleClass('hidden')
    .toggleClass('S0-selected', isActive);
}

async function updateActorEnhancement(currentTarget, actor) {
  const selectedEnhancement = currentTarget.selectedOptions[0];
  const enhancementId = selectedEnhancement.dataset.itemId;
  const enhancementText = selectedEnhancement.text;

  const enhancementOnSlotKey = ActorUtils.getCharacteristicEnhancementSlot(currentTarget.dataset.itemId);
  const enhancementOnSlot = getObject(actor, enhancementOnSlotKey);

  const enhancementsIds = ActorUtils.getAllEnhancements(actor).some(enhancement => enhancement.id === enhancementId);
  if (enhancementId !== '' && enhancementsIds) {
    NotificationsUtils.error(localizeFormat('Aprimoramento.Mensagens.Ja_Possui_Aprimoramento', { aprimoramento: enhancementText }));

    const jCurrentTarget = $(currentTarget);

    const oldEnhancement = EnhancementRepository.getEnhancementById(enhancementOnSlot?.id);
    if (!oldEnhancement) {
      jCurrentTarget.prop('selectedIndex', 0).trigger('change');
    } else {
      const optionIndex = Object.values(jCurrentTarget[0].options)
        .findIndex(opt => opt.value == oldEnhancement.value);
      jCurrentTarget.prop('selectedIndex', optionIndex);
    }
    return;
  }

  if (enhancementId == undefined || enhancementId == '') {
    await removeEnhancementEffects(actor, enhancementOnSlot);
  }

  const characteristic = ActorEnhancementField.toJson(enhancementId, enhancementText);
  ActorUpdater.verifyAndUpdateActor(actor, enhancementOnSlotKey, characteristic);
}

async function updateActorLevelEnhancement(currentTarget, actor) {
  const jCurrentTarget = $(currentTarget);

  const { enhancementSlot, enhancementLevel } = jCurrentTarget.data();
  const effectId = jCurrentTarget.val();

  const enhancementOnSlotKey = ActorUtils.getCharacteristicEnhancementSlot(enhancementSlot);
  const enhancementOnSlot = getObject(actor, enhancementOnSlotKey);

  const effect = EnhancementRepository.getEnhancementEffectById(effectId, enhancementOnSlot.id);

  const levelKey = `nv${enhancementLevel}`;
  const oldEffect = enhancementOnSlot.levels[levelKey];

  if (effectId !== '') {
    const hasEffect = ActorUtils.getAllEnhancements(actor)
      .flatMap(enhacement => Object.values(enhacement.levels))
      .some(levelEnhancement => levelEnhancement.id == effectId);

    if (hasEffect) {
      NotificationsUtils.error(localizeFormat('Aprimoramento.Mensagens.Ja_Possui_Efeito', { efeito: effect.name }));
      if (!oldEffect) {
        jCurrentTarget.prop('selectedIndex', 0).trigger('change');
      } else {
        const listOptions = Object.values(jCurrentTarget[0].options);
        const optionIndex = listOptions.findIndex(opt => opt.value == oldEffect.id);
        jCurrentTarget.prop('selectedIndex', optionIndex);
      }
      return;
    }
  }

  if (oldEffect.id && oldEffect.id != '' && oldEffect.id != effectId) {
    await ActiveEffectsUtils.removeActorEffect(actor, oldEffect.id)
  }

  const updatedCharacteristicLevels = { ...enhancementOnSlot.levels };
  updatedCharacteristicLevels[levelKey] = effect;

  await ActorUpdater.verifyAndUpdateActor(actor, `${enhancementOnSlotKey}.levels`, updatedCharacteristicLevels);

  if (effect?.duration == EnhancementDuration.PASSIVE) {
    toggleEnhancementEffectOnActor(effect, actor);
  }
}

function getEffectSelectedId(event) {
  const currentTarget = event.currentTarget;
  const select = $(currentTarget.parentElement).find('select')[0];
  return select.selectedOptions[0]?.value;
}

async function activateEffectSendOnChat(effect, actor) {
  const message = await EnhancementMessageCreator.mountContentActiveDeactive(effect, localize('Ativou'));
  await verifyIsGmAndDefineShowChat(message, actor);
}

async function usedEffectSendOnChat(effect, actor) {
  const message = await EnhancementMessageCreator.mountContentActiveDeactive(effect, localize('Usou'));
  await verifyIsGmAndDefineShowChat(message, actor);
}

async function deactivedEffectSendOnChat(effect, actor) {
  const message = await EnhancementMessageCreator.mountContentActiveDeactive(effect, localize('Desativou'));
  await verifyIsGmAndDefineShowChat(message, actor);
}

async function verifyIsGmAndDefineShowChat(message, actor) {
  if (game.user.isGM) {
    ConfirmationDialog.open({
      titleDialog: "Ocultar Ação?",
      cancelButtonText: gameLocalize('No'),
      confirmButtonText: gameLocalize('Yes'),
      message: localize("Pergunta.Ocultar_Acao"),
      onClose: async () => {
        await ChatCreator.sendToChat(actor, message, ChatCreator.MODE_PRIVATE_TO_GM);
      },
      onCancel: async () => {
        await ChatCreator.sendToChat(actor, message);
      },
      onConfirm: async () => {
        await ChatCreator.sendToChat(actor, message, ChatCreator.MODE_PRIVATE_TO_GM);
      }
    });
  } else {
    await ChatCreator.sendToChat(actor, message);
  }
}

async function toggleEnhancementEffectOnActor(effect, actor) {
  if (!effect) {
    NotificationsUtils.error(localize('Aviso.Erro.Efeito_Invalido'));
    return;
  }

  if (!actor) {
    NotificationsUtils.error(localize('Aviso.Erro.Ator_Invalido'));
    return;
  }

  const haveEffect = ActiveEffectsUtils.getActorEffect(actor, effect.id);
  if (haveEffect) {
    await ActiveEffectsUtils.removeActorEffect(actor, ActiveEffectsUtils.getOriginId(haveEffect));
    await deactivedEffectSendOnChat(effect, actor);
    return;
  }

  const enhancement = await EnhancementRepository.getEnhancementFamilyByEffectId(effect.id);
  if (!enhancement) {
    return;
  }

  if (effect.duration == EnhancementDuration.USE) {
    await NotificationsUtils.info(localizeFormat('Voce_Usou_Nome', { nome: effect.name }));
    await usedEffectSendOnChat(effect, actor);
    return;
  } else {
    const enhancementLabel = localize('Aprimoramento.Nome');
    const activeEffectData = ActiveEffectsUtils.createEffectData({
      name: effect.name,
      description: enhancementLabel,
      origin: `${enhancementLabel}: ${enhancement.name}`,
      statuses: [effect.id],
      flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: effect.id,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.ENHANCEMENT,
        [ActiveEffectsFlags.ORIGIN_TYPE_LABEL]: ActiveEffectsUtils.activeEffectOriginTypeLabel(ActiveEffectsOriginTypes.ENHANCEMENT),
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.BUFF,
        ...(effect.duration !== EnhancementDuration.PASSIVE && {
          [ActiveEffectsFlags.COMBAT_ID]: CombatUtils.currentCombat()?.id
        })
      }
    });

    EnhancementUtils.verifyAndSetEffectChanges(actor, activeEffectData, effect.effectChanges, enhancement);
    EnhancementUtils.configureActiveEffect(activeEffectData, effect, enhancement);
    await ActorUpdater.addEffects(actor, [activeEffectData]);
    await activateEffectSendOnChat(effect, actor);
  }
}

async function removeEnhancementEffects(actor, enhancement) {
  const levels = enhancement?.levels;
  if (!levels) {
    return;
  }

  const ids = Object.values(levels).map(item => item.id).filter(Boolean);
  await ActiveEffectsUtils.removeActorEffects(actor, ids);
}

async function removeAllEnhancementEffects(actor) {
  const effects = actor.effects
    .filter(effect => ActiveEffectsUtils.getOriginType(effect) == ActiveEffectsOriginTypes.ENHANCEMENT)
    .map(effect => ActiveEffectsUtils.getOriginId(effect))
    .filter(Boolean);
  await ActiveEffectsUtils.removeActorEffects(actor, effects);
}

async function activePassiveEffects(actor) {
  const passiveEffects = ActorUtils.getAllEnhancements(actor)
    .flatMap(e => Object.values(e.levels))
    .filter(ef => ef.id !== '' && ef.duration == EnhancementDuration.PASSIVE);

  await Promise.all(passiveEffects.map(effect => toggleEnhancementEffectOnActor(effect, actor)));
}

export const enhancementHandleMethods = {
  [OnEventType.REMOVE]: async (actor, event) => {
    await removeAllEnhancementEffects(actor);
    await activePassiveEffects(actor);
  },
  [OnEventType.CHANGE]: async (actor, event) => {
    const currentTarget = event.currentTarget;
    const type = currentTarget.dataset.type;

    if (type == 'enhancement') {
      updateActorEnhancement(currentTarget, actor);
    } else if (type == 'level') {
      updateActorLevelEnhancement(currentTarget, actor);
    } else {
      NotificationsUtils.warning(`enhancement-methods:change:type [${type}] is not mapped`);
    }
  },
  [OnEventType.VIEW]: async (actor, event) => {
    const effectId = getEffectSelectedId(event);
    const effect = EnhancementRepository.getEnhancementEffectById(effectId);
    if (effect) {
      EnhancementDialog.open(effect, actor, () => toggleEnhancementEffectOnActor(effect, actor));
    } else {
      NotificationsUtils.warning('enhancement-methods:view:effect is null');
    }
  },
  [OnEventType.CHECK]: async (actor, event) => {
    const effectId = getEffectSelectedId(event);
    const effect = EnhancementRepository.getEnhancementEffectById(effectId);
    if (effect) {
      toggleEnhancementEffectOnActor(effect, actor);
    } else {
      NotificationsUtils.warning('enhancement-methods:check:effect is null');
    }
  },
}
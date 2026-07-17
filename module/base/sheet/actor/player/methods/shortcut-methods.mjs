import { getObject, localize, onArrayRemove } from "../../../../../utils/utils.mjs";
import { CreateFormDialog } from "../../../../../creators/dialog/create-dialog.mjs";
import { CreateRollableTestDialog } from "../../../../../creators/dialog/create-roll-test-dialog.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { ActorCombatUtils } from "../../../../../core/actor/actor-combat-utils.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { playerRollHandle } from "./player-roll-methods.mjs";
import { MacroTypesEnum } from "../../../../../enums/macro-enums.mjs";

export const handlerShortcutEvents = {
  [OnEventType.ADD]: async (actor, event) => ShortcutHandleEvents.handleAdd(actor, event),
  [OnEventType.EDIT]: async (actor, event) => ShortcutHandleEvents.handleEdit(actor, event),
  [OnEventType.VIEW]: async (actor, event) => ShortcutHandleEvents.handleView(actor, event),
  [OnEventType.ROLL]: async (actor, event) => ShortcutHandleEvents.handleRoll(actor, event),
}

export async function shortcutCustomRoll(actor, rollableId) {
  ShortcutHandleEvents.rollCustomShortcut(actor, rollableId);
}

class ShortcutHandleEvents {
  static #presetsCombatOffensiveShortcuts = {
    brawl: {
      label: 'Briga',
      data: ActorCombatUtils.dataPresetCombatMap.brawl.offensive,
    },
    melee: {
      label: 'Armas_Brancas',
      data: ActorCombatUtils.dataPresetCombatMap.melee.offensive,
    },
    projectile: {
      label: 'Armas_De_Projecao',
      data: ActorCombatUtils.dataPresetCombatMap.projectile.offensive,
    }
  };

  static #presetsCombatDefensiveShortcuts = {
    brawl: {
      label: 'Bloquear',
      data: ActorCombatUtils.dataPresetCombatMap.brawl.defensive
    },
    melee: {
      label: 'Aparar',
      data: ActorCombatUtils.dataPresetCombatMap.melee.defensive
    },
    dodge: {
      label: 'Esquivar',
      data: ActorCombatUtils.dataPresetCombatMap.projectile.defensive
    }
  };

  static async handleAdd(actor, event) {
    const onConfirm = async (rollable) => {
      if (!rollable.name) {
        NotificationsUtils.error(localize("Aviso.Teste.Erro_Sem_Nome"));
        return;
      }

      const current = getObject(actor, CharacteristicType.SHORTCUTS) || [];
      current.push(rollable);

      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SHORTCUTS, current);
    };

    CreateRollableTestDialog.open(null, onConfirm, undefined, actor, MacroTypesEnum.ATALHOS);
  }

  static async handleEdit(actor, event) {
    const itemId = event.currentTarget.dataset.itemId;
    const selectedTest = getObject(actor, CharacteristicType.SHORTCUTS).find(shortcut => shortcut.id == itemId);

    const onConfirm = async (rollable) => {
      if (!rollable.name) {
        NotificationsUtils.error(localize("Aviso.Teste.Erro_Sem_Nome"));
        return;
      }

      const shortcuts = getObject(actor, CharacteristicType.SHORTCUTS) || [];
      const index = shortcuts.indexOf(selectedTest);
      if (index >= 0) {
        shortcuts[index] = rollable;
        await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SHORTCUTS, shortcuts);
      }
    };
    const onDelete = async (rollable) => {
      const shortcuts = getObject(actor, CharacteristicType.SHORTCUTS) || [];
      onArrayRemove(shortcuts, rollable);
      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SHORTCUTS, shortcuts);
    };

    CreateRollableTestDialog.open(selectedTest, onConfirm, onDelete, actor, MacroTypesEnum.ATALHOS);
  }

  static async handleView(actor, event) {
    const minHeight = actor.sheet.defaultHeight;
    const container = event.currentTarget.parentElement.parentElement.querySelector(`#shortcuts-container-${actor.id}`);
    if (container) {
      const resultExpand = HtmlJsUtils.expandOrContractElement(container, { minHeight: minHeight });
      HtmlJsUtils.flipClasses(event.currentTarget.children[0], 'fa-chevron-down', 'fa-chevron-up');

      actor.sheet.isExpandedShortcuts = resultExpand.isExpanded;
    }
  }

  static async handleRoll(actor, event) {
    const dataset = event.currentTarget.dataset;

    if (dataset.subCharacteristic) {
      const type = dataset.type;
      const subCharacteristic = dataset.subCharacteristic;
      this.#rollDefaultShortcut(actor, type, subCharacteristic);
    } else {
      const itemId = dataset.itemId;
      this.rollCustomShortcut(actor, itemId);
    }
  }

  static async #rollDefaultShortcut(actor, type, subCharacteristic) {
    CreateFormDialog.open(
      localize("Modificadores"),
      "rolls/modifiers",
      {
        presetForm: {
          canBeHalf: false,
          canBeSpecialist: true,
        },
        onConfirm: async (data) => {
          const isOffensive = subCharacteristic.includes('offensive');

          const presetMap = isOffensive ? this.#presetsCombatOffensiveShortcuts : this.#presetsCombatDefensiveShortcuts;
          if (!presetMap) {
            NotificationsUtils.error(localize("Aviso.Erro.Tipo_Invalido"));
            return;
          }

          const key = Object.keys(presetMap).find(presetKey => type.includes(presetKey));
          if (!key) {
            NotificationsUtils.error(localize("Aviso.Erro.Tipo_Invalido"));
            return;
          }

          const isHalf = type.includes('half');
          const preset = presetMap[key];
          const name = `${localize(preset.label)} ${isHalf ? 'Dividido' : 'Completo'}`;
          const bonusPreset = preset.data.getBonus(actor);

          const inputParams = {
            ...preset.data,
            bonus: Number(data.bonus) + bonusPreset,
            automatic: Number(data.automatic),
            difficulty: Number(data.difficulty),
            critic: Number(data.critic),
            name: name,
            isHalf: isHalf,
            rollMode: data.chatSelect,
          };

          await playerRollHandle.default(actor, inputParams);
        }
      },
    );
  }

  static async rollCustomShortcut(actor, itemId) {
    const shortcutTest = getObject(actor, CharacteristicType.SHORTCUTS).find(shortcut => shortcut.id == itemId);
    await playerRollHandle.shortcut(actor, shortcutTest);
  }

}
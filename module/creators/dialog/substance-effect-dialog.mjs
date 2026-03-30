import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { SubstanceEffectRepository } from "../../repository/substance-effect-repository.mjs";
import { TraitRepository } from "../../repository/trait-repository.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EffectChangeValueType } from "../../enums/enhancement-enums.mjs";
import { EquipmentCharacteristicType } from "../../enums/equipment-enums.mjs";
import { gameLocalize, getObject, localize, randomId } from "../../utils/utils.mjs";
import { CreateFormDialog } from "./create-dialog.mjs";
import { NotificationsUtils } from "../message/notifications.mjs";
import { EquipmentUpdater } from "../../base/updater/equipment-updater.mjs";
import { EquipmentInfoParser } from "../../core/equipment/equipment-info.mjs";

export class SubstanceEffectDialog {
  static open(item) {
    const normalEffectsOptions = this.#mapOptions(SubstanceEffectRepository.getItems());
    const customEffectsGroup = {
      label: localize('Outro'),
      options: [{
        id: 'custom',
        description: `[ ${localize('Criar_Customizado')} ]`
      }]
    };
    const finalEffectsOptions = [...normalEffectsOptions, customEffectsGroup];

    CreateFormDialog.open(
      localize('Itens.Adicionar_Efeito'),
      'items/dialog/substance-effect',
      {
        presetForm: {
          effects: finalEffectsOptions,
          effectsOptions: TraitRepository.getBonusOptionsMap(),
          skillsOptions: AbilityRepository.getItems().map(opt => ({
            ...opt,
            name: gameLocalize(opt.label),
          })),
        },
        render: (html, renderedDialog, windowApp) => {
          const selectFormEffect = html.querySelector('select[name="selectedEffect"]');
          const customFormContainer = html.querySelector('#customFormContainer');

          const selectEffect = html.querySelector('#effectKey');
          const particularityContainer = html.querySelector('#particularityContainer');

          const checkCustomSelection = () => {
            if (selectFormEffect.value === 'custom') {
              customFormContainer.style.display = 'block';
            } else {
              customFormContainer.style.display = 'none';
            }
            windowApp.style.height = 'auto';
          };

          const checkSkillSelection = () => {
            if (selectEffect.value === CharacteristicType.BONUS.SKILL.system) {
              particularityContainer.style.display = 'block';
            } else {
              particularityContainer.style.display = 'none';
            }
            windowApp.style.height = 'auto';
          };

          selectFormEffect.addEventListener('change', checkCustomSelection);
          selectEffect.addEventListener('change', checkSkillSelection);

          checkCustomSelection();
          checkSkillSelection();
        },
        onConfirm: async (data) => {
          const actualList = getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];

          if (data.selectedEffect === 'custom') {
            if (!data.description?.trim()) {
              NotificationsUtils.error("Descrição é obrigatória");
              return;
            }

            let effectKey = data.key;
            if (effectKey === CharacteristicType.BONUS.SKILL.system && data.skillKey) {
              effectKey = `${effectKey}.${data.skillKey}`;
            }

            const change = {
              key: effectKey,
              value: Number(data.value),
              typeOfValue: EffectChangeValueType.FIXED,
              mode: CONST.ACTIVE_EFFECT_MODES.ADD
            };

            const customEffect = {
              id: randomId(),
              name: data.description,
              description: data.description,
              type: data.type,
              changes: [change]
            };

            EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS, new Set([...actualList, customEffect]));
          } else {
            const selectedEffect = SubstanceEffectRepository.getItem(data.selectedEffect);

            if (actualList.some(i => i.id == selectedEffect.id)) {
              NotificationsUtils.error(localize('Itens.Mensagens.Nao_Pode_Efeitos_Iguais'));
              return;
            }

            if (selectedEffect) {
              EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS, new Set([...actualList, selectedEffect]));
            }
          }
        },
      }
    );
  }

  static #mapOptions(list) {
    const groups = {};

    list.forEach((item, index) => {
      const groupLabel = EquipmentInfoParser.parseSubstanceEffectType(item.type);

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push({
        ...item,
        index,
      });
    });

    return Object.entries(groups)
      .sort(([labelA], [labelB]) => labelA.localeCompare(labelB))
      .map(([label, options]) => ({
        label,
        options
      }));
  }
}

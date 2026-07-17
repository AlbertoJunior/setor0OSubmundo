import { CreateFormDialog } from "../../../../creators/dialog/create-dialog.mjs";
import { gameLocalize, localize } from "../../../../utils/utils.mjs";
import { EffectChangeValueType } from "../../../../enums/enhancement-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { TraitUpdater } from "../../../updater/trait-updater.mjs";
import { TraitRepository } from "../../../../repository/trait-repository.mjs";
import { AbilityRepository } from "../../../../repository/ability-repository.mjs";
import { CharacteristicType } from "../../../../enums/characteristic-enums.mjs";

export const handlerTraitCharacteristicsEvents = {
  [OnEventType.ADD]: async (item, event) => TraitSheetCharacteristicsHandle.add(item, event),
  [OnEventType.REMOVE]: async (item, event) => TraitSheetCharacteristicsHandle.remove(item, event),
};

class TraitSheetCharacteristicsHandle {
  static async add(item, event) {
    const target = event.currentTarget;
    const type = target.dataset.type;

    if (type === 'trait-effect') {
      await this.#addEffect(item);
    }
  }

  static async #addEffect(item) {
    CreateFormDialog.open(
      localize('Traco.Adicionar_Efeito'),
      'traits/trait-effect-dialog',
      {
        presetForm: {
          effectsOptions: TraitRepository.getBonusOptionsMap(),
          skillsOptions: AbilityRepository.getItems().map(opt => ({
            ...opt,
            name: gameLocalize(opt.label),
          })),
        },
        render: (html, renderedDialog, windowApp) => {
          const selectEffect = html.querySelector('#effectKey');
          const particularityContainer = html.querySelector('#particularityContainer');

          const checkSkillSelection = () => {
            if (selectEffect.value === CharacteristicType.BONUS.SKILL.system) {
              particularityContainer.style.display = 'block';
              windowApp.style.height = 'auto';
            } else {
              particularityContainer.style.display = 'none';
              windowApp.style.height = 'auto'; // Ajusta altura ao ocultar também
            }
          };

          selectEffect.addEventListener('change', checkSkillSelection);
          checkSkillSelection(); // Check on open
        },
        onConfirm: async (data) => {
          let effectKey = data.key;
          if (effectKey === CharacteristicType.BONUS.SKILL.system && data.skillKey) {
            effectKey = `${effectKey}.${data.skillKey}`;
          }

          const newEffect = {
            key: effectKey,
            value: Number(data.value),
            typeOfValue: EffectChangeValueType.FIXED,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD
          };

          await TraitUpdater.addEffect(item, newEffect);
        },
      }
    );
  }

  static async remove(item, event) {
    const target = event.currentTarget;
    const type = target.dataset.type;

    if (type === 'trait-effect') {
      await this.#removeEffect(item, target.dataset.itemIndex);
    }
  }

  static async #removeEffect(item, itemIndex) {
    await TraitUpdater.removeEffect(item, itemIndex);
  }
}

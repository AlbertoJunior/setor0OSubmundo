import { CreateFormDialog } from "../../../../creators/dialog/create-dialog.mjs";
import { localize } from "../../../../utils/utils.mjs";
import { EffectChangeValueType } from "../../../../enums/enhancement-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { TraitUpdater } from "../../../updater/trait-updater.mjs";
import { TraitRepository } from "../../../../repository/trait-repository.mjs";

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
      localize('Adicionar_Efeito'),
      'items/dialog/trait-effect',
      {
        presetForm: {
          effectsOptions: TraitRepository.getBonusOptionsMap()
        },
        onConfirm: async (data) => {
          const newEffect = {
            key: data.key,
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

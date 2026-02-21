import { TraitUtils } from "../../core/trait/trait-utils.mjs";
import { TraitCharacteristicType } from "../../enums/trait-enums.mjs";

export class TraitUpdater {
  static async addEffect(item, newEffect) {
    const actualList = TraitUtils.getEffects(item);
    return item.update({ [TraitCharacteristicType.EFFECTS.system]: [...actualList, newEffect] });
  }

  static async removeEffect(item, index) {
    const actualList = [...TraitUtils.getEffects(item)];
    actualList.splice(Number(index), 1);
    return item.update({ [TraitCharacteristicType.EFFECTS.system]: actualList });
  }
}

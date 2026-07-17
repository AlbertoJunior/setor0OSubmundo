import { TraitUtils } from "../../core/trait/trait-utils.mjs";
import { TraitCharacteristicType } from "../../enums/trait-enums.mjs";
import { getObject } from "../../utils/utils.mjs";

export class TraitUpdater {

  static async updateTrait(trait, characteristic, value) {
    const change = this.createChange(characteristic, value);
    return await this.updateTraitData(trait, [change]);
  }

  static createChange(characteristic, value) {
    let haveSystem = characteristic;
    if (characteristic.system) {
      haveSystem = characteristic.system;
    }
    return { characteristic: haveSystem, value };
  }

  static async updateTraitData(trait, changes = []) {
    const dataToUpdate = {};
    for (const { characteristic, value } of changes) {
      if (getObject(trait, characteristic) === undefined) {
        console.warn(`-> [${characteristic}] não existe, impossível atualizar o Traço`);
      } else {
        dataToUpdate[characteristic] = value;
      }
    }

    if (Object.keys(dataToUpdate).length > 0) {
      return await trait.update(dataToUpdate);
    }
  }

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

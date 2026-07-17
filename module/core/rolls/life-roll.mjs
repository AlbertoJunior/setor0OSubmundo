import { getObject } from "../../utils/utils.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollLife {
  static async roll(actor, amount = 1) {
    const life = getObject(actor, CharacteristicType.LIFE);
    const resultRoll = await CoreRollMethods.rollDice(1);
    const success = this.#calculateSuccess(resultRoll.values, life);
    return {
      life: life,
      roll: resultRoll.roll,
      values: resultRoll.values,
      success: success,
      missed: Math.max(amount - success, 0)
    }
  }

  static #calculateSuccess(values, difficulty) {
    let result = 0;
    for (const element of values) {
      if (element <= difficulty) {
        result++;
      }
    }
    return result;
  }
}
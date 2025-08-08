import { getObject } from "../../utils/utils.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollOverload {
    static #OVERLOAD_DIFFICULTY = Object.freeze(8);
    static #BEST_CORE = Object.freeze(4);

    static async roll(actor, amountOverloadTest = 1) {
        const core = getObject(actor, CharacteristicType.CORE);
        const resultRoll = await CoreRollMethods.rollDice(core);
        const success = this.#calculateSuccess(resultRoll.values, core >= this.#BEST_CORE);
        return {
            core: core,
            roll: resultRoll.roll,
            values: resultRoll.values,
            success: success,
            missed: Math.max(amountOverloadTest - success, 0)
        }
    }

    static #calculateSuccess(values, bestCore = false) {
        let result = 0;
        let canBeUseBestCore = bestCore;
        for (const element of values) {
            if (element >= this.#OVERLOAD_DIFFICULTY) {
                result++;
            } else if (element == 1) {
                if (canBeUseBestCore) {
                    canBeUseBestCore = false;
                } else {
                    result--;
                }
            }
        }
        return result;
    }
}
import { ActorUtils } from "../actor/actor-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollVirtue {
  static async roll(actor, params) {
    const { virtue1, virtue2, bonus = 0, penalty = 0, automatic = 0, difficulty = 6 } = params;

    const safeAutomatic = Number(automatic);
    const safeBonus = Number(bonus);
    const safePenalty = Number(penalty);
    const valueVirtue1 = ActorUtils.getVirtueValue(actor, virtue1);
    const valueVirtue2 = ActorUtils.getVirtueValue(actor, virtue2);

    const diceAmount = valueVirtue1 + valueVirtue2 + safeBonus - safePenalty;

    const result = await CoreRollMethods.rollDice(diceAmount);

    result.roll.options = {
      difficulty: Number(difficulty),
      automatic: safeAutomatic,
      bonus: safeBonus,
      penalty: safePenalty,
    }

    const virtues = {
      virtue1: {
        label: virtue1,
        value: valueVirtue1
      },
      virtue2: {
        label: virtue2,
        value: valueVirtue2
      },
    }

    const modifiersInformations = {
      automatic: safeAutomatic,
      bonus: safeBonus,
      penalty: safePenalty,
    }

    return {
      roll: result,
      virtues: virtues,
      modifiers: modifiersInformations
    };
  }
}
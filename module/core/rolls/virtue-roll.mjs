import { ActorUtils } from "../actor/actor-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollVirtue {
  static async roll(actor, params) {
    const { virtue1, virtue2, bonus = 0, penalty = 0, automatic = 0 } = params;

    const safeBonus = Number(bonus);
    const safePenalty = Number(penalty);
    const valueVirtue1 = ActorUtils.getVirtueValue(actor, virtue1);
    const valueVirtue2 = ActorUtils.getVirtueValue(actor, virtue2);

    const diceAmount = valueVirtue1 + valueVirtue2 + safeBonus - safePenalty;

    const result = await CoreRollMethods.rollDice(diceAmount);

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
      automatic: Number(automatic),
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
import { RollConsciousnessMessageCreator } from "../../creators/message/consciousness-roll.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { ActorUtils } from "../actor/actor-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";
import { RollUtils } from "../../utils/roll-utils.mjs";

export class RollConsciousness {
  static async operateMessage(message) {
    const defaultRollsOnMessage = message.rolls.filter(roll => !RollUtils.isOverloadRoll(roll));
    if (!defaultRollsOnMessage || defaultRollsOnMessage.length < 1) {
      console.warn(`-> Nenhuma rolagem encontrada`);
      return null;
    }

    const actorOnMessage = ActorUtils.getActor(message.speaker.actor);

    const defaultRollResult = defaultRollsOnMessage[0];

    const values = CoreRollMethods.getValuesOnRoll(defaultRollResult);
    const resultRoll = await CoreRollMethods.rollDice(values.length);

    const optionsRoll = defaultRollResult.options;
    const params = {
      values: values,
      newValues: resultRoll.values,
      difficulty: optionsRoll.difficulty || 6,
      automatic: (optionsRoll.automatic || 0)
    };

    params.successes = this.#calculateSuccesses(values, resultRoll.values, params)

    const messageContent = await RollConsciousnessMessageCreator.mountContent(params);

    const newRoll = resultRoll.roll;
    Object.assign(newRoll.options, optionsRoll);

    await ChatCreator.sendToChatTypeRoll(actorOnMessage, messageContent, [newRoll]);

    return params;
  }

  static #calculateSuccesses(firstRoll, secondRoll, params) {
    const { difficulty, automatic } = params
    const first = this.#calculate(firstRoll, difficulty)
    const second = this.#calculate(secondRoll, difficulty)
    return {
      first: first,
      second: second,
      automatic: automatic,
      total: first + second + automatic
    }
  }

  static #calculate(values, difficulty) {
    let result = 0;
    for (const element of values) {
      if (element >= difficulty) {
        result++;
      }
    }
    return result;
  }
}
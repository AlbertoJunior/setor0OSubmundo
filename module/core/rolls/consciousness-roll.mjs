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
      critic: optionsRoll.critic || 10,
      specialist: optionsRoll.specialist || false,
      automatic: (optionsRoll.automatic || 0) + (optionsRoll?.weapon?.true_damage || 0)
    };

    const messageContent = await RollConsciousnessMessageCreator.mountContent(params);

    const newRoll = resultRoll.roll;
    Object.assign(newRoll.options, optionsRoll);

    await ChatCreator.sendToChatTypeRoll(actorOnMessage, messageContent, [newRoll]);

    return params;
  }
}
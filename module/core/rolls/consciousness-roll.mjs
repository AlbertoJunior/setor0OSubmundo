import { RollQuietnessMessageCreator } from "../../creators/message/quietness-roll.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { ActorUtils } from "../actor/actor-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollConsciousness {
  static async operateMessage(message) {
    TODO('implementar');
    return null

    const defaultRoll = message.rolls.filter(roll => roll.options.isOverload == false);

    if (!defaultRoll || defaultRoll.length < 1) {
      console.warn(`-> Nenhuma rolagem encontrada`);
      return null;
    }

    const actorOnMessage = ActorUtils.getActor(message.speaker.actor);

    const overloadRollResult = overloadRoll[0];
    const defaultRollResult = defaultRoll[0];

    const optionsRoll = defaultRollResult.options;
    const newValues = {
      roll: defaultRollResult,
      values: CoreRollMethods.getValuesOnRoll(defaultRollResult),
      removedValues: CoreRollMethods.getValuesOnRoll(overloadRollResult),
      difficulty: optionsRoll.difficulty || 6,
      critic: optionsRoll.critic || 10,
      specialist: optionsRoll.specialist || false,
      automatic: (optionsRoll.automatic || 0) + (optionsRoll?.weapon?.true_damage || 0),
      canUsePerseverance: ActorUtils.havePerseverance(actorOnMessage),
      canUseQuietness: false
    };

    const messageContent = await RollQuietnessMessageCreator.mountContent(newValues);

    await ChatCreator.sendToChatTypeRoll(actorOnMessage, messageContent, [newValues.roll]);

    return newValues;
  }
}
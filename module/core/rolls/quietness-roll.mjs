import { RollQuietnessMessageCreator } from "../../creators/message/quietness-roll.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollQuietness {
    static async operateMessage(message) {
        const overloadRoll = message.rolls.filter(roll => roll.options.isOverload == true);
        const defaultRoll = message.rolls.filter(roll => roll.options.isOverload == false);

        if (!overloadRoll || defaultRoll.length < 1) {
            console.warn(`-> Nenhum dado de Sobrecarga rolado`);
            return null;
        }

        if (!defaultRoll || defaultRoll.length < 1) {
            console.warn(`-> Nenhuma rolagem encontrada`);
            return null;
        }

        const defaultRollResult = defaultRoll[0];
        const overloadRollResult = overloadRoll[0];

        const optionsRoll = defaultRollResult.options;
        const newValues = {
            roll: defaultRollResult,
            values: CoreRollMethods.getValuesOnRoll(defaultRollResult),
            removedValues: CoreRollMethods.getValuesOnRoll(overloadRollResult),
            difficulty: optionsRoll.difficulty || 6,
            critic: optionsRoll.critic || 10,
            specialist: optionsRoll.specialist || false,
            automatic: (optionsRoll.automatic || 0) + (optionsRoll?.weapon?.true_damage || 0)
        };

        debugger

        const messageContent = await RollQuietnessMessageCreator.mountContent(newValues);
        const actorOnMessage = game.actors.get(message.speaker.actor);

        await ChatCreator.sendToChatTypeRoll(actorOnMessage, messageContent, [newValues.roll]);

        return newValues;
    }
}
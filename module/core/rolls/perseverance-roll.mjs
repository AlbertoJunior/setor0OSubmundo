import { RollPerseveranceMessageCreator } from "../../creators/message/perseverance-roll.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollPerseverance {
    static async operateMessage(message) {
        const rollsOnMessage = message.rolls.filter(roll => roll.options.isOverload == false);

        if (!rollsOnMessage || rollsOnMessage.length < 1) {
            console.warn(`-> Nenhuma rolagem encontrada`);
            return null;
        }

        const roll = rollsOnMessage[0];
        const values = CoreRollMethods.getValuesOnRoll(roll);
        const newValues = await RollPerseverance.rerrollValues(values);

        newValues.difficulty = roll.options.difficulty || 6;
        newValues.critic = roll.options.critic || 10;
        newValues.specialist = roll.options.specialist || false;
        newValues.automatic = (roll.options.automatic || 0) + (roll.options?.weapon?.true_damage || 0);

        const messageContent = await RollPerseveranceMessageCreator.mountContent(newValues);
        const actorOnMessage = game.actors.get(message.speaker.actor);

        await ChatCreator.sendToChatTypeRoll(actorOnMessage, messageContent, [newValues.roll]);

        return newValues;
    }

    static async rerrollValues(values) {
        const resultRoll = await CoreRollMethods.rollDice(Math.min(2, values.length));

        const minors = this.#getTwoMinorValues(values);
        const newValues = this.#removeValues(values, minors);

        return {
            roll: resultRoll.roll,
            values: [...newValues, ...resultRoll.values],
            oldVaues: [...values],
            removedValues: [...minors]
        }
    }

    static #getTwoMinorValues(values) {
        if (values.length < 2) {
            return values;
        }

        const copiedList = [...values];
        copiedList.sort((a, b) => a - b);
        return copiedList.slice(0, 2);
    }

    static #removeValues(values, valuesToRemove) {
        const newValues = [...values];
        valuesToRemove.forEach(element => {
            const index = newValues.indexOf(element);
            if (index !== -1) {
                newValues.splice(index, 1);
            }
        });

        return newValues;
    }
}
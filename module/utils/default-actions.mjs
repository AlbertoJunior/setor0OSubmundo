import { ChatCreator } from "./chat-creator.mjs";
import { ActorUtils } from "../core/actor/actor-utils.mjs";
import { CombatUtils } from "../core/combat/combat-utils.mjs";
import { RollInitiative } from "../core/rolls/initiative-roll.mjs";
import { RollLife } from "../core/rolls/life-roll.mjs";
import { RollOverload } from "../core/rolls/overload-roll.mjs";
import { RollInitiativeMessageCreator } from "../creators/message/initiative-roll.mjs";
import { RollLifeMessageCreator } from "../creators/message/life-roll.mjs";
import { RollOverloadMessageCreator } from "../creators/message/overload-roll.mjs";
import { RollMessageCreator } from "../creators/message/roll-mesage.mjs";
import { RollVirtueMessageCreator } from "../creators/message/virtue-roll.mjs";

export class DefaultActions {
    static async processInitiativeRoll(actor, combatantInformations) {
        const resultRoll = await RollInitiative.roll(actor);
        const contentMessage = await RollInitiativeMessageCreator.mountContent(resultRoll);

        if (combatantInformations.hidden === true) {
            await ChatCreator.sendToChatTypeRoll(actor, contentMessage, [], ChatCreator.MODE_PRIVATE_TO_GM);
        } else {
            await ChatCreator.sendToChatTypeRoll(actor, contentMessage, [resultRoll.roll], ChatCreator.MODE_PUBLIC);
        }
        await CombatUtils.addOrUpdateActorOnCombat(actor, resultRoll.total, combatantInformations);
    }

    static async processOverloadRoll(actor) {
        const resultRoll = await RollOverload.roll(actor);
        const contentMessage = await RollOverloadMessageCreator.mountContent(resultRoll);
        await ChatCreator.sendToChatTypeRoll(actor, contentMessage, [resultRoll.roll]);
    }

    static async processLifeRoll(actor) {
        const resultRoll = await RollLife.roll(actor);
        const contentMessage = await RollLifeMessageCreator.mountContent(resultRoll);
        await ChatCreator.sendToChatTypeRoll(actor, contentMessage, [resultRoll.roll]);
    }

    static async processVirtueRoll(actor, resultRoll, difficulty, mode) {
        const contentMessage = await RollVirtueMessageCreator.mountContent({ resultRoll, difficulty });
        await ChatCreator.sendToChatTypeRoll(actor, contentMessage, [resultRoll.roll.roll], mode);
    }

    static async processSimplefiedRoll(actor, rollInformation) {
        const { resultRoll, mode } = rollInformation;
        const { isHalf, ...modifiersWithoutHalf } = rollInformation.modifiers;

        const params = {
            name: rollInformation.name,
            rolls: resultRoll,
            abilityInfo: rollInformation.abilityInfo,
            modifiers: modifiersWithoutHalf,
            difficulty: rollInformation.difficulty,
            critic: rollInformation.critic,
            havePerseverance: true,
            half: isHalf
        };

        const rolls = this.#prepareRolls(params.rolls, params, { isSimplified: true });
        const message = await RollMessageCreator.mountContentSimplifiedRoll(params);
        await ChatCreator.sendToChatTypeRoll(actor, message, rolls, mode);
    }

    static async processRollByAmount(actor, rollInformation) {
        const params = {
            name: rollInformation.name,
            amount: rollInformation.value,
            rolls: rollInformation.resultRoll,
            modifiers: {
                specialist: rollInformation.specialist,
                automatic: rollInformation.automatic,
            },
            difficulty: rollInformation.difficulty,
            critic: rollInformation.critic,
            havePerseverance: ActorUtils.havePerseverance(actor),
            half: false
        };

        const rolls = this.#prepareRolls(params.rolls, params, { isAmountRoll: true });
        const message = await RollMessageCreator.mountContentByAmountRoll(params);
        await ChatCreator.sendToChatTypeRoll(actor, message, rolls, rollInformation.rollMode);
    }

    static async processCustomRoll(actor, resultRoll, inputParams, rollMessage, mode) {
        const params = {
            rolls: resultRoll.roll,
            attrs: resultRoll.attrs,
            modifiers: {
                ...resultRoll.modifiers,
                automatic: inputParams.automatic,
            },
            difficulty: inputParams.difficulty,
            critic: inputParams.critic,
            messageTest: rollMessage,
            havePerseverance: ActorUtils.havePerseverance(actor),
            half: inputParams.half
        }

        const rolls = this.#prepareRolls(params.rolls, params, { isCustom: true });
        const message = await RollMessageCreator.mountContentCustomRoll(params);
        await ChatCreator.sendToChatTypeRoll(actor, message, rolls, mode);
    }

    static async processAttributeRoll(actor, resultRoll, difficulty, critic, rollMessage, mode) {
        const params = {
            rolls: resultRoll.roll,
            attrs: resultRoll.attrs,
            abilityInfo: resultRoll.abilityInfo,
            modifiers: resultRoll.modifiers,
            difficulty: Number(difficulty),
            critic: Number(critic),
            messageTest: rollMessage,
            havePerseverance: ActorUtils.havePerseverance(actor),
        }

        const rolls = this.#prepareRolls(params.rolls, params);
        const message = await RollMessageCreator.mountContentDefaultRoll(params);
        await ChatCreator.sendToChatTypeRoll(actor, message, rolls, mode);
    }

    static #prepareRolls(rollsObject, params, extraFlags = {}) {
        const rolls = [];
        const { default: defaultData, overload: overloadData } = rollsObject;

        if (defaultData?.roll) {
            rolls.push(this.#mountOptions(defaultData.roll, { ...params, ...extraFlags, isOverload: false }));
        }

        if (overloadData?.roll) {
            rolls.push(this.#mountOptions(overloadData.roll, { ...params, ...extraFlags, isOverload: true }));
        }

        return rolls;
    }

    static #mountOptions(objectRoll, params) {
        const { isOverload, difficulty, critic, messageTest } = params;

        const {
            specialist = false,
            isHalf = false,
            automatic = 0,
            weapon
        } = params.modifiers || {};

        objectRoll.options = {
            ...objectRoll.options,
            isOverload: isOverload,
            difficulty: difficulty,
            critic: critic,
            messageTest: messageTest,
            specialist: specialist,
            isHalf: isHalf,
            automatic: automatic,
            weapon: weapon,
        }
        return objectRoll;
    }
}
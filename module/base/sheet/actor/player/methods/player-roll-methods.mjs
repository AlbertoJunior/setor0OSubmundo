import { localize } from "../../../../../utils/utils.mjs";
import { RollAttribute } from "../../../../../core/rolls/attribute-roll.mjs";
import { CustomRoll } from "../../../../../core/rolls/custom-roll.mjs";
import { RollSimplified } from "../../../../../core/rolls/simplified-roll.mjs";
import { RollVirtue } from "../../../../../core/rolls/virtue-roll.mjs";
import { DefaultActions } from "../../../../../utils/default-actions.mjs";

export const playerRollHandle = {
    default: async (actor, inputParams) => PlayerRollMethods.handleDefaultRoll(actor, inputParams),
    custom: async (actor, inputParams) => PlayerRollMethods.handleCustomRoll(actor, inputParams),
    virtue: async (actor, inputParams) => PlayerRollMethods.handleVirtueRoll(actor, inputParams),
    shortcut: async (actor, shortcutTest) => PlayerRollMethods.handleShortcutRoll(actor, shortcutTest),
    simple: async (actor, inputParams) => PlayerRollMethods.handleSimpleRoll(actor, inputParams),
    rollableItem: async (actor, rollTest, item, half, mode) => PlayerRollMethods.handleRollabeItemRoll(actor, { rollTest, item, half, mode }),
}

class PlayerRollMethods {
    static async handleDefaultRoll(actor, inputParams) {
        const { difficulty, critic, name, rollMode } = inputParams;

        const resultRoll = await RollAttribute.roll(actor, inputParams);
        await DefaultActions.processAttributeRoll(actor, resultRoll, difficulty, critic, name, rollMode);
    }

    static async handleVirtueRoll(actor, inputParams) {
        const { difficulty, rollMode } = inputParams;

        const resultRoll = await RollVirtue.roll(actor, inputParams);
        await DefaultActions.processVirtueRoll(actor, resultRoll, difficulty, rollMode);
    }

    static async handleCustomRoll(actor, inputParams) {
        const { rollMode } = inputParams;
        const resultRoll = await CustomRoll.discoverAndRoll(actor, inputParams);
        await DefaultActions.processCustomRoll(actor, resultRoll, inputParams, localize('Teste_Customizado'), rollMode);
    }

    static async handleRollabeItemRoll(actor, inputParams) {
        const { rollTest, item, half, mode } = inputParams;

        const resultRoll = await RollAttribute.rollByRollableTestsWithEquipment(actor, rollTest, item, half);
        await DefaultActions.processAttributeRoll(actor, resultRoll, rollTest.difficulty, rollTest.critic, rollTest.name, mode);
    }

    static async handleShortcutRoll(actor, shortcutTest) {
        const { difficulty, critic, name, rollMessage, mode } = shortcutTest;

        const rollLabel = rollMessage ? rollMessage : name;
        const resultRoll = await RollAttribute.rollByRollableTests(actor, shortcutTest);
        await DefaultActions.processAttributeRoll(actor, resultRoll, difficulty, critic, rollLabel, mode);
    }

    static async handleSimpleRoll(actor, inputParams) {
        const rollInformation = {
            name: localize('Simples'),
            resultRoll: await RollSimplified.rollByAmount(actor, inputParams),
            ...inputParams
        };
        await DefaultActions.processRollByAmount(actor, rollInformation);
    }
}
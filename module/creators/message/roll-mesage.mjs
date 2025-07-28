import { CoreRollMethods } from "../../core/rolls/core-roll-methods.mjs";
import { keyJsonToKeyLang, localize, toTitleCase } from "../../../scripts/utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class RollMessageCreator {
    static async mountContentDefaultRoll(params) {
        const { messageTest, rolls, abilityInfo, modifiers, difficulty, critic, half, havePerseverance } = params;

        const { attr1, attr2 } = params.attrs;
        const formule = `(${attr1.value} + ${attr2.value}) / 2 + ${abilityInfo.value}`;

        const diceResults = this.#getDiceResults(rolls);

        const automatic = this.#getAutomaticFromModifiers(modifiers);
        const result = this.#verifyResultRoll(
            diceResults.overload, diceResults.default, modifiers.specialist, difficulty, critic, automatic
        );

        const coreContentData = this.mountCoreInformationRoll(diceResults, result, difficulty, critic, half, modifiers, havePerseverance, formule);

        const data = {
            haveMessageTest: typeof messageTest === "string" && messageTest.trim().length > 0,
            messageTest: messageTest,
            attr1: keyJsonToKeyLang(attr1.label),
            attr2: keyJsonToKeyLang(attr2.label),
            ability: toTitleCase(abilityInfo.label.replaceAll('_', ' ')),
            ...coreContentData,
        };

        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/default.hbs`, data);
    }

    static async mountContentCustomRoll(params) {
        const { rolls, messageTest, modifiers, difficulty, critic, half, havePerseverance } = params;

        const diceResults = this.#getDiceResults(rolls);

        const { attr1, attr2, attr3 } = params.attrs;
        const formule = `(${attr1.value} + ${attr2.value}) ${attr3.value ? `/ 2 + ${attr3.value}` : ''}`.trim();

        const automatic = this.#getAutomaticFromModifiers(modifiers);
        const result = this.#verifyResultRoll(
            diceResults.overload, diceResults.default, modifiers.specialist, difficulty, critic, automatic
        );

        const formatedMessageTest = messageTest.split(":");

        const coreContentData = this.mountCoreInformationRoll(diceResults, result, difficulty, critic, half, modifiers, havePerseverance, formule);

        const data = {
            messageTestTitle: formatedMessageTest[0],
            messageTestSubtitle: formatedMessageTest[1],
            attr1: attr1.label,
            attr2: attr2.label,
            attr3: attr3.label,
            ...coreContentData
        };

        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/custom.hbs`, data);
    }

    static async mountContentSimplifiedRoll(params) {
        const { rolls, modifiers, difficulty, critic, half, havePerseverance } = params;

        const diceResults = this.#getDiceResults(rolls);

        const result = this.#verifyResultRoll(
            diceResults.overload, diceResults.default, modifiers.specialist, difficulty, critic, modifiers.automatic
        );

        const name = params.name || params.abilityInfo.label;
        const formule = (diceResults.overload?.length || 0) + (diceResults.default?.length || 0)

        const coreContentData = this.mountCoreInformationRoll(diceResults, result, difficulty, critic, half, modifiers, havePerseverance, formule);

        const data = {
            testName: name,
            haveResult: result.result > 0,
            ...coreContentData,
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/simplified.hbs`, data);
    }

    static async mountContentByAmountRoll(params) {
        const { name, amount, rolls, difficulty, critic, half, modifiers, havePerseverance } = params;
        const { automatic, specialist } = modifiers;

        const diceResults = this.#getDiceResults(rolls);

        const result = this.#verifyResultRoll(
            diceResults.overload, diceResults.default, specialist, difficulty, critic, automatic
        );

        const formule = `${amount}D10`;

        const coreContentData = this.mountCoreInformationRoll(diceResults, result, difficulty, critic, half, modifiers, havePerseverance, formule);

        const data = {
            testName: name,
            haveResult: result.result > 0,
            ...coreContentData,
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/simplified.hbs`, data);
    }

    static #verifyResultRoll(dicesOverload = [], dicesDefault = [], specialist = false, difficulty = 6, critic = 10, automatic = 0) {
        const { result, criticalOverload, failureOverload } = CoreRollMethods.calculateSuccess(
            dicesOverload, dicesDefault, specialist, difficulty, critic, automatic
        );
        const message = this.#mountResultMessageInfos(result, criticalOverload, failureOverload);
        return { result, message };
    }

    static #mountResultMessageInfos(resultSuccess, criticalOverload, failureOverload) {
        if (resultSuccess > 0) {
            return {
                message: criticalOverload ? `${localize('Sucesso_Explosivo').toUpperCase()}!` : localize('Sucesso'),
                classes: criticalOverload ? "S0-overload S0-success" : "S0-success"
            };
        }

        if (resultSuccess < 0) {
            return {
                message: failureOverload ? localize('Falha_Caotica').toUpperCase() : localize('Falha_Critica'),
                classes: failureOverload ? "S0-overload S0-critical-failure" : "S0-critical-failure"
            };
        }

        return {
            message: localize('Falha'),
            classes: "S0-failure"
        };
    }

    static #getDiceResults(paramRolls) {
        return {
            overload: paramRolls.overload.values,
            default: paramRolls.default.values
        };
    }

    static #getAutomaticFromModifiers(modifiers) {
        let automatic = 0;
        if (modifiers) {
            automatic += modifiers.automatic || 0;
            automatic += modifiers.weapon?.true_damage || 0;
        }
        return automatic;
    }

    static mountCoreInformationRoll(diceResults, result, difficulty, critic, half, modifiers, havePerseverance, formule) {
        const overloadDices = (diceResults.overload || []).flat();
        const defaultDices = (diceResults.default || []).flat();
        const haveResult = (overloadDices.length + defaultDices.length) > 0;

        const safeDifficulty = difficulty || 6;
        const safeCritic = critic || 10;
        const safeHalf = (half == true) || false;

        const canUsePerseverance = diceResults.default.length > 0 && (havePerseverance || false);

        return {
            formule: formule,

            haveResult: haveResult,
            overloadValues: overloadDices,
            defaultValues: defaultDices,

            resultMessageClasses: result.message.classes,
            resultMessage: result.message.message,
            resultValue: result.result,

            canUsePerseverance: canUsePerseverance,

            difficulty: safeDifficulty,
            critic: safeCritic,
            half: safeHalf,

            specialist: modifiers.specialist || false,
            penalty: modifiers.penalty || 0,
            bonus: modifiers.bonus || 0,
            automatic: modifiers.automatic || 0,
            weapon: modifiers.weapon,
        }
    }
}

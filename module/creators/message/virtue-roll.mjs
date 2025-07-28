import { keyJsonToKeyLang, localize } from "../../../scripts/utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class RollVirtueMessageCreator {
    static async mountContent(params) {
        const { roll: { values }, virtues: { virtue1, virtue2 }, modifiers } = params.resultRoll;
        const difficulty = params.difficulty;

        const successes = this.#calculateSuccess(values, difficulty, modifiers.automatic);
        const isSuccess = successes > 0;

        let message = localize('Falha');
        let classResult = 'S0-failure';
        if (isSuccess) {
            message = localize('Sucesso');
            classResult = `S0-success`;
        }

        const data = {
            virtue1: keyJsonToKeyLang(virtue1.label),
            virtue2: keyJsonToKeyLang(virtue2.label),
            formule: `${virtue1.value} + ${virtue2.value}`,
            diceValues: values,
            bonus: modifiers.bonus,
            penalty: modifiers.penalty,
            automatic: modifiers.automatic,
            difficulty: difficulty,
            resultMessage: message,
            resultValue: successes,
            resultMessageClasses: classResult
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/virtue.hbs`, data);
    }

    static #calculateSuccess(values, difficulty, automatic) {
        let successess = 0;
        for (const value of values) {
            if (value >= difficulty) {
                successess++;
            }
        }
        return successess + automatic;
    }
}
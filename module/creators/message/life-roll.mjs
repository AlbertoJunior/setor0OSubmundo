import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class RollLifeMessageCreator {
    static async mountContent(params) {
        const { life, values, success, missed } = params;
        const isSuccess = missed <= 0;
        const colorValue = 70 - ((values[0]-1) * 15);
        const data = {
            life: life,
            colorValue: colorValue,
            diceValues: values,
            resultMessage: isSuccess ? localize('Sucesso') : localize('Falha'),
            resultValue: success,
            resultMessageClasses: isSuccess ? `S0-success` : 'S0-failure'
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/life.hbs`, data);
    }
}
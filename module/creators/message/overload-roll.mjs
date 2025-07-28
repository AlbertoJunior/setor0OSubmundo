import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class RollOverloadMessageCreator {
    static async mountContent(params) {
        const { core, values, success, missed } = params;
        const isSuccess = missed <= 0;
        const data = {
            core: core,
            diceValues: values,
            resultMessage: isSuccess ? localize('Sucesso') : localize('Falha'),
            resultValue: success,
            resultMessageClasses: isSuccess ? `S0-success` : 'S0-critical-failure'
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/overload.hbs`, data);
    }
}
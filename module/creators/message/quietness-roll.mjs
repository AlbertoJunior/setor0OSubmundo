import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { RollMessageCreator } from "./roll-mesage.mjs";

export class RollQuietnessMessageCreator {
    static async mountContent(params) {
        const {
            canUsePerseverance = false,
            canUseQuietness = false,
            overloadValues = [],
            values,
            removedValues,
            specialist,
            difficulty,
            critic,
            automatic
        } = params;
        
        const resultRoll = RollMessageCreator.verifyResultRoll([], values, specialist, difficulty, critic, automatic);

        const data = {
            title: localize('Quietude'),
            diceValues: values,
            resultMessage: resultRoll.message.message,
            resultMessageClasses: resultRoll.message.classes,
            removedDiceValues: removedValues,
            resultValue: resultRoll.result,
            canUsePerseverance: canUsePerseverance,
            canUseQuietness: canUseQuietness
        };

        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/perseverance.hbs`, data);
    }
}
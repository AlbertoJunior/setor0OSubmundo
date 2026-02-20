import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { RollMessageCreator } from "./roll-mesage.mjs";

export class RollConsciousnessMessageCreator {
  static async mountContent(params) {
    const {
      values,
      newValues,
      specialist,
      difficulty,
      critic,
      automatic
    } = params;

    const combinedValues = [...values, ...newValues];
    const resultRoll = RollMessageCreator.verifyResultRoll([], combinedValues, specialist, difficulty, critic, automatic);

    const data = {
      title: localize('Consciencia'),
      diceValues: values,
      newDiceValues: newValues,
      resultMessage: resultRoll.message.message,
      resultMessageClasses: resultRoll.message.classes,
      resultValue: resultRoll.result
    };

    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/consciousness.hbs`, data);
  }
}

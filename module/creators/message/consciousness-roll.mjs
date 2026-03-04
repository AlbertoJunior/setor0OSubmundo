import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class RollConsciousnessMessageCreator {
  static async mountContent(params) {
    const {
      values,
      newValues,
      difficulty,
      automatic,
      successes
    } = params;

    debugger
    const mountedMessage = this.#mountMessage(successes);

    const data = {
      title: localize('Consciencia'),
      automatic: automatic,
      diceValues: values,
      difficulty: difficulty,
      newDiceValues: newValues,
      resultMessage: mountedMessage.message,
      resultMessageClasses: mountedMessage.classes,
      firstRollResult: successes.first,
      secondRollResult: successes.second,
      resultValue: successes.total,
    };

    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/roll/consciousness.hbs`, data);
  }

  static #mountMessage(successes) {
    let message = localize('Falha')
    let classes = "S0-failure"

    if (successes.total > 0) {
      message = localize('Sucesso')
      classes = "S0-success"
    }

    return {
      message: message,
      classes: classes,
    }
  }
}

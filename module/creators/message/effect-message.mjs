import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class EffectMessageCreator {
  static async mountContent(params) {
    const data = {
      ...params,
    };
    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/effects/effect.hbs`, data);
  }
}

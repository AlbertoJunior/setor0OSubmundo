import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class TraitMessageCreator {
    static async mountContent(params) {
        const data = {
            ...params,
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/trait.hbs`, data);
    }
}
import { TEMPLATES_PATH } from "../../constants.mjs";
import { EnhancementInfoParser } from "../../core/enhancement/enhancement-info.mjs";
import { EnhancementRepository } from "../../repository/enhancement-repository.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class EnhancementMessageCreator {
    static #pathTemplates = `${TEMPLATES_PATH}/messages/enhancement`;

    static async getFamily(effect) {
        return EnhancementRepository.getEnhancementFamilyByEffectId(effect.id)
    }

    static async mountContentInfo(effect) {
        const family = await this.getFamily(effect);

        const data = {
            family: family.name,
            name: effect.name,
            level: effect.level,
            overload: EnhancementInfoParser.overloadValueToString(effect.overload),
            duration: EnhancementInfoParser.durationValueToString(effect.duration),
            description: effect.description,
        };
        return await FoundryApi.renderTemplate(`${this.#pathTemplates}/enhancement-information.hbs`, data);
    }

    static async mountContentActiveDeactive(effect, status) {
        const family = await this.getFamily(effect);

        const data = {
            family: family.name,
            name: effect.name,
            status: status,
        };
        return await FoundryApi.renderTemplate(`${this.#pathTemplates}/enhancement-active-deactive.hbs`, data);
    }
}
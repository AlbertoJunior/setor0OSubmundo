import { FoundryApi } from "../api/foundry-api.mjs";
import { SYSTEM_ID } from "../constants.mjs";
import { agilityEnhancement } from "../core/enhancement/enhancement-items/agility.mjs";
import { assimilationEnhancement } from "../core/enhancement/enhancement-items/assimilation.mjs";
import { brutalityEnhancement } from "../core/enhancement/enhancement-items/brutality.mjs";
import { hardnessEnhancement } from "../core/enhancement/enhancement-items/hardness.mjs";
import { influenceEnhancement } from "../core/enhancement/enhancement-items/influence.mjs";
import { invisibilityEnhancement } from "../core/enhancement/enhancement-items/invisibility.mjs";
import { mutationEnhancement } from "../core/enhancement/enhancement-items/mutation.mjs";

export class EnhancementRepository {
    static #enhancements = [
        agilityEnhancement,
        assimilationEnhancement,
        brutalityEnhancement,
        influenceEnhancement,
        invisibilityEnhancement,
        mutationEnhancement,
        hardnessEnhancement,
    ];

    static #loadedFromPack = [];

    static async _loadFromPack() {
        const compendium = await game.packs.get(`${SYSTEM_ID}.enhancements`)?.getDocuments();
        if (compendium) {
            EnhancementRepository.#loadedFromPack = compendium.map((item) => {
                return {
                    id: item._id,
                    name: item.name,
                    value: item.value,
                    effects: item.effects
                };
            });
        }
    }

    static getItems() {
        return [
            ...EnhancementRepository.#enhancements,
            ...EnhancementRepository.#loadedFromPack
        ].sort((a, b) => a.name.localeCompare(b.name));
    }

    static getEnhancementById(enhancementId) {
        if (enhancementId) {
            const fetchedEnhancement = this.getItems().filter(item => item.id == enhancementId)[0];
            if (fetchedEnhancement) {
                return fetchedEnhancement;
            }
        }
        return undefined;
    }

    static getEnhancementEffectsByEnhancementId(enhancementId) {
        if (enhancementId) {
            const fetchedLevels = this.getEnhancementById(enhancementId)?.effects;
            if (fetchedLevels) {
                return [...fetchedLevels];
            }
        }
        return [];
    }

    static getEnhancementEffectById(effectId, enhancementId) {
        if (!effectId)
            return null;

        if (enhancementId) {
            return this.getEnhancementById(enhancementId)?.effects.find(ef => ef.id == effectId) || null;
        }

        return this.getItems()
            .flatMap(enhancement => enhancement.effects)
            .find(ef => ef.id == effectId) || null;
    }

    static getEnhancementFamilyByEffectId(effectId) {
        const effect = this.getItems().find(enhancement => enhancement.effects?.some(effect => effect.id == effectId));
        return effect ? FoundryApi.deepClone(effect) : null;
    }

}
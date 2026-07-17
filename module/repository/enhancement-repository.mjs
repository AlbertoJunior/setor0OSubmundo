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
      EnhancementRepository.#cachedItems = null;
    }
  }

  static #cachedItems = null;

  static #getAllItems() {
    if (!this.#cachedItems) {
      this.#cachedItems = [
        ...EnhancementRepository.#enhancements,
        ...EnhancementRepository.#loadedFromPack
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
    return this.#cachedItems;
  }

  static getItems() {
    return FoundryApi.deepClone(this.#getAllItems());
  }

  static getEnhancementById(enhancementId) {
    if (enhancementId) {
      const fetchedEnhancement = this.#getAllItems().find(item => item.id == enhancementId);
      if (fetchedEnhancement) {
        return FoundryApi.deepClone(fetchedEnhancement);
      }
    }
    return undefined;
  }

  static getEnhancementEffectsByEnhancementId(enhancementId) {
    if (enhancementId) {
      const fetchedEnhancement = this.#getAllItems().find(item => item.id == enhancementId);
      const fetchedLevels = fetchedEnhancement?.effects;
      if (fetchedLevels) {
        return FoundryApi.deepClone(fetchedLevels);
      }
    }
    return [];
  }

  static getEnhancementEffectById(effectId, enhancementId) {
    if (!effectId)
      return null;

    let effect = null;

    if (enhancementId) {
      const fetchedEnhancement = this.#getAllItems().find(item => item.id == enhancementId);
      effect = fetchedEnhancement?.effects.find(ef => ef.id == effectId) || null;
    } else {
      effect = this.#getAllItems()
        .flatMap(enhancement => enhancement.effects)
        .find(ef => ef.id == effectId) || null;
    }

    return effect ? FoundryApi.deepClone(effect) : null;
  }

  static getEnhancementFamilyByEffectId(effectId) {
    const effect = this.#getAllItems().find(enhancement => enhancement.effects?.some(effect => effect.id == effectId));
    return effect ? FoundryApi.deepClone(effect) : null;
  }

}
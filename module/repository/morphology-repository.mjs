import { localize } from "../utils/utils.mjs";
import { SYSTEM_ID } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";

export class MorphologyRepository {
  static TYPES = Object.freeze({
    ANDROID: { id: 'androide', label: 'Androide' },
    CYBORG: { id: 'ciborgue', label: 'Ciborgue' },
    HUMAN: { id: 'humano', label: 'Humano' },
    SYNTHETIC: { id: 'sintetico', label: 'Sintetico' },
  });

  static items = Object.values(MorphologyRepository.TYPES);

  static #loadedFromPack = [];

  static async _loadFromPack() {
    const compendium = await game.packs.get(`${SYSTEM_ID}.morphologies`)?.getDocuments();
    if (compendium) {
      MorphologyRepository.#loadedFromPack = compendium.map((item) => {
        return {
          id: item._id,
          label: item.name,
          description: item.description
        };
      });
      MorphologyRepository.#cachedItems = null;
    }
  }

  static #getBaseItems() {
    return [... this.items].map(item => {
      return {
        id: item.id,
        label: localize(item.label)
      }
    });
  }

  static #cachedItems = null;

  static #getAllItems() {
    if (!this.#cachedItems) {
      this.#cachedItems = [
        ...this.#getBaseItems(),
        ...this.#loadedFromPack
      ].sort((a, b) => a.label.localeCompare(b.label));
    }
    return this.#cachedItems;
  }

  static getItems() {
    return FoundryApi.deepClone(this.#getAllItems());
  }
}
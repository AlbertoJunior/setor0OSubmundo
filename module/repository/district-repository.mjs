import { COLORS, SYSTEM_ID } from "../constants.mjs";

export class DistrictRepository {

    static TYPES = Object.freeze({
        COLMEIA: { id: 'colmeia', label: 'Colmeia', color: COLORS.BASE.orange },
        ALFIRAN: { id: 'alfiran', label: 'Alfiran', color: COLORS.BASE.softBlack },
        AMEISEN: { id: 'ameisen', label: 'Ameisen', color: COLORS.BASE.red },
        ARANHAS: { id: 'aranhas', label: 'Aranhas', color: COLORS.BASE.yellow },
        PTITSY: { id: 'ptitsy', label: 'Ptitsy', color: COLORS.BASE.green },
        TOKOJIRAMI: { id: 'tokojirami', label: 'Tokojirami', color: COLORS.BASE.purple },
        VYURA: { id: 'vyura', label: 'Vyura', color: COLORS.BASE.blue },
    });

    static #items = Object.values(DistrictRepository.TYPES);

    static #loadedFromPack = [];

    static async _loadFromPack() {
        const compendium = await game.packs.get(`${SYSTEM_ID}.districts`)?.getDocuments();
        if (compendium) {
            EnhancementRepository.#loadedFromPack = compendium.map((item) => {
                return {
                    id: item._id,
                    label: item.name,
                    description: item.description
                };
            });
        }
    }

    static #getBaseItems() {
        return [... this.#items].filter(district => district != DistrictRepository.TYPES.COLMEIA);
    }

    static getItems() {
        return [... this.#getBaseItems(), ...this.#loadedFromPack].sort((a, b) => a.label.localeCompare(b.label));
    }
}
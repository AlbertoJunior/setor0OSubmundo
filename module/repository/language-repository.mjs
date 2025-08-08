import { SYSTEM_ID } from "../constants.mjs";
import { DistrictRepository } from "./district-repository.mjs";

export class LanguageRepository {
    static #languages = [
        { id: 'domini', label: 'Domini', checked: true, district: DistrictRepository.TYPES.COLMEIA.label, color: DistrictRepository.TYPES.COLMEIA.color },
        { id: 'ameinsprache', label: 'Ameinsprache', district: DistrictRepository.TYPES.AMEISEN.label, color: DistrictRepository.TYPES.AMEISEN.color },
        { id: 'aranhes', label: 'Aranhês', district: DistrictRepository.TYPES.ARANHAS.label, color: DistrictRepository.TYPES.ARANHAS.color },
        { id: 'bantura', label: 'Bantura', district: DistrictRepository.TYPES.VYURA.label, color: DistrictRepository.TYPES.VYURA.color },
        { id: 'kemyura', label: 'Kemyura', district: DistrictRepository.TYPES.VYURA.label, color: DistrictRepository.TYPES.VYURA.color },
        { id: 'dameise', label: 'L\'Ameise', district: DistrictRepository.TYPES.AMEISEN.label, color: DistrictRepository.TYPES.AMEISEN.color },
        { id: 'ptikor', label: 'Ptikor', district: DistrictRepository.TYPES.PTITSY.label, color: DistrictRepository.TYPES.PTITSY.color },
        { id: 'ptisyan', label: 'Ptisyan', district: DistrictRepository.TYPES.PTITSY.label, color: DistrictRepository.TYPES.PTITSY.color },
        { id: 'tokojhae', label: 'Tokojhae', district: DistrictRepository.TYPES.TOKOJIRAMI.label, color: DistrictRepository.TYPES.TOKOJIRAMI.color },
        { id: 'tokuma', label: 'Tokumá', district: DistrictRepository.TYPES.TOKOJIRAMI.label, color: DistrictRepository.TYPES.TOKOJIRAMI.color },
        { id: 'zuarur', label: 'Zu\'arur', district: DistrictRepository.TYPES.ALFIRAN.label, color: DistrictRepository.TYPES.ALFIRAN.color },
    ];

    static #loadedFromPack = [];

    static async _loadFromPack() {
        const compendium = await game.packs.get(`${SYSTEM_ID}.language`)?.getDocuments();
        if (compendium) {
            LanguageRepository.#loadedFromPack = compendium.map((item) => {
                return {
                    id: item._id,
                    label: item.name,
                    district: item.district,
                    checked: item.default
                };
            });
        }
    }

    static getItems() {
        return [... this.#languages, ... this.#loadedFromPack];
    }
}
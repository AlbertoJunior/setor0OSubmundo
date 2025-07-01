import { SYSTEM_ID } from "../constants.mjs";
import { DistrictRepository } from "./district-repository.mjs";

export class LanguageRepository {
    static #languages = [
        { id: 'domini', label: 'Domini', checked: true, district: DistrictRepository.TYPES.COLMEIA.label, color: '#ed7d31' },
        { id: 'ameinsprache', label: 'Ameinsprache', district: DistrictRepository.TYPES.AMEISEN.label, color: '#c00000' },
        { id: 'aranhes', label: 'Aranhês', district: DistrictRepository.TYPES.ARANHAS.label, color: '#ffd965' },
        { id: 'bantura', label: 'Bantura', district: DistrictRepository.TYPES.VYURA.label, color: '#2e75b5' },
        { id: 'kemyura', label: 'Kemyura', district: DistrictRepository.TYPES.VYURA.label, color: '#2e75b5' },
        { id: 'dameise', label: 'L\'Ameise', district: DistrictRepository.TYPES.AMEISEN.label, color: '#c00000' },
        { id: 'ptikor', label: 'Ptikor', district:  DistrictRepository.TYPES.PTITSY.label, color: '#548135' },
        { id: 'ptisyan', label: 'Ptisyan', district:  DistrictRepository.TYPES.PTITSY.label, color: '#548135' },
        { id: 'tokojhae', label: 'Tokojhae', district:  DistrictRepository.TYPES.TOKOJIRAMI.label, color: '#7030a0' },
        { id: 'tokuma', label: 'Tokumá', district:  DistrictRepository.TYPES.TOKOJIRAMI.label, color: '#7030a0' },
        { id: 'zuarur', label: 'Zu\'arur', district:  DistrictRepository.TYPES.ALFIRAN.label, color: '#262626' },
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
import { SYSTEM_ID } from "../constants.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";

export class RepertoryRepository {
  static items = [
    { id: CharacteristicType.REPERTORY.ALLIES.id, label: 'S0.Aliados' },
    { id: CharacteristicType.REPERTORY.ARSENAL.id, label: 'S0.Arsenal' },
    { id: CharacteristicType.REPERTORY.INFORMANTS.id, label: 'S0.Informantes' },
    { id: CharacteristicType.REPERTORY.RESOURCES.id, label: 'S0.Recursos' },
    { id: CharacteristicType.REPERTORY.SUPEREQUIPMENTS.id, label: 'S0.SuperEquipamentos' }
  ];

  static #loadedFromPack = [];

  static async _loadFromPack() {
    const compendium = await game.packs.get(`${SYSTEM_ID}.repertories`)?.getDocuments();
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

  static getItems() {
    return [... this.items, ...this.#loadedFromPack].sort((a, b) => a.label.localeCompare(b.label));
  }
}
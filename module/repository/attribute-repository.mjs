import { FoundryApi } from "../api/foundry-api.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";

export class AttributeRepository {
  static #characteristics = [
    { id: CharacteristicType.ATTRIBUTES.STRENGTH.id, label: 'S0.Forca' },
    { id: CharacteristicType.ATTRIBUTES.DEXTERITY.id, label: 'S0.Destreza' },
    { id: CharacteristicType.ATTRIBUTES.STAMINA.id, label: 'S0.Vigor' },
    { id: CharacteristicType.ATTRIBUTES.PERCEPTION.id, label: 'S0.Percepcao' },
    { id: CharacteristicType.ATTRIBUTES.CHARISMA.id, label: 'S0.Carisma' },
    { id: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id, label: 'S0.Inteligencia' }
  ];

  static getItems() {
    return FoundryApi.deepClone(AttributeRepository.#characteristics);
  }
}
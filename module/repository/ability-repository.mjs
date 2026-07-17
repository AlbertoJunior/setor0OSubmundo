import { FoundryApi } from "../api/foundry-api.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";

export class AbilityRepository {
  static #characteristics = [
    { id: CharacteristicType.SKILLS.MELEE.id, label: 'S0.Armas_Brancas' },
    { id: CharacteristicType.SKILLS.PROJECTILE.id, label: 'S0.Armas_De_Projecao' },
    { id: CharacteristicType.SKILLS.ATHLETICS.id, label: 'S0.Atletismo' },
    { id: CharacteristicType.SKILLS.BRAWL.id, label: 'S0.Briga' },
    { id: CharacteristicType.SKILLS.ENGINEERING.id, label: 'S0.Engenharia' },
    { id: CharacteristicType.SKILLS.EXPRESSION.id, label: 'S0.Expressao' },
    { id: CharacteristicType.SKILLS.FURTIVITY.id, label: 'S0.Furtividade' },
    { id: CharacteristicType.SKILLS.HACKING.id, label: 'S0.Hacking' },
    { id: CharacteristicType.SKILLS.INVESTIGATION.id, label: 'S0.Investigacao' },
    { id: CharacteristicType.SKILLS.MEDICINE.id, label: 'S0.Medicina' },
    { id: CharacteristicType.SKILLS.STREETWISE.id, label: 'S0.Manha' },
    { id: CharacteristicType.SKILLS.PERFORMANCE.id, label: 'S0.Performance' },
    { id: CharacteristicType.SKILLS.PILOTING.id, label: 'S0.Pilotagem' },
    { id: CharacteristicType.SKILLS.CHEMISTRY.id, label: 'S0.Quimica' },
  ];

  static getItems() {
    return FoundryApi.deepClone(AbilityRepository.#characteristics)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  static getItem(id) {
    const item = AbilityRepository.#characteristics.find(item => item.id == id);
    return item ? FoundryApi.deepClone(item) : null;
  }
}
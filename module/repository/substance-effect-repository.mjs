import { FoundryApi } from "../api/foundry-api.mjs";
import { ActiveEffectsTypes } from "../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";
import { StandardEffectField } from "../field/effect-fields.mjs";

export class SubstanceEffectRepository {

  static #buff = [
    StandardEffectField.toJson({
      id: '1',
      type: ActiveEffectsTypes.BUFF,
      description: "-1 na Dificuldade para resistir à persuasão",
      changes: [{ key: CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS.system, value: 0 }]
    }),
    StandardEffectField.toJson({
      id: '3',
      type: ActiveEffectsTypes.BUFF,
      description: "+2 Pontos de Movimento",
      changes: [{ key: CharacteristicType.BONUS.PM.system, value: 2 }]
    }),
    StandardEffectField.toJson({
      id: '5',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Quietude",
      changes: [{ key: CharacteristicType.BONUS.VIRTUES.QUIETNESS.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '7',
      type: ActiveEffectsTypes.BUFF,
      description: "-1 de Penalidade por Dano",
      changes: [{ key: CharacteristicType.BONUS.DAMAGE_PENALTY.system, value: -1 }]
    }),
    StandardEffectField.toJson({
      id: '9',
      type: ActiveEffectsTypes.BUFF,
      description: "-1 de Sobrecarga",
      changes: [{ key: CharacteristicType.OVERLOAD.system, value: -1 }]
    }),
    StandardEffectField.toJson({
      id: '11',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Força",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.STRENGTH.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '12',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Destreza",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.DEXTERITY.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '13',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Vigor",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.STAMINA.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '14',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Percepção",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.PERCEPTION.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '15',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Carisma",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.CHARISMA.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '16',
      type: ActiveEffectsTypes.BUFF,
      description: "+1 de Inteligência",
      changes: [{ key: CharacteristicType.BONUS.ATTRIBUTES.INTELLIGENCE.system, value: 1 }]
    }),
  ]

  static #debuff = [
    StandardEffectField.toJson({
      id: '2',
      type: ActiveEffectsTypes.DEBUFF,
      description: "+1 na Dificuldade para resistir à persuasão",
      changes: [{ key: CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS.system, value: 0 }]
    }),
    StandardEffectField.toJson({
      id: '4',
      type: ActiveEffectsTypes.DEBUFF,
      description: "-2 Pontos de Movimento",
      changes: [{ key: CharacteristicType.BONUS.PM.system, value: -2 }]
    }),
    StandardEffectField.toJson({
      id: '6',
      type: ActiveEffectsTypes.DEBUFF,
      description: "-1 de Quietude",
      changes: [{ key: CharacteristicType.BONUS.VIRTUES.QUIETNESS.system, value: -1 }]
    }),
    StandardEffectField.toJson({
      id: '8',
      type: ActiveEffectsTypes.DEBUFF,
      description: "+1 de Penalidade por Dano",
      changes: [{ key: CharacteristicType.BONUS.DAMAGE_PENALTY.system, value: 1 }]
    }),
    StandardEffectField.toJson({
      id: '10',
      type: ActiveEffectsTypes.DEBUFF,
      description: "+1 de Sobrecarga",
      changes: [{ key: CharacteristicType.OVERLOAD.system, value: 1 }]
    }),
  ];

  static #items = [
    ...this.#buff,
    ...this.#debuff,
  ];

  static getItems() {
    return [...SubstanceEffectRepository.#items];
  }

  static getItem(id) {
    const item = this.getItems().find(item => item.id == id);
    return item ? FoundryApi.deepClone(item) : null;
  }
}
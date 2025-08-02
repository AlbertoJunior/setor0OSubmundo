import { FoundryApi } from "../api/foundry-api.mjs";
import { ActiveEffectsTypes } from "../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";
import { SubstanceEffectField } from "../field/equipment-field.mjs";

export class SubstanceEffectRepository {
    static #items = [
        SubstanceEffectField.toJson({
            id: '1',
            type: ActiveEffectsTypes.BUFF,
            description: "-1 na Dificuldade para resistir à persuasão",
            change: { key: CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS.system, value: 0 }
        }),
        SubstanceEffectField.toJson({
            id: '2',
            type: ActiveEffectsTypes.DEBUFF,
            description: "+1 na Dificuldade para resistir à persuasão",
            change: { key: CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS.system, value: 0 }
        }),
        SubstanceEffectField.toJson({
            id: '3',
            type: ActiveEffectsTypes.BUFF,
            description: "+2 Pontos de Movimento",
            change: { key: CharacteristicType.BONUS.PM.system, value: 2 }
        }),
        SubstanceEffectField.toJson({
            id: '4',
            type: ActiveEffectsTypes.DEBUFF,
            description: "-2 Pontos de Movimento",
            change: { key: CharacteristicType.BONUS.PM.system, value: -2 }
        }),
        SubstanceEffectField.toJson({
            id: '5',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Quietude",
            change: { key: CharacteristicType.BONUS.VIRTUES.QUIETNESS.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '6',
            type: ActiveEffectsTypes.DEBUFF,
            description: "-1 de Quietude",
            change: { key: CharacteristicType.BONUS.VIRTUES.QUIETNESS.system, value: -1 }
        }),
        SubstanceEffectField.toJson({
            id: '7',
            type: ActiveEffectsTypes.BUFF,
            description: "-1 de Penalidade por Dano",
            change: { key: CharacteristicType.BONUS.DAMAGE_PENALTY.system, value: -1 }
        }),
        SubstanceEffectField.toJson({
            id: '8',
            type: ActiveEffectsTypes.DEBUFF,
            description: "+1 de Penalidade por Dano",
            change: { key: CharacteristicType.BONUS.DAMAGE_PENALTY.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '9',
            type: ActiveEffectsTypes.BUFF,
            description: "-1 de Sobrecarga",
            change: { key: CharacteristicType.OVERLOAD.system, value: -1 }
        }),
        SubstanceEffectField.toJson({
            id: '10',
            type: ActiveEffectsTypes.DEBUFF,
            description: "+1 de Sobrecarga",
            change: { key: CharacteristicType.OVERLOAD.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '11',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Força",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.STRENGTH.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '12',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Destreza",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.DEXTERITY.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '13',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Vigor",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.STAMINA.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '14',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Percepção",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.PERCEPTION.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '15',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Carisma",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.CHARISMA.system, value: 1 }
        }),
        SubstanceEffectField.toJson({
            id: '16',
            type: ActiveEffectsTypes.BUFF,
            description: "+1 de Inteligência",
            change: { key: CharacteristicType.BONUS.ATTRIBUTES.INTELLIGENCE.system, value: 1 }
        }),
    ];

    static getItems() {
        return [...SubstanceEffectRepository.#items];
    }

    static getItem(id) {
        const item = this.getItems().find(item => item.id == id);
        return item ? FoundryApi.deepClone(item) : null;
    }
}
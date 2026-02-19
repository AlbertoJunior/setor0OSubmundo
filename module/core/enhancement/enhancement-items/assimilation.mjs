import { ICONS_PATH } from "../../../constants.mjs";
import { RollTestField } from "../../../field/roll-test-field.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EffectChangeValueType, EnhancementDuration, EnhancementOverload } from "../../../enums/enhancement-enums.mjs";
import { EnhancementEffectField } from "../../../field/enhancement-field.mjs";

const enhancementID = '2';

const assimilationEffects = [
  EnhancementEffectField.toJson(
    '9',
    'Aguçar Sentidos',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    [],
    [
      { key: CharacteristicType.BONUS.ATTRIBUTES.PERCEPTION.system, value: 0, typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL },
    ]
  ),
  EnhancementEffectField.toJson(
    '10',
    'Hiper-Visão Cibernética',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    [],
    [],
    [
      RollTestField.toJson(
        {
          name: "Perceber Camuflagem",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.INVESTIGATION.id,
          difficulty: 6,
        }
      ),
      RollTestField.toJson(
        {
          name: "(Rede) Perceber Camuflagem",
          primary_attribute: CharacteristicType.VIRTUES.CONSCIOUSNESS.id,
          secondary_attribute: CharacteristicType.ENHANCEMENT.id,
          special_secondary: enhancementID,
          difficulty: 6,
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '11',
    'Simulação',
    2,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.PASSIVE,
    ['9', '10']
  ),
  EnhancementEffectField.toJson(
    '12',
    'Debug',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.USE,
    ['11'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Identificar",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.INVESTIGATION.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '13',
    'Proxy',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['11'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Hackear Sistema",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.HACKING.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Hackear Aprimoramento",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.HACKING.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '14',
    'Ponto de Acesso',
    4,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['12', '13'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Compartilhar Sentidos",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.HACKING.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Ilusão",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.HACKING.id,
          difficulty: 8
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '15',
    'Criar Gatilhos',
    4,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['12', '13'],
    [
      { key: CharacteristicType.BONUS.ATTRIBUTES.INTELLIGENCE.system, value: 0, typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL },
    ],
    [
      RollTestField.toJson(
        {
          name: "Simular Alvo",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.INVESTIGATION.id,
          difficulty: 6
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '16',
    'Onipresença',
    5,
    EnhancementOverload.ONE_FIXED_ONE_TEST,
    EnhancementDuration.TIME,
    ['14', '15'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Compreensão Total",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.INVESTIGATION.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '17',
    'Dedução e Indução Mental',
    5,
    EnhancementOverload.ONE_FIXED_ONE_TEST,
    EnhancementDuration.TIME,
    ['14', '15'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Invadir Memória",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.HACKING.id,
          difficulty: 7
        }
      ),
    ]
  )
];

export const assimilationEnhancement = {
  id: enhancementID,
  name: 'Assimilação',
  value: 'assimilacao',
  icon: `${ICONS_PATH}/assimilation.svg`,
  effects: assimilationEffects
};
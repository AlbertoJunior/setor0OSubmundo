import { ICONS_PATH } from "../../../constants.mjs";
import { RollTestField } from "../../../field/roll-test-field.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EnhancementDuration, EnhancementOverload } from "../../../enums/enhancement-enums.mjs";
import { EnhancementEffectField } from "../../../field/enhancement-field.mjs";

const mutationEffects = [
  EnhancementEffectField.toJson(
    '41',
    'Arma Corporal',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.TIME,
    [],
    [],
    [
      RollTestField.toJson(
        {
          name: "Ocultar Armas",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '42',
    'Fundir',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.TIME,
    [],
    [],
    [
      RollTestField.toJson(
        {
          name: "Maleabilizar Corpo",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '43',
    'Regeneração',
    2,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.USE,
    ['42'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Regenerar Orgânico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Regenerar Robótico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.ENGINEERING.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '44',
    'Resistência à toxinas',
    2,
    EnhancementOverload.NONE,
    EnhancementDuration.PASSIVE,
    ['41', '42']
  ),
  EnhancementEffectField.toJson(
    '45',
    'Anatomia',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.USE,
    ['44', '43'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Identificar Fraqueza Orgânico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Identificar Fraqueza Robótico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.ENGINEERING.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Analisar Orgânico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 7
        }
      ),
      RollTestField.toJson(
        {
          name: "Analisar Robótico",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.ENGINEERING.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '46',
    'Peçonhento',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.USE,
    ['44'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Expelir",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.CHEMISTRY.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '47',
    'Incorpóreo',
    4,
    EnhancementOverload.TWO_TESTED,
    EnhancementDuration.PASSIVE,
    ['45', '46']
  ),
  EnhancementEffectField.toJson(
    '48',
    'Simbiose',
    4,
    EnhancementOverload.TWO_TESTED,
    EnhancementDuration.TIME,
    ['45', '46'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Possuir (Voluntário)",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 6
        }
      ),
      RollTestField.toJson(
        {
          name: "Possuir (Forçado)",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.MEDICINE.id,
          difficulty: 8
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '49',
    'Imortalidade',
    5,
    EnhancementOverload.ONE_FIXED,
    EnhancementDuration.TIME,
    ['47', '48'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Ativar no Reflexo",
          primary_attribute: CharacteristicType.ATTRIBUTES.STAMINA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.PERCEPTION.id,
          ability: CharacteristicType.SKILLS.INVESTIGATION.id,
          difficulty: 7
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '50',
    'Aprimorar',
    5,
    EnhancementOverload.NONE,
    EnhancementDuration.PASSIVE,
    ['47', '48'],
    [],
    []
  )
];

export const mutationEnhancement = {
  id: '6',
  name: 'Mutação',
  value: 'mutacao',
  icon: `${ICONS_PATH}/mutation.svg`,
  effects: mutationEffects
};
import { ICONS_PATH } from "../../../constants.mjs";
import { RollTestField } from "../../../data/field/roll-test-field.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EffectChangeValueType, EnhancementDuration, EnhancementOverload } from "../../../enums/enhancement-enums.mjs";
import { EnhancementEffectField } from "../../../data/field/enhancement-field.mjs";
import { ActiveEffectsUtils } from "../../effect/active-effects-utils.mjs";

const invisibilityEffects = [
  EnhancementEffectField.toJson(
    '33',
    'Esconder',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    [],
    [],
    [
      RollTestField.toJson(
        {
          name: "Manter Esconder",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.CHARISMA.id,
          ability: CharacteristicType.SKILLS.FURTIVITY.id,
          difficulty: 6
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '34',
    'Supressão de Ruídos',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    []
  ),
  EnhancementEffectField.toJson(
    '35',
    'Silenciar',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    []
  ),
  EnhancementEffectField.toJson(
    '36',
    'Camuflagem',
    2,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['33', '34', '35'],
    [
      {
        key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        otherValue: "#55C8FA",
        typeOfValue: EffectChangeValueType.OTHER_VALUE,
        priority: 20
      },
    ],
    [
      RollTestField.toJson(
        {
          name: "Manter Camuflagem",
          primary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.CHARISMA.id,
          ability: CharacteristicType.SKILLS.FURTIVITY.id,
          difficulty: 6
        }
      ),
    ]
  ),
  EnhancementEffectField.toJson(
    '37',
    'Fantasma',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['36'],
  ),
  EnhancementEffectField.toJson(
    '38',
    'Um na multidão',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['36']
  ),
  EnhancementEffectField.toJson(
    '39',
    'Desaparecer',
    4,
    EnhancementOverload.ONE_TESTED_EFFECT_COST,
    EnhancementDuration.SCENE,
    ['37', '38']
  ),
  EnhancementEffectField.toJson(
    '40',
    'Incógnito',
    5,
    EnhancementOverload.ONE_FIXED,
    EnhancementDuration.SCENE,
    ['39']
  )
];

export const invisibilityEnhancement = {
  id: '5',
  name: 'Invisibilidade',
  value: 'invisibilidade',
  maximumAllowed: 1,
  icon: `${ICONS_PATH}/invisibility.svg`,
  effects: invisibilityEffects
};
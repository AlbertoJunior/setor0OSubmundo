import { ICONS_PATH } from "../../../constants.mjs";
import { RollTestField } from "../../../data/field/roll-test-field.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EffectChangeValueType, EnhancementDuration, EnhancementOverload } from "../../../enums/enhancement-enums.mjs";
import { EnhancementEffectField } from "../../../data/field/enhancement-field.mjs";
import { ActiveEffectsUtils } from "../../effect/active-effects-utils.mjs";

const influenceEffects = [
  EnhancementEffectField.toJson(
    '25',
    'Encantar',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    [],
    [
      { key: CharacteristicType.BONUS.ATTRIBUTES.CHARISMA.system, value: 0, typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL },
      {
        key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        otherValue: "#F0A0FF",
        typeOfValue: EffectChangeValueType.OTHER_VALUE,
        priority: 20
      },
    ]
  ),
  EnhancementEffectField.toJson(
    '26',
    'Apavorar',
    1,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    [],
    [
      { key: CharacteristicType.BONUS.ATTRIBUTES.CHARISMA.system, value: 0, typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL },
      {
        key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        otherValue: "#FA7D55",
        typeOfValue: EffectChangeValueType.OTHER_VALUE,
        priority: 20
      },
    ]
  ),
  EnhancementEffectField.toJson(
    '27',
    'Vício',
    2,
    EnhancementOverload.NONE,
    EnhancementDuration.SCENE,
    ['25', '26']
  ),
  EnhancementEffectField.toJson(
    '28',
    'Mesmerizar',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.SCENE,
    ['27'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Mesmerizar",
          primary_attribute: CharacteristicType.ATTRIBUTES.CHARISMA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.EXPRESSION.id,
          difficulty: 6
        }
      ),
    ],
  ),
  EnhancementEffectField.toJson(
    '29',
    'Esquecimento',
    3,
    EnhancementOverload.ONE_TESTED,
    EnhancementDuration.USE,
    ['27'],
    [],
    [
      RollTestField.toJson(
        {
          name: "Modificar Memória",
          primary_attribute: CharacteristicType.ATTRIBUTES.CHARISMA.id,
          secondary_attribute: CharacteristicType.ATTRIBUTES.INTELLIGENCE.id,
          ability: CharacteristicType.SKILLS.PERFORMANCE.id,
          difficulty: 7
        }
      ),
    ],
  ),
  EnhancementEffectField.toJson(
    '30',
    'Magnetismo',
    4,
    EnhancementOverload.ONE_TESTED_EFFECT_COST,
    EnhancementDuration.SCENE,
    ['28', '29']
  ),
  EnhancementEffectField.toJson(
    '31',
    'Racionalizar',
    4,
    EnhancementOverload.ONE_FIXED,
    EnhancementDuration.USE,
    ['28', '29']
  ),
  EnhancementEffectField.toJson(
    '32',
    'Divindade',
    5,
    EnhancementOverload.ONE_FIXED_ONE_TEST,
    EnhancementDuration.SCENE,
    ['30', '31'],
    [
      {
        key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        otherValue: "#FFDC00",
        typeOfValue: EffectChangeValueType.OTHER_VALUE,
        priority: 20
      },
    ]
  )
];

export const influenceEnhancement = {
  id: '4',
  name: 'Indução',
  value: 'inducao',
  icon: `${ICONS_PATH}/influence.svg`,
  effects: influenceEffects
};
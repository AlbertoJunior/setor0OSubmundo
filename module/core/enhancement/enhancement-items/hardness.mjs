import { ICONS_PATH } from "../../../constants.mjs";
import { RollTestField } from "../../../data/field/roll-test-field.mjs";
import { BaseActorCharacteristicType, CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EffectChangeValueType, EnhancementDuration, EnhancementOverload } from "../../../enums/enhancement-enums.mjs";
import { EnhancementEffectField } from "../../../data/field/enhancement-field.mjs";
import { ActiveEffectsUtils } from "../../effect/active-effects-utils.mjs";

const hardness1 = EnhancementEffectField.toJson(
  '400',
  'Resiliência',
  1,
  EnhancementOverload.NONE,
  EnhancementDuration.PASSIVE,
  [],
  [
    {
      key: BaseActorCharacteristicType.VITALITY.TOTAL.system,
      value: 0,
      priority: 300,
      typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL
    },
  ]
);

const hardness2 = EnhancementEffectField.toJson(
  '401',
  'Dureza',
  2,
  EnhancementOverload.ONE_TESTED,
  EnhancementDuration.SCENE,
  [hardness1.id],
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
)

const hardness3 = EnhancementEffectField.toJson(
  '402',
  'Pele de Aço',
  3,
  EnhancementOverload.ONE_TESTED,
  EnhancementDuration.SCENE,
  [hardness2.id],
  [
    {
      key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
      mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
      otherValue: "#FF0200",
      typeOfValue: EffectChangeValueType.OTHER_VALUE,
      priority: 200
    },
  ]
)

const hardness4 = EnhancementEffectField.toJson(
  '403',
  'Inquebrável',
  4,
  EnhancementOverload.ONE_FIXED,
  EnhancementDuration.SCENE,
  [hardness3.id]
)

const hardness5 = EnhancementEffectField.toJson(
  '404',
  'Troco',
  4,
  EnhancementOverload.ONE_FIXED,
  EnhancementDuration.SCENE,
  [hardness3.id]
)

const hardness6 = EnhancementEffectField.toJson(
  '405',
  'Proeza da Dor',
  5,
  EnhancementOverload.ONE_FIXED,
  EnhancementDuration.SCENE,
  [hardness4.id, hardness5.id],
  [
    {
      key: CharacteristicType.BONUS.DAMAGE_PENALTY.system,
      value: -99,
      priority: 300,
      typeOfValue: EffectChangeValueType.FIXED
    },
  ]
)

const hardness7 = EnhancementEffectField.toJson(
  '406',
  'Última Chance',
  5,
  EnhancementOverload.NONE,
  EnhancementDuration.PASSIVE,
  [hardness4.id, hardness5.id],
)

const hardnessEffects = [
  hardness1,
  hardness2,
  hardness3,
  hardness4,
  hardness5,
  hardness6,
  hardness7,
];

export const hardnessEnhancement = {
  id: '7',
  name: 'Rigidez',
  value: 'rigidez',
  icon: `${ICONS_PATH}/hardness.svg`,
  effects: hardnessEffects
};
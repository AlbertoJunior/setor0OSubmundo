export const EnhancementDuration = Object.freeze({
  PASSIVE: 0,
  SCENE: 1,
  USE: 2,
  TIME: 3,
});

export const EnhancementOverload = Object.freeze({
  NONE: 0,
  ONE_TESTED: 1,
  ONE_FIXED: 2,
  TWO_TESTED: 3,
  TWO_FIXED: 4,
  ONE_FIXED_ONE_TEST: 5,
  ONE_TESTED_EFFECT_COST: 6,
});

export const EffectChangeValueType = Object.freeze({
  FIXED: 0,
  ENHANCEMENT_LEVEL: 1,
  HALF_ENHANCEMENT_LEVEL: 2,
  ENHANCEMENT_LEVEL_PLUS_FIXED: 3,
  HALF_ENHANCEMENT_LEVEL_PLUS_FIXED: 4,
  OTHER_VALUE: 6,
});
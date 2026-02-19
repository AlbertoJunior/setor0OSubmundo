export const ActiveEffectsOriginTypes = Object.freeze({
  ITEM: 1,
  ENHANCEMENT: 2,
  TRAIT: 3,
  OTHER: 4,
  AFFECTED_ENHANCEMENT: 5,
});

export const ActiveEffectsTypes = Object.freeze({
  BUFF: 'Buff',
  DEBUFF: 'Debuff',
});

export const ActiveEffectsFlags = Object.freeze({
  ORIGIN_ID: 'originId',
  ORIGIN_TYPE: 'originType',
  ORIGIN_TYPE_LABEL: 'originTypeLabel',
  TYPE: 'type',
  ALWAYS_SHOW_ON_TOKEN: 'alwaysShowOnToken',
  REMOVE_EFFECTS: 'removeEffects',
  COMBAT_ID: 'combatId',
  IS_PASSIVE: 'isPassive',
  CAN_REMOVE: 'canRemove',
});
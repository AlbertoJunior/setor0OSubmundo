export const ActiveEffectType = Object.freeze({
  DEFAULT: 'Default',
  BASE: 'base',
});

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

export const ActiveEffectsSystem = Object.freeze({
  ORIGIN_ID: { id: 'originId', system: 'system.originId' },
  ORIGIN_TYPE: { id: 'originType', system: 'system.originType' },
  ORIGIN_TYPE_LABEL: { id: 'originTypeLabel', system: 'system.originTypeLabel' },
  TYPE: { id: 'type', system: 'system.type' },
  ALWAYS_SHOW_ON_TOKEN: { id: 'alwaysShowOnToken', system: 'system.alwaysShowOnToken' },
  REMOVE_EFFECTS: { id: 'removeEffects', system: 'system.removeEffects' },
  COMBAT_ID: { id: 'combatId', system: 'system.combatId' },
  IS_PASSIVE: { id: 'isPassive', system: 'system.isPassive' },
  CAN_REMOVE: { id: 'canRemove', system: 'system.canRemove' },
});
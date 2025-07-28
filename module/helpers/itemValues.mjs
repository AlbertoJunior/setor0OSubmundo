import { ActiveEffectsUtils } from "../../module/core/effect/active-effects.mjs";
import { EquipmentUtils } from "../../module/core/equipment/equipment-utils.mjs";
import { EquipmentCharacteristicType } from "../../module/enums/equipment-enums.mjs";
import { getObject } from "../utils/utils.mjs";

const map = {
    'canRoll': (item) => EquipmentUtils.canRoll(item),
    'canEquip': (item) => EquipmentUtils.canEquip(item),
    'canUse': (item) => EquipmentUtils.canUse(item),
    'haveQuantity': (item) => EquipmentUtils.haveQuantity(item),

    'possible_tests': (item) => EquipmentUtils.getPossibleTests(item),
    'default_test': (item) => EquipmentUtils.getDefaultTest(item),

    'equipped': (item) => getObject(item, EquipmentCharacteristicType.EQUIPPED),
    'description': (item) => getObject(item, EquipmentCharacteristicType.DESCRIPTION),
    'range': (item) => getObject(item, EquipmentCharacteristicType.RANGE) || 0,
    'max_range': (item) => getObject(item, EquipmentCharacteristicType.MAX_RANGE) || 0,
    'damage': (item) => getObject(item, EquipmentCharacteristicType.DAMAGE) || 0,
    'damage_type': (item) => getObject(item, EquipmentCharacteristicType.DAMAGE_TYPE) || 0,
    'true_damage': (item) => getObject(item, EquipmentCharacteristicType.TRUE_DAMAGE) || 0,
    'hand': (item) => getObject(item, EquipmentCharacteristicType.HAND) || 0,
    'occultability': (item) => getObject(item, EquipmentCharacteristicType.OCCULTABILITY) || 0,
    'resistance': (item) => getObject(item, EquipmentCharacteristicType.RESISTANCE) || 0,
    'actual_resistance': (item) => getObject(item, EquipmentCharacteristicType.ACTUAL_RESISTANCE) || 0,
    'cadence': (item) => getObject(item, EquipmentCharacteristicType.CADENCE) || 0,
    'capacity': (item) => getObject(item, EquipmentCharacteristicType.CAPACITY) || 0,
    'special': (item) => getObject(item, EquipmentCharacteristicType.SPECIAL) || false,
    'superequipment': (item) => getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT),
    'size': (item) => getObject(item, EquipmentCharacteristicType.SIZE) || 0,
    'acceleration': (item) => getObject(item, EquipmentCharacteristicType.ACCELERATION) || 0,
    'speed': (item) => getObject(item, EquipmentCharacteristicType.SPEED) || 0,
    
    'vehicle_type': (item) => getObject(item, EquipmentCharacteristicType.VEHICLE.TYPE) || 0,

    'superequipment_level': (item) => EquipmentUtils.getSuperEquipmentLevel(item),
    'superequipment_effects_limit': (item) => EquipmentUtils.getSuperEquipmentEffectsLimits(item),
    'superequipment_defects_limit': (item) => EquipmentUtils.getSuperEquipmentDefectsLimits(item),
    'superequipment_needs_activate': (item) => EquipmentUtils.getSuperEquipmentNeedsActivate(item),
    'superequipment_active': (item) => getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE) || false,
    'superequipment_effects': (item) => getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) || [],
    'superequipment_defects': (item) => getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) || [],

    'substance_type': (item) => EquipmentUtils.substanceType(item),
    'substance_effects': (item) => EquipmentUtils.substanceEffects(item),
    'substance_with_effects': (item) => EquipmentUtils.substanceWithEffects(item),
    'substance_with_damage': (item) => EquipmentUtils.substanceWithDamage(item),
    'substance_with_range': (item) => EquipmentUtils.substanceWithRange(item),

    'effect_has_type': (item) => ActiveEffectsUtils.hasType(item),
    'effect_is_buff': (item) => ActiveEffectsUtils.isBuff(item),
    'effect_is_debuff': (item) => ActiveEffectsUtils.isDebuff(item),
}

export default function itemValues(item, value, ...params) {
    params.pop()
    return map[value](item, params);
}
import { getObject } from "../../utils/utils.mjs";
import { EquipmentCharacteristicType, EquipmentType } from "../../enums/equipment-enums.mjs";
import { EquipmentInfoParser } from "./equipment-info.mjs";
import { EquipmentUtils } from "./equipment-utils.mjs";

export class EquipamentDataParser {

  static parse(item) {
    const type = getObject(item, EquipmentCharacteristicType.TYPE);

    const data = {
      name: item.name,
      img: item.img || null,
      itemUuid: item.uuid || null,
      typeLabel: EquipmentInfoParser.parseEquipmentType(type),
      description: getObject(item, EquipmentCharacteristicType.DESCRIPTION) || null,
    };

    if (EquipmentUtils.isWeapon(item)) {
      this.#parseWeapon(item, data);
    }

    if (type === EquipmentType.MELEE) {
      this.#parseMelee(item, data);
    }

    if (type === EquipmentType.PROJECTILE) {
      this.#parseProjectile(item, data);
    }

    if (type === EquipmentType.VEHICLE) {
      this.#parseVehicle(item, data);
    }

    if (type === EquipmentType.SUBSTANCE) {
      this.#parseSubstance(item, data);
    }

    this.#parseResistance(item, data);

    if (EquipmentUtils.isSuperEquipment(item)) {
      this.#parseSuperEquipment(item, data);
    }

    return data;
  }

  static #parseWeapon(item, data) {
    data.damageLabel = true;
    data.damage = getObject(item, EquipmentCharacteristicType.DAMAGE);
    data.trueDamage = getObject(item, EquipmentCharacteristicType.TRUE_DAMAGE);
    data.damageTypeLabel = EquipmentInfoParser.parseDamageType(getObject(item, EquipmentCharacteristicType.DAMAGE_TYPE));
    data.handLabel = EquipmentInfoParser.parseHand(getObject(item, EquipmentCharacteristicType.HAND));
    data.occultabilityLabel = EquipmentInfoParser.parseHidding(getObject(item, EquipmentCharacteristicType.OCCULTABILITY));
  }

  static #parseMelee(item, data) {
    data.sizeLabel = EquipmentInfoParser.parseMeleeSize(getObject(item, EquipmentCharacteristicType.SIZE));
  }

  static #parseProjectile(item, data) {
    data.isProjectile = true;
    data.cadence = getObject(item, EquipmentCharacteristicType.CADENCE);
    data.capacity = getObject(item, EquipmentCharacteristicType.CAPACITY);
    data.range = getObject(item, EquipmentCharacteristicType.RANGE);
    data.special = getObject(item, EquipmentCharacteristicType.SPECIAL);
  }

  static #parseVehicle(item, data) {
    data.isVehicle = true;
    data.vehicleTypeLabel = EquipmentInfoParser.parseVehicle(getObject(item, EquipmentCharacteristicType.VEHICLE.TYPE));
    data.acceleration = getObject(item, EquipmentCharacteristicType.ACCELERATION);
    data.speed = getObject(item, EquipmentCharacteristicType.SPEED);
  }

  static #parseSubstance(item, data) {
    data.isSubstance = true;
    data.substanceTypeLabel = EquipmentInfoParser.parseSubstance(getObject(item, EquipmentCharacteristicType.SUBSTANCE.TYPE));
    data.quantity = getObject(item, EquipmentCharacteristicType.QUANTITY);
  }

  static #parseResistance(item, data) {
    const resistance = getObject(item, EquipmentCharacteristicType.RESISTANCE);
    if (resistance != null && resistance != undefined) {
      data.resistance = resistance;
    }
  }

  static #parseSuperEquipment(item, data) {
    data.isSuperEquipment = true;
    data.superEquipmentLevel = EquipmentUtils.getSuperEquipmentLevel(item);

    const effects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) || [];
    const defects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) || [];

    data.superEffects = effects.map(effect => ({
      cost: effect.cost,
      name: effect.name,
      particularity: effect.particularity?.description || null,
    }));
    data.hasSuperEffects = data.superEffects.length > 0;

    data.superDefects = defects.map(defect => ({
      cost: defect.cost,
      name: defect.name,
      particularity: defect.particularity?.description || null,
    }));
    data.hasSuperDefects = data.superDefects.length > 0;
  }
}

import { gameLocalize, getObject, labelError, localize, localizeType } from "../../utils/utils.mjs";
import { ActiveEffectsTypes } from "../../enums/active-effects-enums.mjs";
import { DamageType, EquipmentCharacteristicType, EquipmentHand, EquipmentHidding, EquipmentType, MeleeSize, SubstanceType, validEquipmentTypes, VehicleType } from "../../enums/equipment-enums.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";

export class EquipmentInfoParser {
  static mappedEquipmentTypes = {
    [EquipmentType.MELEE]: ItemType.MELEE,
    [EquipmentType.PROJECTILE]: ItemType.PROJECTILE,
    [EquipmentType.ARMOR]: ItemType.ARMOR,
    [EquipmentType.VEHICLE]: ItemType.VEHICLE,
    [EquipmentType.SUBSTANCE]: ItemType.SUBSTANCE,
    [EquipmentType.ACESSORY]: ItemType.ACESSORY,
  }

  static equipmentTypeIdToTypeString(type) {
    return EquipmentInfoParser.mappedEquipmentTypes[type];
  }

  static parseEquipmentType(value) {
    const map = this.equipmentTypeIdToTypeString(value);
    return map ? gameLocalize(`TYPES.Item.${map}`) : labelError();
  }

  static parseHidding(value) {
    const map = {
      [EquipmentHidding.POCKET]: `${localize('Itens.Bolso')}`,
      [EquipmentHidding.JACKET]: `${localize('Itens.Jaqueta')}`,
      [EquipmentHidding.NONE]: `${localize('Itens.Inocultavel')}`,
    }
    return map[value] || labelError();
  }

  static parseHand(value) {
    const map = {
      [EquipmentHand.ONE_HAND]: `${localize('Itens.Uma_Mao')}`,
      [EquipmentHand.ONE_HALF_HAND]: `${localize('Itens.Uma_Mao_Meia')}`,
      [EquipmentHand.TWO_HANDS]: `${localize('Itens.Duas_Maos')}`,
    }
    return map[value] || labelError();
  }

  static parseDamageType(value) {
    const map = {
      [DamageType.SUPERFICIAL]: localize('Itens.Superficial'),
      [DamageType.LETAL]: localize('Itens.Letal'),
      [DamageType.ELETRIC]: localize('Itens.Eletrico'),
      [DamageType.FIRE]: localize('Itens.Fogo'),
      [DamageType.ICE]: localize('Itens.Gelo'),
    }
    return map[value] || labelError();
  }

  static parseVehicle(value) {
    const map = {
      [VehicleType.JUNKER]: `${localize('Itens.Lata')}`,
      [VehicleType.ECONOMY]: `${localize('Itens.Popular')}`,
      [VehicleType.UTILITARY]: `${localize('Itens.Utilitario')}`,
      [VehicleType.SPORT]: `${localize('Itens.Esportivo')}`,
      [VehicleType.SUPER_SPORT]: `${localize('Itens.Super_Esportivo')}`,
      [VehicleType.RAW]: `${localize('Itens.Bruto')}`,
      [VehicleType.EXOTIC]: `${localize('Itens.Exotico')}`,
    }
    return map[value] || labelError();
  }

  static parseMeleeSize(value) {
    const map = {
      [MeleeSize.SMALL]: `${localize('Itens.Curta')}`,
      [MeleeSize.MEDIUM]: `${localize('Itens.Media')}`,
      [MeleeSize.LONG]: `${localize('Itens.Grande')}`,
    }
    return map[value] || labelError();
  }

  static parseSubstance(value) {
    const map = {
      [SubstanceType.DRUG]: `${localize('Itens.Droga')}`,
      [SubstanceType.POISON]: `${localize('Itens.Veneno')}`,
      [SubstanceType.ACID]: `${localize('Itens.Acido')}`,
      [SubstanceType.GAS]: `${localize('Itens.Gas')}`,
    }
    return map[value] || labelError();
  }

  static parseSubstanceEffectType(value) {
    const map = {
      [ActiveEffectsTypes.BUFF]: `${localize('Itens.Melhoria')}`,
      [ActiveEffectsTypes.DEBUFF]: `${localize('Itens.Enfraquecimento')}`,
    }
    return map[value] || labelError();
  }

  static getHandTypes() {
    return Object.values(EquipmentHand).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseHand(type)
      }
    });
  }

  static getActorEquipmentTypes() {
    return validEquipmentTypes().map(item => {
      const type = EquipmentInfoParser.equipmentTypeIdToTypeString(item);
      return {
        id: item,
        label: localizeType(`Item.${type}`),
        type: type.toLowerCase(),
      }
    });
  }

  static getOccultabilityTypes() {
    return Object.values(EquipmentHidding).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseHidding(type)
      }
    });
  }

  static getDamageTypes() {
    return Object.values(DamageType).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseDamageType(type)
      }
    });
  }

  static getVehicleTypes() {
    return Object.values(VehicleType).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseVehicle(type)
      }
    });
  }

  static getMeleeSize() {
    return Object.values(MeleeSize).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseMeleeSize(type)
      }
    });
  }

  static getSubstanceTypes() {
    return Object.values(SubstanceType).map(type => {
      return {
        id: type,
        label: EquipmentInfoParser.parseSubstance(type)
      }
    });
  }

  static parseQuantity(item) {
    const quantity = getObject(item, EquipmentCharacteristicType.QUANTITY);

    if (!quantity) {
      return 0;
    }

    if (quantity < 1000) {
      return quantity.toString();
    } else if (quantity < 1_000_000) {
      return (quantity / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (quantity < 1_000_000_000) {
      return (quantity / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
      return (quantity / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
  }
}
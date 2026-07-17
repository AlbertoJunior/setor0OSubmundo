import { getObject, localize } from "../../utils/utils.mjs";
import { ActiveEffectsFlags, ActiveEffectsOriginTypes } from "../../enums/active-effects-enums.mjs";
import { EquipmentCharacteristicType, EquipmentType, SubstanceType, validEquipmentTypes } from "../../enums/equipment-enums.mjs";
import { SuperEquipmentTraitRepository } from "../../repository/superequipment-trait-repository.mjs";
import { ActiveEffectsUtils } from "../effect/active-effects-utils.mjs";
import { EquipmentInfoParser } from "./equipment-info.mjs";

export class EquipmentUtils {
  static getSuperEquipmentEffectsLimits(item) {
    const level = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL) || 0;
    const effects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) || [];
    const defects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) || [];

    const totalEffects = effects.reduce((sum, eff) => sum + (eff.cost || 0), 0);
    const totalDefects = defects.reduce((sum, def) => sum + (def.cost || 0), 0);
    const totalBonus = (level || 1) + totalDefects;

    return `${totalEffects}/${totalBonus}`;
  }

  static canEquip(item) {
    const canEquip = getObject(item, EquipmentCharacteristicType.EQUIPPED);
    return canEquip != undefined && canEquip != null;
  }

  static canUse(item) {
    const quantity = getObject(item, EquipmentCharacteristicType.QUANTITY);
    return quantity > 0;
  }

  static canRoll(item) {
    const possibleTests = getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS);
    return Array.isArray(possibleTests);
  }

  static haveQuantity(item) {
    const haveQuantity = getObject(item, EquipmentCharacteristicType.QUANTITY);
    return haveQuantity != undefined && haveQuantity != null;
  }

  static isWeapon(item) {
    const requiredTypes = [
      EquipmentCharacteristicType.HAND,
      EquipmentCharacteristicType.DAMAGE,
      EquipmentCharacteristicType.TRUE_DAMAGE,
      EquipmentCharacteristicType.DAMAGE_TYPE,
    ];

    return requiredTypes.every(type => {
      const value = getObject(item, type);
      return value !== undefined && value !== null;
    });
  }

  static isEquipment(item) {
    return validEquipmentTypes().includes(getObject(item, EquipmentCharacteristicType.TYPE));
  }

  static isSuperEquipment(item) {
    return Boolean(getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT));
  }

  static getPossibleTests(item) {
    return getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS) || [];
  }

  static getDefaultTest(item) {
    return getObject(item, EquipmentCharacteristicType.DEFAULT_TEST) || '';
  }

  static getSuperEquipmentLevel(item) {
    return getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL) || 0;
  }

  static getSuperEquipmentDefectsLimits(item) {
    const level = this.getSuperEquipmentLevel(item);
    const defects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) || [];
    return `${defects.length}/${Math.max(level - 2, 0)}`;
  }

  static getSuperEquipmentHaveEffects(superEquipment) {
    if (!superEquipment) {
      return false;
    }

    const effects = superEquipment.effects || [];
    const defects = superEquipment.defects || [];
    const totalEffects = effects.length + defects.length;
    return totalEffects > 0;
  }

  static getSuperEquipmentNeedsActivate(item) {
    const traits = this.getSuperEquipmentTraits(item);
    return this.superEquipmentNeedsActivate(traits);
  }

  static getSuperEquipmentTraits(item) {
    const { SUPER_EQUIPMENT } = EquipmentCharacteristicType;
    return [
      ...(getObject(item, SUPER_EQUIPMENT.EFFECTS) || []),
      ...(getObject(item, SUPER_EQUIPMENT.DEFECTS) || [])
    ];
  }

  static superEquipmentNeedsActivate(traitList) {
    const activateTraitIds = new Set(
      SuperEquipmentTraitRepository.getTraitsNeedActivate().map(({ id }) => id)
    );

    return traitList.some(trait => {
      const baseId = trait.id.split('.')[1];
      return activateTraitIds.has(baseId);
    });
  }

  static getSuperEquipmentActiveEffect(item) {
    const allTraits = EquipmentUtils.getSuperEquipmentTraits(item);
    const effects = allTraits.filter(effect => effect.particularity?.change != null);

    if (effects.length <= 0) {
      return null;
    }

    const isPassive = !this.superEquipmentNeedsActivate(allTraits);

    const flags = {
      [ActiveEffectsFlags.ORIGIN_ID]: item.id,
      [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.ITEM,
      [ActiveEffectsFlags.ORIGIN_TYPE_LABEL]: ActiveEffectsUtils.activeEffectOriginTypeLabel(ActiveEffectsOriginTypes.ITEM),
      [ActiveEffectsFlags.IS_PASSIVE]: isPassive,
    };
    const changes = [];

    for (const effect of effects) {
      const particularity = effect.particularity;
      changes.push(
        {
          key: particularity.change.key,
          value: particularity.change.value,
          mode: particularity.change.mode ?? CONST.ACTIVE_EFFECT_MODES.ADD,
        },
      )
    }

    return ActiveEffectsUtils.createEffectData(
      {
        name: item.name,
        origin: localize('SuperEquipamento'),
        statuses: [`${item.id}`],
        duration: isPassive ? null : { startRound: 0, rounds: 99 },
        flags: flags,
        changes: changes
      }
    );
  }

  static substanceType(item) {
    return getObject(item, EquipmentCharacteristicType.SUBSTANCE.TYPE);
  }

  static substanceEffects(item) {
    return getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];
  }

  static substanceWithEffects(item) {
    const substanceType = this.substanceType(item);
    if (substanceType == null || substanceType == undefined) {
      return false;
    }
    return substanceType == SubstanceType.DRUG;
  }

  static substanceWithDamage(item) {
    const substanceType = this.substanceType(item);
    const damageSubstance = [SubstanceType.ACID, SubstanceType.POISON, SubstanceType.GAS];
    return damageSubstance.includes(substanceType);
  }

  static substanceWithRange(item) {
    const substanceType = this.substanceType(item);
    const rangedSubstance = [SubstanceType.GAS];
    return rangedSubstance.includes(substanceType);
  }

  static getSubstanceActiveEffects(item) {
    const effects = getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];
    const originLabel = localize('Substancia');
    const itemId = item.id;
    const itemName = item.name;
    const originTypeLabel = ActiveEffectsUtils.activeEffectOriginTypeLabel(ActiveEffectsOriginTypes.ITEM);
    const allEffects = [];

    for (const effect of effects) {
      const activeEffect = ActiveEffectsUtils.createEffectData({
        origin: originLabel,
        name: `${itemName}: ${effect.description}`,
        description: effect.description,
        statuses: [`${itemId}`],
        duration: { startRound: 0, rounds: 99 },
        changes: effect.changes.map(change => ({
          key: change.key,
          value: change.value,
          mode: change.mode ?? CONST.ACTIVE_EFFECT_MODES.ADD,
        })),
        flags: {
          [ActiveEffectsFlags.ORIGIN_ID]: itemId,
          [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.ITEM,
          [ActiveEffectsFlags.ORIGIN_TYPE_LABEL]: originTypeLabel,
          [ActiveEffectsFlags.TYPE]: effect.type,
        }
      });

      allEffects.push(activeEffect);
    }
    return allEffects;
  }

  static getItemRollInformation(item) {
    if (!item) {
      return undefined;
    }

    const base = {
      name: item.name,
      changes: [
        `${localize('Tipo')}: ${EquipmentInfoParser.parseEquipmentType(getObject(item, EquipmentCharacteristicType.TYPE))}`,
      ],
    };

    if (this.isWeapon(item)) {
      return this.#getWeaponRollInformation(item, base);
    } else {
      return this.#getEquipmentRollInformation(item, base);
    }
  }

  static #getWeaponRollInformation(item, base) {
    return {
      ...base,
      damage: getObject(item, EquipmentCharacteristicType.DAMAGE),
      true_damage: getObject(item, EquipmentCharacteristicType.TRUE_DAMAGE),
      changes: [
        ...base.changes,
        `${localize('Dano')}: ${getObject(item, EquipmentCharacteristicType.DAMAGE)}`,
        `${localize('Dano_Automatico')}: ${getObject(item, EquipmentCharacteristicType.TRUE_DAMAGE)}`,
        `${localize('Tipo_Dano')}: ${EquipmentInfoParser.parseDamageType(getObject(item, EquipmentCharacteristicType.DAMAGE_TYPE))}`
      ]
    }
  }

  static #getEquipmentRollInformation(item, base) {
    const changes = [...base.changes];
    const type = getObject(item, EquipmentCharacteristicType.TYPE);

    this.#parseResistanceRollInfo(item, changes);

    if (type === EquipmentType.VEHICLE) {
      this.#parseVehicleRollInfo(item, changes);
    } else if (type === EquipmentType.SUBSTANCE) {
      this.#parseSubstanceRollInfo(item, changes);
    }

    if (this.isSuperEquipment(item)) {
      this.#parseSuperEquipmentRollInfo(item, changes);
    }

    return {
      ...base,
      changes: changes
    }
  }

  static #parseResistanceRollInfo(item, changes) {
    const resistance = getObject(item, EquipmentCharacteristicType.RESISTANCE);
    if (resistance != null && resistance !== undefined) {
      changes.push(`${localize('Resistencia')}: ${resistance}`);
    }
  }

  static #parseVehicleRollInfo(item, changes) {
    const vehicleType = getObject(item, EquipmentCharacteristicType.VEHICLE.TYPE);
    if (vehicleType != null) {
      changes.push(`${localize('Tipo_Veiculo')}: ${EquipmentInfoParser.parseVehicle(vehicleType)}`);
    }
    const acceleration = getObject(item, EquipmentCharacteristicType.ACCELERATION);
    if (acceleration != null) {
      changes.push(`${localize('Aceleracao')}: ${acceleration}`);
    }
    const speed = getObject(item, EquipmentCharacteristicType.SPEED);
    if (speed != null) {
      changes.push(`${localize('Velocidade')}: ${speed}`);
    }
  }

  static #parseSubstanceRollInfo(item, changes) {
    const substanceType = getObject(item, EquipmentCharacteristicType.SUBSTANCE.TYPE);
    if (substanceType != null) {
      changes.push(`${localize('Tipo')}: ${EquipmentInfoParser.parseSubstance(substanceType)}`);
    }

    const effects = getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];
    if (effects.length > 0) {
      const effectsDescriptions = effects.map(e => e.description).join(', ');
      changes.push(`${localize('Efeitos')}: ${effectsDescriptions}`);
    }
  }

  static #parseSuperEquipmentRollInfo(item, changes) {
    const level = this.getSuperEquipmentLevel(item);
    changes.push(`${localize('Nivel')}: ${level}`);

    const superEffects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) || [];
    if (superEffects.length > 0) {
      changes.push(`${localize('Efeitos')}: ${superEffects.map(effect => {
        const particularity = effect.particularity?.description;
        return particularity ? `${effect.name} (${particularity})` : effect.name;
      }).join(', ')}`);
    }

    const superDefects = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) || [];
    if (superDefects.length > 0) {
      changes.push(`${localize('Defeitos')}: ${superDefects.map(defect => {
        const particularity = defect.particularity?.description;
        return particularity ? `${defect.name} (${particularity})` : defect.name;
      }).join(', ')}`);
    }
  }
}
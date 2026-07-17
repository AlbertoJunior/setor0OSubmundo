import { BaseActorCharacteristicType, CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { getObject, localize } from "../../utils/utils.mjs";
import { MorphologyRepository } from "../../repository/morphology-repository.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { ActiveEffectsUtils } from "../effect/active-effects-utils.mjs";
import { DEFAULT_VALUES } from "../../constants.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";

export class ActorUtils {
  static getActor(actorId) {
    return game.actors.get(actorId);
  }

  static isSynthetic(actor) {
    return getObject(actor, BaseActorCharacteristicType.MORPHOLOGY) == MorphologyRepository.TYPES.SYNTHETIC.id;
  }

  static getAttributeValue(actor, attr) {
    const base = getObject(actor, CharacteristicType.ATTRIBUTES)[attr] || 0;
    const bonus = getObject(actor, CharacteristicType.BONUS.ATTRIBUTES)[attr] || 0;
    return base + bonus;
  }

  static getAbilityValue(actor, ability) {
    const base = getObject(actor, CharacteristicType.SKILLS)[ability] || 0;
    const bonus = getObject(actor, CharacteristicType.BONUS.SKILL)[ability] || 0;
    return base + bonus;
  }

  static getVirtueLevel(actor, virtue) {
    return getObject(actor, CharacteristicType.VIRTUES)[virtue].level;
  }

  static getVirtueValue(actor, virtue) {
    const base = ActorUtils.getVirtueLevel(actor, virtue);
    const bonus = getObject(actor, CharacteristicType.BONUS.VIRTUES)[virtue];
    return base + bonus;
  }

  static getCharacteristicVirtue(virtue) {
    return Object.values(CharacteristicType.VIRTUES)
      .find(item => item && item.system && item.id == virtue);
  }

  static getOverload(actor) {
    return getObject(actor, CharacteristicType.OVERLOAD) || 0;
  }

  static getOverloadLimit(actor) {
    const actorDefaultLimitOverload = DEFAULT_VALUES.OVERLOAD_LIMIT;
    const buffOrDebuff = getObject(actor, CharacteristicType.BONUS.OVERLOAD_LIMIT) || 0;
    return Math.max(actorDefaultLimitOverload + buffOrDebuff, 0);
  }

  static getEnhancementLevel(actor, enhancement) {
    const enhancements = getObject(actor, CharacteristicType.ENHANCEMENT_ALL);
    const enhancementOnActor = ActorUtils.#findEnhancementOnActorById(enhancement.id, enhancements);
    const levelsOnActor = ActorUtils.#findEnhancementLevelsWithId(enhancementOnActor);
    return levelsOnActor.length;
  }

  static getCharacteristicEnhancementSlot(slot) {
    return `${CharacteristicType.ENHANCEMENT.system}_${slot}`;
  }

  static getDamage(actor) {
    const superficial = getObject(actor, BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE) || 0;
    const letal = getObject(actor, BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) || 0;
    return superficial + letal;
  }

  static getActualLanguages(actor) {
    return getObject(actor, CharacteristicType.LANGUAGE) || [];
  }

  static calculatePenalty(actor) {
    const stamina = getObject(actor, CharacteristicType.ATTRIBUTES.STAMINA) || 0;
    const letalDamage = getObject(actor, BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) || 0;
    const bonusPenalty = getObject(actor, CharacteristicType.BONUS.DAMAGE_PENALTY) || 0;
    const syntheticBonus = ActorUtils.isSynthetic(actor) ? DEFAULT_VALUES.SYNTHETIC_PENALTY_BONUS : 0;

    const calculateTotal = letalDamage - (stamina + syntheticBonus) + bonusPenalty;
    const safeMinValue = Math.max(calculateTotal, 0);

    const fixedPenalty = getObject(actor, CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT) || 0;
    return Math.min(safeMinValue, 4) + fixedPenalty;
  }

  static calculateVitalityByUpAttribute(actor, level) {
    const value = level;
    const bonus = getObject(actor, CharacteristicType.BONUS.VITALITY);
    return DEFAULT_VALUES.BASE_VITALITY + value + bonus;
  }

  static calculateDices(actor, attr1, attr2, ability) {
    const attr1Value = ActorUtils.getAttributeValue(actor, attr1);
    const attr2Value = ActorUtils.getAttributeValue(actor, attr2);
    const abilityValue = ActorUtils.getAbilityValue(actor, ability);
    return Math.floor((attr1Value + attr2Value) / 2) + abilityValue;
  }

  static calculateMovimentPoints(actor) {
    const dexValue = ActorUtils.getAttributeValue(actor, CharacteristicType.ATTRIBUTES.DEXTERITY.id);
    const athleticsValue = ActorUtils.getAbilityValue(actor, CharacteristicType.SKILLS.ATHLETICS.id);
    const bonusPM = getObject(actor, CharacteristicType.BONUS.PM) || 0;
    const calculated = DEFAULT_VALUES.BASE_MOVIMENT_POINTS + athleticsValue + bonusPM + Math.floor(dexValue / 2);
    return Math.max(calculated, 0);
  }

  static calculateInitiative(actor) {
    const dexValue = ActorUtils.getAttributeValue(actor, CharacteristicType.ATTRIBUTES.DEXTERITY.id);
    const perValue = ActorUtils.getAttributeValue(actor, CharacteristicType.ATTRIBUTES.PERCEPTION.id);
    const bonusInitiative = getObject(actor, CharacteristicType.BONUS.INITIATIVE) || 0;
    return bonusInitiative + Math.floor((dexValue + perValue) / 2);
  }

  static calculateTotalLanguages(actor) {
    const streetWise = getObject(actor, CharacteristicType.SKILLS.STREETWISE);
    if (streetWise == 0) {
      return 1;
    }

    if (streetWise == 1) {
      return 2;
    }

    return 1 + (streetWise - 1) * 2
  }

  static calculateTotalExperience(actor) {
    const currentEperience = getObject(actor, CharacteristicType.EXPERIENCE.CURRENT);
    const usedExperience = getObject(actor, CharacteristicType.EXPERIENCE.USED);
    return currentEperience + usedExperience;
  }

  static calculateActualVirtue(actor, characteristicType) {
    switch (characteristicType) {
      case CharacteristicType.VIRTUES.CONSCIOUSNESS: {
        const level = getObject(actor, CharacteristicType.VIRTUES.CONSCIOUSNESS.LEVEL);
        const buffOrDebuff = getObject(actor, CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS);
        return level + buffOrDebuff;
      }
      case CharacteristicType.VIRTUES.PERSEVERANCE: {
        const level = getObject(actor, CharacteristicType.VIRTUES.PERSEVERANCE.LEVEL);
        const buffOrDebuff = getObject(actor, CharacteristicType.BONUS.VIRTUES.PERSEVERANCE);
        return level + buffOrDebuff;
      }
      case CharacteristicType.VIRTUES.QUIETNESS: {
        const level = getObject(actor, CharacteristicType.VIRTUES.QUIETNESS.LEVEL);
        const buffOrDebuff = getObject(actor, CharacteristicType.BONUS.VIRTUES.QUIETNESS);
        return level + buffOrDebuff;
      }
    }
    return 0;
  }

  static havePerseverance(actor) {
    const level = getObject(actor, CharacteristicType.VIRTUES.PERSEVERANCE.LEVEL);
    const used = getObject(actor, CharacteristicType.VIRTUES.PERSEVERANCE.USED);
    return used < level;
  }

  static haveQuietness(actor) {
    const level = getObject(actor, CharacteristicType.VIRTUES.QUIETNESS.LEVEL);
    const used = getObject(actor, CharacteristicType.VIRTUES.QUIETNESS.USED);
    return used < level;
  }

  static haveConsciousness(actor) {
    const level = getObject(actor, CharacteristicType.VIRTUES.CONSCIOUSNESS.LEVEL);
    const used = getObject(actor, CharacteristicType.VIRTUES.CONSCIOUSNESS.USED);
    return used < level;
  }

  static getAllEnhancements(actor) {
    const allEnhancements = getObject(actor, CharacteristicType.ENHANCEMENT_ALL) || [];
    return Object.values(allEnhancements).filter(enhancement => enhancement.id !== '');
  }

  static #findEnhancementOnActorById(selectedId, enhancements) {
    if (!selectedId || !enhancements || typeof enhancements !== 'object') {
      return null;
    }

    for (const key in enhancements) {
      const enhancement = enhancements[key];
      if (enhancement && enhancement.id === selectedId) {
        return enhancement;
      }
    }

    return null;
  }

  static #findEnhancementLevelsWithId(enhancement) {
    if (!enhancement || !enhancement.levels || typeof enhancement.levels !== 'object') {
      return [];
    }
    return Object.values(enhancement.levels).filter(level => level && level.id !== "");
  }

  static getAllies(actor) {
    const allies = getObject(actor, CharacteristicType.ALLIES) || [];
    return ActorUtils.#getNetworkByList(allies);
  }

  static getInformants(actor) {
    const informants = getObject(actor, CharacteristicType.INFORMANTS) || [];
    return ActorUtils.#getNetworkByList(informants);
  }

  static #getNetworkByList(list) {
    return game.actors.filter(actor => list.includes(actor.id))
      .map(actor => {
        return {
          id: actor.id,
          name: actor.name,
          img: actor.img,
          system: actor.system
        }
      });
  }

  static getActualMovimentPoints(actor) {
    const pm = ActorUtils.calculateMovimentPoints(actor);
    const usedPm = FlagsUtils.getActorFlag(actor, 'used_pm') || 0;
    return Math.max(pm - usedPm, 0);
  }

  static getEffects(actor) {
    const effects = [...(actor.effects.contents || [])];
    return effects;
  }

  static getEffectsSorted(actor) {
    const effects = ActorUtils.getEffects(actor);
    const enhancementLabel = localize('Aprimoramento.Nome');

    effects.sort((a, b) => {
      if (ActiveEffectsUtils.getOriginId(a) === 'dead') {
        return -1;
      } else if (ActiveEffectsUtils.getOriginId(b) === 'dead') {
        return 1;
      }

      const aOrigin = a.origin;
      const bOrigin = b.origin;

      const hasOriginA = Boolean(aOrigin);
      const hasOriginB = Boolean(bOrigin);

      if (hasOriginA !== hasOriginB) {
        return hasOriginA ? -1 : 1;
      }

      if (hasOriginA && hasOriginB) {
        const aIsEnhancement = aOrigin.includes(enhancementLabel);
        const BIsEnhancement = bOrigin.includes(enhancementLabel);

        if (aIsEnhancement !== BIsEnhancement) {
          return aIsEnhancement ? -1 : 1;
        }

        if (aOrigin === bOrigin) {
          return a.name.localeCompare(b.name);
        }

        return aOrigin.localeCompare(bOrigin);
      }

      return a.name.localeCompare(b.name);
    });

    return effects;
  }

  static getActualEnhancementAmount(actor) {
    const total = ActorUtils.getAllEnhancements(actor)
      .flatMap(enhancement => Object.values(enhancement.levels).flatMap(level => level.id))
      .filter(id => Boolean(id))
      .length;
    return total;
  }

  static calculateTotalEnhancements(actor) {
    return (getObject(actor, CharacteristicType.CORE) ?? 0) * DEFAULT_VALUES.ENHANCEMENT_SLOTS_PER_CORE;
  }

  /**
   * Retorna as especialidades do ator com a label da habilidade já localizada.
   * Ordena pelo nome localizado da habilidade para facilitar agrupamento visual.
   *
   * @returns {Array<{habilidade: string, label: string, descricao_curta: string, descricao_longa: string|null, custo: number}>}
   */
  static getSpecialties(actor) {
    const specialties = getObject(actor, CharacteristicType.SPECIALTIES) || [];
    return specialties
      .map((specialty, index) => {
        const abilityInfo = AbilityRepository.getItem(specialty.habilidade);
        return {
          ...specialty,
          index,
          label: abilityInfo ? localize(abilityInfo.label.replace('S0.', '')) : specialty.habilidade,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  static getNotes(actor) {
    const notes = getObject(actor, CharacteristicType.NOTES) || [];
    return notes.map((note, index) => ({ ...note, index }));
  }

  static getManeuvers(actor) {
    const maneuvers = actor.items.filter(i => i.type === ItemType.MANEUVER);
    const grouped = {};
    for (const maneuver of maneuvers) {
      const skillId = getObject(maneuver, ManeuverType.SKILL);
      if (!grouped[skillId]) {
        const abilityInfo = AbilityRepository.getItem(skillId);
        grouped[skillId] = {
          skill: skillId,
          label: abilityInfo ? localize(abilityInfo.label.replace('S0.', '')) : skillId,
          items: []
        };
      }
      grouped[skillId].items.push(maneuver);
    }
    return Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label));
  }
}
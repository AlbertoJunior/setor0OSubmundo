import { ActorUtils } from "./actor-utils.mjs";
import { CharacteristicType, BaseActorCharacteristicType } from "../../enums/characteristic-enums.mjs";
import { MorphologyRepository } from "../../repository/morphology-repository.mjs";
import { TraitRepository } from "../../repository/trait-repository.mjs";
import { getObject } from "../../utils/utils.mjs";

export class ActorExperienceUtils {
  static INITIAL_POINTS = {
    attributes: {
      initial_value: 1,
      initial: 10,
      [MorphologyRepository.TYPES.SYNTHETIC.id]: 11,
      cost: 4,
    },
    repertory: {
      initial_value: 0,
      initial: 5,
      cost: 3
    },
    virtues: {
      initial_value: 1,
      initial: 4,
      cost: 3
    },
    abilities: {
      initial_value: 0,
      initial: 11,
      [MorphologyRepository.TYPES.ANDROID.id]: 15,
      cost: 2
    },
    core: {
      initial_value: 1,
      initial: 0,
      [MorphologyRepository.TYPES.HUMAN.id]: 0,
      cost: 6
    },
    enhancements: {
      initial_value: 0,
      initial: 3,
      [MorphologyRepository.TYPES.CYBORG.id]: 4,
      cost: 5
    },
  };

  static buildActorDataProxy(actor) {
    // Aprimoramentos
    const allEnhancements = ActorUtils.getAllEnhancements(actor);
    const enhancementGroups = allEnhancements.map(enhancement => {
      const levels = Object.values(enhancement.levels)
        .filter(l => l.id !== "")
        .map(l => Number(l.level) || 1)
        .sort((a, b) => a - b);
      return { id: enhancement.id, levels };
    });

    // Repertorios
    const allies = Number(getObject(actor, CharacteristicType.REPERTORY.ALLIES)) || 0;
    const informants = Number(getObject(actor, CharacteristicType.REPERTORY.INFORMANTS)) || 0;
    const arsenal = Number(getObject(actor, CharacteristicType.REPERTORY.ARSENAL)) || 0;
    const resources = Number(getObject(actor, CharacteristicType.REPERTORY.RESOURCES)) || 0;
    const superequipment = Number(getObject(actor, CharacteristicType.REPERTORY.SUPEREQUIPMENTS)) || 0;

    // Traços
    const goodTraits = getObject(actor, CharacteristicType.TRAIT.GOOD) || [];
    const badTraits = getObject(actor, CharacteristicType.TRAIT.BAD) || [];

    // Manobras e outros
    const maneuvers = getObject(actor, CharacteristicType.MANEUVERS) || [];
    const others = getObject(actor, CharacteristicType.OTHERS) || [];
    const specialties = getObject(actor, CharacteristicType.SPECIALTIES) || [];

    return {
      morfologia: getObject(actor, BaseActorCharacteristicType.MORPHOLOGY),
      atributos: {
        forca: getObject(actor, CharacteristicType.ATTRIBUTES.STRENGTH) || 1,
        vigor: getObject(actor, CharacteristicType.ATTRIBUTES.STAMINA) || 1,
        destreza: getObject(actor, CharacteristicType.ATTRIBUTES.DEXTERITY) || 1,
        percepcao: getObject(actor, CharacteristicType.ATTRIBUTES.PERCEPTION) || 1,
        carisma: getObject(actor, CharacteristicType.ATTRIBUTES.CHARISMA) || 1,
        inteligencia: getObject(actor, CharacteristicType.ATTRIBUTES.INTELLIGENCE) || 1,
      },
      virtudes: {
        consciencia: getObject(actor, CharacteristicType.VIRTUES.CONSCIOUSNESS.LEVEL) || 1,
        perseveranca: getObject(actor, CharacteristicType.VIRTUES.PERSEVERANCE.LEVEL) || 1,
        quietude: getObject(actor, CharacteristicType.VIRTUES.QUIETNESS.LEVEL) || 1,
      },
      habilidades: {
        armas_brancas: getObject(actor, CharacteristicType.SKILLS.MELEE) || 0,
        armas_de_projecao: getObject(actor, CharacteristicType.SKILLS.PROJECTILE) || 0,
        briga: getObject(actor, CharacteristicType.SKILLS.BRAWL) || 0,
        atletismo: getObject(actor, CharacteristicType.SKILLS.ATHLETICS) || 0,
        engenharia: getObject(actor, CharacteristicType.SKILLS.ENGINEERING) || 0,
        expressao: getObject(actor, CharacteristicType.SKILLS.EXPRESSION) || 0,
        furtividade: getObject(actor, CharacteristicType.SKILLS.FURTIVITY) || 0,
        hacking: getObject(actor, CharacteristicType.SKILLS.HACKING) || 0,
        investigacao: getObject(actor, CharacteristicType.SKILLS.INVESTIGATION) || 0,
        manha: getObject(actor, CharacteristicType.SKILLS.STREETWISE) || 0,
        medicina: getObject(actor, CharacteristicType.SKILLS.MEDICINE) || 0,
        performance: getObject(actor, CharacteristicType.SKILLS.PERFORMANCE) || 0,
        pilotagem: getObject(actor, CharacteristicType.SKILLS.PILOTING) || 0,
        quimica: getObject(actor, CharacteristicType.SKILLS.CHEMISTRY) || 0,
      },
      repertorio: allies + arsenal + informants + resources + superequipment,
      nucleo: getObject(actor, CharacteristicType.CORE) || 1,
      aprimoramentos: enhancementGroups,
      tracos: {
        bons: Object.values(goodTraits),
        ruins: Object.values(badTraits)
      },
      manobras: Array.isArray(maneuvers) ? maneuvers : Object.values(maneuvers),
      outros: {
        especialidades: specialties,
        outros: Array.isArray(others) ? others : Object.values(others)
      }
    };
  }

  static calculateOptimizedExperience(actor) {
    const data = this.buildActorDataProxy(actor);
    return this._performCalculation(data, false, null);
  }

  static calculateApproximateExperience(actor, thresholds) {
    const data = this.buildActorDataProxy(actor);
    return this._performCalculation(data, true, thresholds);
  }

  static _performCalculation(data, isApproximate, thresholds) {
    const morphology = data.morfologia;

    let initAttr = this.INITIAL_POINTS.attributes[morphology] || this.INITIAL_POINTS.attributes.initial;
    let initAbil = this.INITIAL_POINTS.abilities[morphology] || this.INITIAL_POINTS.abilities.initial;
    let initEnh = this.INITIAL_POINTS.enhancements[morphology] || this.INITIAL_POINTS.enhancements.initial;
    let initCore = this.INITIAL_POINTS.core[morphology] || this.INITIAL_POINTS.core.initial;

    const attributesCost = this._countPoints(data.atributos, initAttr, this.INITIAL_POINTS.attributes.cost, this.INITIAL_POINTS.attributes.initial_value, isApproximate, thresholds?.attributes);
    const skillsCost = this._countPoints(data.habilidades, initAbil, this.INITIAL_POINTS.abilities.cost, this.INITIAL_POINTS.abilities.initial_value, isApproximate, thresholds?.abilities);

    const repertoryCost = Math.max(0, data.repertorio - this.INITIAL_POINTS.repertory.initial) * this.INITIAL_POINTS.repertory.cost;

    const virtuesCost = this._countPoints(data.virtudes, this.INITIAL_POINTS.virtues.initial, this.INITIAL_POINTS.virtues.cost, this.INITIAL_POINTS.virtues.initial_value, false, null);

    // Core (Núcleo)
    const coreCost = this._countPoints({ nucleo: data.nucleo }, initCore, this.INITIAL_POINTS.core.cost, this.INITIAL_POINTS.core.initial_value, false, null);

    const enhCost = isApproximate && thresholds?.enhancements ? thresholds.enhancements : this.INITIAL_POINTS.enhancements.cost;
    const enhancementsCost = this._countEnhancementPoints(data.aprimoramentos, initEnh, enhCost);

    const goodTraitsCost = this._countTraitPoints(data.tracos.bons, 'good');
    const badTraitsCost = this._countTraitPoints(data.tracos.ruins, 'bad');
    const maneuversCost = this._countObjectFields(data.manobras, 'experiencia');
    const othersCost = this._countOthers(data.outros);

    // Traits ruins não cobram pontos na totalização (geram pontos na ficha nativa)
    const total = attributesCost + repertoryCost + virtuesCost + skillsCost + coreCost + enhancementsCost + goodTraitsCost + maneuversCost + othersCost;

    return {
      atributos: attributesCost,
      virtudes: virtuesCost,
      habilidades: skillsCost,
      repertorio: repertoryCost,
      nucleo: coreCost,
      aprimoramentos: enhancementsCost,
      tracos_bons: goodTraitsCost,
      tracos_ruins: badTraitsCost,
      manobras: maneuversCost,
      outros: othersCost,
      total: total
    };
  }

  static _countPoints(objJson, initialPoints, cost, initial_value, isApproximate, threshold) {
    let experienceUsed = 0;
    let initialAmountUsed = initialPoints;

    const sortedEntries = Object.entries(objJson).sort(([, valueA], [, valueB]) => valueB - valueA);

    for (const [key, value] of sortedEntries) {
      const actual_level = value;
      const levels_to_buy = Math.max(0, actual_level - initial_value);

      for (let i = 1; i <= levels_to_buy; i++) {
        const levelBeingBought = initial_value + i;

        if (isApproximate && threshold && levelBeingBought >= threshold) {
          experienceUsed += (levelBeingBought * cost);
        } else {
          if (initialAmountUsed <= 0) {
            experienceUsed += (levelBeingBought * cost);
          } else {
            initialAmountUsed--;
          }
        }
      }
    }
    return experienceUsed;
  }

  static _countEnhancementPoints(aprimoramentos, initEnh, enhCost) {
    let enhancementsCost = 0;

    const branchCosts = aprimoramentos.map(group => {
      const grossCost = group.levels.reduce((acc, level) => acc + (level * enhCost), 0);
      return { ...group, grossCost };
    });

    branchCosts.sort((a, b) => {
      if (b.levels.length !== a.levels.length) {
        return b.levels.length - a.levels.length;
      }
      return b.grossCost - a.grossCost;
    });

    let initialEnhUsed = initEnh;

    branchCosts.forEach((branch) => {
      for (const level of branch.levels) {
        if (initialEnhUsed > 0) {
          initialEnhUsed--;
        } else {
          enhancementsCost += (level * enhCost);
        }
      }
    });

    return enhancementsCost;
  }

  static _countObjectFields(arr, fieldName) {
    if (!Array.isArray(arr))
      return 0;
    return arr.reduce((acc, current) => {
      const keys = fieldName.split('.');
      let val = current;
      for (const k of keys) {
        if (val == null) break;
        val = val[k];
      }

      val = parseInt(val);
      if (isNaN(val)) {
        val = 0;
      }
      return acc + val;
    }, 0);
  }

  static _countTraitPoints(arr, type) {
    if (!Array.isArray(arr))
      return 0;
    return arr.reduce((acc, current) => {
      const sourceId = current[CharacteristicType.TRAIT.SOURCE_ID];
      const trait = TraitRepository.getItemByTypeAndId(type, sourceId);
      if (trait?.xp != null) {
        return acc + parseInt(trait.xp);
      }
      return acc;
    }, 0);
  }

  static _countOthers(others) {
    let experienceUsed = 0;

    if (others?.especialidades) {
      experienceUsed += this._countObjectFields(others.especialidades, 'custo');
    }

    if (others?.outros) {
      experienceUsed += this._countObjectFields(others.outros, 'experiencia');
    }

    return experienceUsed;
  }
}

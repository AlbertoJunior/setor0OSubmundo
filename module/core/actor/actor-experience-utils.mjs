import { ActorUtils } from "./actor-utils.mjs";
import { CharacteristicType, BaseActorCharacteristicType } from "../../enums/characteristic-enums.mjs";
import { MorphologyRepository } from "../../repository/morphology-repository.mjs";
import { TraitRepository } from "../../repository/trait-repository.mjs";
import { getObject } from "../../utils/utils.mjs";

export class ActorExperienceUtils {
  static INITIAL_POINTS = {
    attributes: { initial_value: 1, initial: 10, initial_sintetico: 11, cost: 4 },
    repertory: { initial_value: 0, initial: 5, cost: 3 },
    virtues: { initial_value: 1, initial: 4, cost: 3 },
    abilities: { initial_value: 0, initial: 11, initial_androide: 15, cost: 2 },
    core: { initial_value: 1, initial: 0, initial_human: 0, cost: 6 },
    enhancements: { initial_value: 0, initial: 3, initial_ciborgue: 4, cost: 5 },
  };

  static buildActorDataProxy(actor) {
    // Aprimoramentos
    const allEnhancements = ActorUtils.getAllEnhancements(actor);
    const aprimoramentosQtd = allEnhancements.map(e => Object.values(e.levels).filter(l => l.id !== "").length);

    // Repertorios
    const aliados = Number(getObject(actor, CharacteristicType.REPERTORY.ALLIES)) || 0;
    const informantes = Number(getObject(actor, CharacteristicType.REPERTORY.INFORMANTS)) || 0;
    const arsenal = Number(getObject(actor, CharacteristicType.REPERTORY.ARSENAL)) || 0;
    const recursos = Number(getObject(actor, CharacteristicType.REPERTORY.RESOURCES)) || 0;
    const superequipamento = Number(getObject(actor, CharacteristicType.REPERTORY.SUPEREQUIPMENTS)) || 0;

    // Outros campos customizáveis ou em compêndio normalmente no sistema Setor 0
    const tracos_bons = getObject(actor, CharacteristicType.TRAIT.GOOD) || [];
    const tracos_ruins = getObject(actor, CharacteristicType.TRAIT.BAD) || [];

    // Em Setor 0, manobras e formatações adicionadas via painel do ator. Se não houver array literal em system, adaptamos
    const manobras = getObject(actor, 'system.manobras') || [];
    const outros = getObject(actor, 'system.outros') || [];

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
      repertorio: aliados + arsenal + informantes + recursos + superequipamento,
      nucleo: getObject(actor, CharacteristicType.CORE) || 1,
      aprimoramentos: aprimoramentosQtd,
      tracos: {
        bons: Object.values(tracos_bons), // Object.values se for guardado nativamente como obj/array de persistência
        ruins: Object.values(tracos_ruins)
      },
      manobras: Array.isArray(manobras) ? manobras : Object.values(manobras),
      outros: Array.isArray(outros) ? outros : Object.values(outros)
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
    const morfologia = data.morfologia;

    let initAttr = MorphologyRepository.TYPES.SYNTHETIC.id === morfologia ? this.INITIAL_POINTS.attributes.initial_sintetico : this.INITIAL_POINTS.attributes.initial;
    let initAbil = MorphologyRepository.TYPES.ANDROID.id === morfologia ? this.INITIAL_POINTS.abilities.initial_androide : this.INITIAL_POINTS.abilities.initial;
    let initEnh = MorphologyRepository.TYPES.CYBORG.id === morfologia ? this.INITIAL_POINTS.enhancements.initial_ciborgue : this.INITIAL_POINTS.enhancements.initial;

    let initCore = MorphologyRepository.TYPES.HUMAN.id === morfologia ? this.INITIAL_POINTS.core.initial_human : this.INITIAL_POINTS.core.initial;

    const atributosCost = this._countPoints(data.atributos, initAttr, this.INITIAL_POINTS.attributes.cost, this.INITIAL_POINTS.attributes.initial_value, isApproximate, thresholds?.attributes);
    const habilidadesCost = this._countPoints(data.habilidades, initAbil, this.INITIAL_POINTS.abilities.cost, this.INITIAL_POINTS.abilities.initial_value, isApproximate, thresholds?.abilities);

    const repertorioCost = Math.max(0, data.repertorio - this.INITIAL_POINTS.repertory.initial) * this.INITIAL_POINTS.repertory.cost;

    const virtudesCost = this._countPoints(data.virtudes, this.INITIAL_POINTS.virtues.initial, this.INITIAL_POINTS.virtues.cost, this.INITIAL_POINTS.virtues.initial_value, false, null);

    // Core (Núcleo)
    const nucleoCost = this._countPoints({ nucleo: data.nucleo }, initCore, this.INITIAL_POINTS.core.cost, this.INITIAL_POINTS.core.initial_value, false, null);

    // Aprimoramento arrays convertizados em objeto pra uso na função _countPoints()
    let objAprimoramento = {};
    data.aprimoramentos.forEach((val, idx) => objAprimoramento[`aprim_${idx}`] = val);
    const enhCost = isApproximate && thresholds?.enhancements ? thresholds.enhancements : this.INITIAL_POINTS.enhancements.cost;
    const aprimoramentosCost = this._countPoints(objAprimoramento, initEnh, enhCost, this.INITIAL_POINTS.enhancements.initial_value, false, null);

    const tracos_bonsCost = this._countTraitPoints(data.tracos.bons, 'good');
    const tracos_ruinsCost = this._countTraitPoints(data.tracos.ruins, 'bad');
    const manobrasCost = this._countObjectFields(data.manobras, 'experiencia');
    const outrosCost = this._countObjectFields(data.outros, 'experiencia');

    // Traits ruins não cobram pontos na totalização (geram pontos na ficha nativa)
    const total = atributosCost + repertorioCost + virtudesCost + habilidadesCost + nucleoCost + aprimoramentosCost + tracos_bonsCost + manobrasCost + outrosCost;

    return {
      atributos: atributosCost,
      virtudes: virtudesCost,
      habilidades: habilidadesCost,
      repertorio: repertorioCost,
      nucleo: nucleoCost,
      aprimoramentos: aprimoramentosCost,
      tracos_bons: tracos_bonsCost,
      tracos_ruins: tracos_ruinsCost,
      manobras: manobrasCost,
      outros: outrosCost,
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

  static _countObjectFields(arr, fieldName) {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((acc, curr) => {
      const keys = fieldName.split('.');
      let val = curr;
      for (const k of keys) {
        if (val == null) break;
        val = val[k];
      }
      val = parseInt(val);
      if (isNaN(val)) val = 0;
      return acc + val;
    }, 0);
  }

  static _countTraitPoints(arr, type) {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((acc, curr) => {
      const sourceId = curr[CharacteristicType.TRAIT.SOURCE_ID];
      const trait = TraitRepository.getItemByTypeAndId(type, sourceId);
      if (trait?.xp != null) {
        return acc + parseInt(trait.xp);
      }
      return acc;
    }, 0);
  }
}

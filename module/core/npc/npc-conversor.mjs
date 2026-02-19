import { getObject } from "../../utils/utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType, NpcCharacteristicType } from "../../enums/characteristic-enums.mjs";
import { NpcQualityRepository } from "../../repository/npc-quality-repository.mjs";

export class NpcConversor {
  static actorToNpc(actor) {
    const fetchedSkills = this.#mountSkills(actor);
    const countedQuality = this.#calculateQuality(actor, fetchedSkills);
    const finalSkillValues = this.#finalSkillValues(fetchedSkills, countedQuality);

    return {
      actor: {
        id: actor.id,
        uuid: actor.uuid,
        isOwner: actor.isOwner,
        name: actor.name,
        img: actor.img,
        system: {
          [BaseActorCharacteristicType.MORPHOLOGY.id]: getObject(actor, BaseActorCharacteristicType.MORPHOLOGY),
          [BaseActorCharacteristicType.DISTRICT.id]: getObject(actor, BaseActorCharacteristicType.DISTRICT),
          [BaseActorCharacteristicType.BACKGROUND.id]: getObject(actor, BaseActorCharacteristicType.BACKGROUND),
          [BaseActorCharacteristicType.VITALITY.id]: getObject(actor, BaseActorCharacteristicType.VITALITY),
          [BaseActorCharacteristicType.BOUNTY.id]: getObject(actor, BaseActorCharacteristicType.BOUNTY),
          [BaseActorCharacteristicType.INFLUENCE.id]: getObject(actor, BaseActorCharacteristicType.INFLUENCE),
          [NpcCharacteristicType.QUALITY.id]: countedQuality,
          [NpcCharacteristicType.SKILLS.id]: finalSkillValues,
        },
        itemTypes: actor.itemTypes,
        effects: actor.effects,
      },
      items: actor.items,
      effects: actor.effects,
      editable: false,
      canRoll: actor.sheet.canRollOrEdit,
      canEdit: false,
      hideCompactButton: true,
      hideDarkModeButton: true,
    }
  }

  static #calculateQuality(actor, skills) {
    const attributeValues = Object.values(getObject(actor, CharacteristicType.ATTRIBUTES)) || [];
    const sumAttributeValues = attributeValues.reduce((acc, val) => acc + val, 0);

    const lowAttributes = attributeValues.length > 0 ? (sumAttributeValues / attributeValues.length) < 3 : false;
    const isNewbie = skills.primaria.valor < 3;
    const isSpecialist = skills.primaria.valor >= 4;
    const isTheBest = skills.primaria.valor == 6;
    const haveCore = getObject(actor, CharacteristicType.CORE) > 0;
    const haveCoreLevel2 = getObject(actor, CharacteristicType.CORE) >= 2;

    const criteria = [
      { condition: lowAttributes, weight: -2 },
      { condition: isNewbie, weight: -1 },
      { condition: isSpecialist, weight: 1 },
      { condition: haveCore, weight: 1 },
      { condition: haveCoreLevel2, weight: 2 },
      { condition: isTheBest, weight: 3 }
    ];

    const total = criteria.reduce((acc, c) => acc + (c.condition ? c.weight : 0), 0);

    let quality;
    if (total <= -2) {
      quality = NpcQualityRepository.TYPES.WORST;
    } else if (total < 0) {
      quality = NpcQualityRepository.TYPES.BAD;
    } else if (total < 1) {
      quality = NpcQualityRepository.TYPES.NORMAL;
    } else if (total < 3) {
      quality = NpcQualityRepository.TYPES.GOOD;
    } else {
      quality = NpcQualityRepository.TYPES.EXCEPTIONAL;
    }

    return quality.id;
  }

  static #mountSkills(actor) {
    const skills = Object.entries(getObject(actor, CharacteristicType.SKILLS)).sort((a, b) => b[1] - a[1]);

    const idValue = NpcCharacteristicType.SKILLS.VALUE.id;
    const idName = NpcCharacteristicType.SKILLS.SKILL_NAME.id;
    return {
      [NpcCharacteristicType.SKILLS.PRIMARY.id]: {
        [idValue]: skills[0][1] || 0,
        [idName]: skills[0][0] || ''
      },
      [NpcCharacteristicType.SKILLS.SECONDARY.id]: {
        [idValue]: skills[1][1] || 0,
        [idName]: skills[1][0] || ''
      },
      [NpcCharacteristicType.SKILLS.TERTIARY.id]: {
        [idValue]: skills[2][1] || 0,
        [idName]: skills[2][0] || ''
      },
      [NpcCharacteristicType.SKILLS.QUATERNARY.id]: {
        [idValue]: skills[3][1] || 0,
        [idName]: skills[3][0] || ''
      },
    }
  }

  static #finalSkillValues(skills, quality) {
    const IDEAL_VALUES = {
      [NpcQualityRepository.TYPES.WORST.id]: [3, 1, 0, 0],
      [NpcQualityRepository.TYPES.BAD.id]: [5, 3, 1, 0],
      [NpcQualityRepository.TYPES.NORMAL.id]: [7, 5, 3, 1],
      [NpcQualityRepository.TYPES.GOOD.id]: [9, 7, 5, 3],
      [NpcQualityRepository.TYPES.EXCEPTIONAL.id]: [11, 9, 7, 5]
    };
    const MAX_VARIATION = 3;
    const MAX_SKILL_VALUE = 15;

    const selectedIdealValues = IDEAL_VALUES[quality] ?? IDEAL_VALUES[NpcQualityRepository.TYPES.NORMAL.id];

    const skillsIds = [
      NpcCharacteristicType.SKILLS.PRIMARY.id,
      NpcCharacteristicType.SKILLS.SECONDARY.id,
      NpcCharacteristicType.SKILLS.TERTIARY.id,
      NpcCharacteristicType.SKILLS.QUATERNARY.id,
    ];

    const finalSkills = {
      ...skills
    };

    for (let i = 0; i < skillsIds.length; i++) {
      const key = skillsIds[i];
      const original = finalSkills[key].valor;

      const delta = Math.max(original - MAX_VARIATION, -1);
      const boosted = selectedIdealValues[i] + delta;

      finalSkills[key].valor = Math.max(0, Math.min(boosted, MAX_SKILL_VALUE));
    }

    return finalSkills;
  }
}
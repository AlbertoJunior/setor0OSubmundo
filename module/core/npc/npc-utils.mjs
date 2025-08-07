import { getObject } from "../../utils/utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType, NpcCharacteristicType } from "../../enums/characteristic-enums.mjs";
import { NpcQualityRepository } from "../../repository/npc-quality-repository.mjs";
import { ActorUtils } from "../actor/actor-utils.mjs";

export class NpcUtils {
    static getStamina(actor) {
        const vitality = getObject(actor, BaseActorCharacteristicType.VITALITY.TOTAL) || 0;
        return Math.max(vitality - 5, 0);
    }

    static getPm(actor) {
        const quality = getObject(actor, NpcCharacteristicType.QUALITY);
        const mapped = {
            [NpcQualityRepository.TYPES.WORST.id]: 0,
            [NpcQualityRepository.TYPES.BAD.id]: 1,
            [NpcQualityRepository.TYPES.NORMAL.id]: 2,
            [NpcQualityRepository.TYPES.GOOD.id]: 3,
            [NpcQualityRepository.TYPES.EXCEPTIONAL.id]: 4,
        };

        const allSkills = getObject(actor, NpcCharacteristicType.SKILLS);
        const skillName = NpcCharacteristicType.SKILLS.SKILL_NAME.id;
        const skillValue = NpcCharacteristicType.SKILLS.VALUE.id;
        const athleticsId = CharacteristicType.SKILLS.ATHLETICS.id;
        const foundedSkill = Object.values(allSkills)
            .filter(skill => skill != null)
            .filter(skill => skill[skillName] == athleticsId)
            .reduce((max, current) => {
                const currentValue = getObject(current, skillValue) ?? 0;
                const maxValue = getObject(max, skillValue) ?? -Infinity;
                return currentValue > maxValue ? current : max;
            }, null);

        const athleticsLevel = Math.floor(getObject(foundedSkill, skillValue) / 2) ?? 0;
        const qualityModifier = mapped[quality] || 0;
        return 1 + qualityModifier + athleticsLevel;
    }

    static calculatePenalty(actor) {
        return Math.max(ActorUtils.calculatePenalty(actor) - this.getStamina(actor), 0)
    }

    static canBeSpecialist(actor) {
        const quality = getObject(actor, NpcCharacteristicType.QUALITY);
        const qualityValues = NpcQualityRepository.getItem(quality)?.bonusOrDebuff || 0;
        return qualityValues > 2;
    }

    static canHalfTest(actor) {
        const quality = getObject(actor, NpcCharacteristicType.QUALITY);
        const qualityValues = NpcQualityRepository.getItem(quality)?.bonusOrDebuff || 0;
        return qualityValues >= 0;
    }

    static canBeOverloaded(actor) {
        const quality = getObject(actor, NpcCharacteristicType.QUALITY);
        const qualityValues = NpcQualityRepository.getItem(quality)?.bonusOrDebuff || 0;
        return qualityValues >= 2;
    }

    static calculateInitiative(actor) {
        const quality = getObject(actor, NpcCharacteristicType.QUALITY);
        const mapped = {
            [NpcQualityRepository.TYPES.WORST.id]: 0,
            [NpcQualityRepository.TYPES.BAD.id]: 0,
            [NpcQualityRepository.TYPES.NORMAL.id]: 1,
            [NpcQualityRepository.TYPES.GOOD.id]: 2,
            [NpcQualityRepository.TYPES.EXCEPTIONAL.id]: 3,
        };
        const qualityModifier = mapped[quality] || 0;

        const bonusInitiative = getObject(actor, CharacteristicType.BONUS.INITIATIVE) || 0;

        return Math.max(qualityModifier + bonusInitiative, 0);
    }
}
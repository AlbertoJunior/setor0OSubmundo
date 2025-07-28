import { ActorUtils } from "../../module/core/actor/actor-utils.mjs";
import { ActorCombatUtils } from "../../module/core/actor/actor-combat-utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType, NpcCharacteristicType, NpcSkillsMap } from "../../module/enums/characteristic-enums.mjs";
import { getObject } from "../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../module/core/actor/actor-equipment.mjs";
import { NpcUtils } from "../../module/core/npc/npc-utils.mjs";
import { CustomRoll } from "../../module/core/rolls/custom-roll.mjs";

const map = {
    'district': (actor) => getObject(actor, BaseActorCharacteristicType.DISTRICT),
    'morphology': (actor) => getObject(actor, BaseActorCharacteristicType.MORPHOLOGY),
    'biography': (actor) => getObject(actor, BaseActorCharacteristicType.BACKGROUND.BIOGRAPHY) || null,
    'assignment': (actor) => getObject(actor, BaseActorCharacteristicType.BACKGROUND.ASSIGNMENT),
    'core': (actor) => getObject(actor, CharacteristicType.CORE),

    'penalty': (actor) => ActorUtils.calculatePenalty(actor),
    'pm': (actor) => ActorUtils.calculateMovimentPoints(actor),
    'initiative': (actor) => ActorUtils.calculateInitiative(actor),
    'current_damage': (actor) => ActorUtils.getDamage(actor),
    'vitality': (actor) => getObject(actor, BaseActorCharacteristicType.VITALITY.TOTAL),
    'actual_languages': (actor) => ActorUtils.getActualLanguages(actor).length,
    'total_languages': (actor) => ActorUtils.calculateTotalLanguages(actor),

    'experience': (actor) => getObject(actor, CharacteristicType.EXPERIENCE),
    'actual_experience': (actor) => getObject(actor, CharacteristicType.EXPERIENCE.CURRENT) || 0,
    'used_experience': (actor) => getObject(actor, CharacteristicType.EXPERIENCE.USED) || 0,
    'total_experience': (actor) => ActorUtils.calculateTotalExperience(actor),

    'have_equipped_armor': (actor) => Boolean(ActorEquipmentUtils.getEquippedArmorItem(actor)),
    'equipped_amor_total_resistance': (actor) => ActorEquipmentUtils.getArmorEquippedResistence(actor),
    'equipped_amor_actual_resistance': (actor) => ActorEquipmentUtils.getArmorEquippedActualResistence(actor),

    'actual_consciousness': (actor) => ActorUtils.calculateActualVirtue(actor, CharacteristicType.VIRTUES.CONSCIOUSNESS),
    'actual_perseverance': (actor) => ActorUtils.calculateActualVirtue(actor, CharacteristicType.VIRTUES.PERSEVERANCE),
    'actual_quietness': (actor) => ActorUtils.calculateActualVirtue(actor, CharacteristicType.VIRTUES.QUIETNESS),

    'offensive_projectile': (actor) => ActorCombatUtils.calculateOffensiveProjectileDices(actor),
    'offensive_projectile_half': (actor) => Math.floor(ActorCombatUtils.calculateOffensiveProjectileDices(actor) / 2),
    'offensive_brawl': (actor) => ActorCombatUtils.calculateOffensiveBrawlDices(actor),
    'offensive_brawl_half': (actor) => Math.floor(ActorCombatUtils.calculateOffensiveBrawlDices(actor) / 2),
    'offensive_melee': (actor) => ActorCombatUtils.calculateOffensiveMeleeDices(actor),
    'offensive_melee_half': (actor) => Math.floor(ActorCombatUtils.calculateOffensiveMeleeDices(actor) / 2),

    'defensive_dodge': (actor) => ActorCombatUtils.calculateDefensiveDodgeDices(actor),
    'defensive_dodge_half': (actor) => ActorCombatUtils.calculateDefensiveHalfDodgeDices(actor),
    'defensive_block_melee': (actor) => ActorCombatUtils.calculateDefensiveBlockMeleeDices(actor),
    'defensive_block_melee_half': (actor) => ActorCombatUtils.calculateDefensiveHalfBlockMeleeDices(actor),
    'defensive_block_brawl': (actor) => ActorCombatUtils.calculateDefensiveBlockBrawlDices(actor),
    'defensive_block_brawl_half': (actor) => ActorCombatUtils.calculateDefensiveHalfBlockBrawlDices(actor),

    'npc_actual_skill_name': (actor, skill = '') => getObject(actor, NpcSkillsMap[skill].SKILL_NAME) || '',
    'npc_actual_skill_value': (actor, skill) => getObject(actor, NpcSkillsMap[skill].VALUE) || 0,
    'npc_tertiary_value': (actor) => getObject(actor, NpcCharacteristicType.SKILLS.TERTIARY.VALUE) || 0,
    'npc_quaternary_value': (actor) => getObject(actor, NpcCharacteristicType.SKILLS.QUATERNARY.VALUE) || 0,
    'npc_stamina': (actor) => NpcUtils.getStamina(actor),
    'npc_pm': (actor) => NpcUtils.getPm(actor),
    'npc_quality': (actor) => getObject(actor, NpcCharacteristicType.QUALITY) || 0,

    'calculate_dice_pool': (actor, params) => {
        const { primary_attribute, secondary_attribute, ability, bonus = 0 } = params[0];
        return ActorUtils.calculateDices(actor, primary_attribute, secondary_attribute, ability) + bonus;
    },

    'characteristic_level': (actor, characteristic) => {
        if (!actor || !characteristic[0]) {
            return 0;
        }

        const data = CustomRoll.mountData(actor);
        const level = CustomRoll.operateAllPossibilities(actor, data, characteristic[0], '')?.value || 0;
        return level;
    }
}

export default function actorValues(actor, value, ...params) {
    params.pop()
    return map[value](actor, params);
}
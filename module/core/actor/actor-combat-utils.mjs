import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { getObject } from "../../utils/utils.mjs";
import { ActorUtils } from "./actor-utils.mjs";

export class ActorCombatUtils {
    static dataPresetCombatMap = {
        brawl: {
            offensive: this.#makeOffensivePreset(
                CharacteristicType.ATTRIBUTES.STRENGTH,
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.SKILLS.BRAWL,
                CharacteristicType.BONUS.OFENSIVE_MELEE
            ),
            defensive: this.#makeDefensivePreset(
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.ATTRIBUTES.STAMINA,
                CharacteristicType.SKILLS.BRAWL
            )
        },
        melee: {
            offensive: this.#makeOffensivePreset(
                CharacteristicType.ATTRIBUTES.STRENGTH,
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.SKILLS.MELEE,
                CharacteristicType.BONUS.OFENSIVE_MELEE
            ),
            defensive: this.#makeDefensivePreset(
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.ATTRIBUTES.STAMINA,
                CharacteristicType.SKILLS.MELEE
            )
        },
        projectile: {
            offensive: this.#makeOffensivePreset(
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.ATTRIBUTES.PERCEPTION,
                CharacteristicType.SKILLS.PROJECTILE,
                CharacteristicType.BONUS.OFENSIVE_PROJECTILE
            ),
            defensive: this.#makeDefensivePreset(
                CharacteristicType.ATTRIBUTES.DEXTERITY,
                CharacteristicType.ATTRIBUTES.STAMINA,
                CharacteristicType.SKILLS.ATHLETICS
            )
        }
    };

    static #makeOffensivePreset(attr1, attr2, ability, bonusType) {
        return {
            attr1: attr1.id,
            attr2: attr2.id,
            ability: ability.id,
            getBonus: (actor) => getObject(actor, bonusType) || 0
        };
    }

    static #makeDefensivePreset(attr1, attr2, ability) {
        const attr1Id = attr1.id;
        const attr2Id = attr2.id;
        const abilityId = ability.id;
        return {
            attr1: attr1Id,
            attr2: attr2Id,
            ability: abilityId,
            getBonus: (actor, dices) => {
                let safeDices = dices;
                if (!dices) {
                    safeDices = ActorUtils.calculateDices(actor, attr1Id, attr2Id, abilityId);
                }
                const bonusFactor = getObject(actor, CharacteristicType.BONUS.DEFENSIVE_FACTOR) || 0;
                const bonusFlat = getObject(actor, CharacteristicType.BONUS.DEFENSIVE) || 0;
                return Math.floor(safeDices * bonusFactor) + bonusFlat;
            }
        };
    }

    static calculateOffensiveProjectileDices(actor) {
        const data = this.dataPresetCombatMap.projectile.offensive;
        return this.calculateOffensiveDices(actor, data);
    }

    static calculateOffensiveMeleeDices(actor) {
        const data = this.dataPresetCombatMap.melee.offensive;
        return this.calculateOffensiveDices(actor, data);
    }

    static calculateOffensiveBrawlDices(actor) {
        const data = this.dataPresetCombatMap.brawl.offensive;
        return this.calculateOffensiveDices(actor, data);
    }

    static calculateOffensiveDices(actor, data) {
        const bonus = data.getBonus(actor);
        const finalValue = ActorUtils.calculateDices(actor, data.attr1, data.attr2, data.ability) + bonus;
        return Math.max(finalValue, 0);
    }

    static calculateDefensiveDodgeDices(actor) {
        const data = this.dataPresetCombatMap.projectile.defensive;
        return this.#calculateDefensiveDices(actor, data);
    }

    static calculateDefensiveHalfDodgeDices(actor) {
        const data = this.dataPresetCombatMap.projectile.defensive;
        return this.#calculateHalfDefensiveDices(actor, data);
    }

    static calculateDefensiveBlockMeleeDices(actor) {
        const data = this.dataPresetCombatMap.melee.defensive;
        return this.#calculateDefensiveDices(actor, data);
    }

    static calculateDefensiveHalfBlockMeleeDices(actor) {
        const data = this.dataPresetCombatMap.melee.defensive;
        return this.#calculateHalfDefensiveDices(actor, data);
    }

    static calculateDefensiveBlockBrawlDices(actor) {
        const data = this.dataPresetCombatMap.brawl.defensive;
        return this.#calculateDefensiveDices(actor, data);
    }

    static calculateDefensiveHalfBlockBrawlDices(actor) {
        const data = this.dataPresetCombatMap.brawl.defensive;
        return this.#calculateHalfDefensiveDices(actor, data);
    }

    static #calculateDefensiveDices(actor, data) {
        const dices = ActorUtils.calculateDices(actor, data.attr1, data.attr2, data.ability);
        const finalValue = dices + data.getBonus(actor, dices);
        return Math.max(finalValue, 0);
    }

    static #calculateHalfDefensiveDices(actor, data) {
        const dices = ActorUtils.calculateDices(actor, data.attr1, data.attr2, data.ability);
        const finalValue = Math.floor(dices / 2) + data.getBonus(actor, dices);
        return Math.max(finalValue, 0);
    }
}

import { EffectChangeValueType, EnhancementDuration } from "../../enums/enhancement-enums.mjs";
import { EnhancementRepository } from "../../repository/enhancement-repository.mjs";
import { ActorUtils } from "../../core/actor/actor-utils.mjs";
import { ActiveEffectsUtils } from "../effect/active-effects-utils.mjs";
import { CombatUtils } from "../combat/combat-utils.mjs";
import { COLORS } from "../../constants.mjs";

export class EnhancementUtils {
    static valueCalculators = {
        [EffectChangeValueType.FIXED]: (value, enhancementLevel) => value,
        [EffectChangeValueType.ENHANCEMENT_LEVEL]: (value, enhancementLevel) => enhancementLevel,
        [EffectChangeValueType.HALF_ENHANCEMENT_LEVEL]: (value, enhancementLevel) => Math.floor(enhancementLevel / 2),
        [EffectChangeValueType.ENHANCEMENT_LEVEL_PLUS_FIXED]: (value, enhancementLevel) => enhancementLevel + value,
        [EffectChangeValueType.HALF_ENHANCEMENT_LEVEL_PLUS_FIXED]: (value, enhancementLevel) => Math.floor(enhancementLevel / 2) + value,
        [EffectChangeValueType.OTHER_VALUE]: (value, enhancementLevel, otherValue) => otherValue,
    };

    static #valueCalculator(change, enhancementLevel) {
        const typeOfValue = change.typeOfValue;
        const value = change.value;
        const otherValue = change.otherValue;
        return this.valueCalculators[typeOfValue]?.(value, enhancementLevel, otherValue) || 0;
    }

    static verifyAndSetEffectChanges(actor, activeEffectData, effectChanges, enhancement) {
        if (effectChanges.length > 0) {
            const enhancementLevel = ActorUtils.getEnhancementLevel(actor, enhancement);

            activeEffectData.changes = effectChanges
                .filter(change => Boolean(change.key))
                .map(change => ({
                    key: change.key,
                    mode: change.mode ?? CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: this.#valueCalculator(change, enhancementLevel, actor)
                }));
        }
    }

    static configureActiveEffect(activeEffectData, effect, enhancement) {
        const duration = effect.duration;
        this.#configureActiveEffectDuration(activeEffectData, duration);
        this.#configureActiveEffectIcon(activeEffectData, duration, enhancement.id);
        this.#configureActiveEffectTint(activeEffectData, duration, effect.id);
    }

    static #configureActiveEffectDuration(activeEffectData, effectDuration) {
        let durationObject;

        switch (effectDuration) {
            case EnhancementDuration.TIME:
            case EnhancementDuration.SCENE: {
                const flags = ActiveEffectsUtils.getFlags(activeEffectData);
                const haveFlagCombat = flags.combatId != undefined && flags.combatId !== '';
                if (haveFlagCombat) {
                    const combat = CombatUtils.currentCombat();

                    durationObject = {
                        startRound: combat?.round,
                        startTurn: combat?.turn,
                        rounds: 99,
                        combat: combat
                    };
                } else {
                    durationObject = { rounds: 99, startTime: 0 };
                }
                break;
            }
            case EnhancementDuration.USE: {
                durationObject = { rounds: 1, startRound: 0 };
                break;
            }
        }

        activeEffectData.duration = durationObject;
    }

    static #configureActiveEffectIcon(activeEffectData, effectDuration, enhancementId) {
        switch (effectDuration) {
            case EnhancementDuration.TIME:
            case EnhancementDuration.SCENE: {
                const enhancement = EnhancementRepository.getEnhancementById(enhancementId);
                if (!enhancement) {
                    return;
                }
                activeEffectData.img = enhancement.icon;
            }
        }
    }

    static #configureActiveEffectTint(activeEffectData, effectDuration, levelId) {
        switch (effectDuration) {
            case EnhancementDuration.TIME:
            case EnhancementDuration.SCENE: {
                const effect = EnhancementRepository.getEnhancementEffectById(levelId);
                if (!effect) {
                    return;
                }

                const tint = COLORS.ENHANCEMENT_LEVELS.allColors[effect.level - 1] ?? COLORS.ENHANCEMENT_LEVELS.level1;
                activeEffectData.tint = tint;
            }
        }
    }
}
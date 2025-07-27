import { SYSTEM_ID } from "../constants.mjs";
import { influencedActiveEffects } from "../core/effect/effect-items/influecedEffects.mjs";
import { shatteredActiveEffects } from "../core/effect/effect-items/shattered.mjs";
import { simulatedActiveEffect } from "../core/effect/effect-items/simulated.mjs";
import { surprisedActiveEffect } from "../core/effect/effect-items/surprised.mjs";
import { ActiveEffectsFlags, ActiveEffectsTypes } from "../enums/active-effects-enums.mjs";

export class ActiveEffectRepository {
    static #items = [
        surprisedActiveEffect,
        simulatedActiveEffect,
        ...influencedActiveEffects,
        ...shatteredActiveEffects,
    ];

    static #permitedDefault = [
        'dead', 'blind', 'burning', 'shock', 'poison', 'paralysis'
    ];

    static #getFoundryDefaultEffects() {
        return CONFIG.statusEffects
            .filter(effect => this.#permitedDefault.includes(effect.id))
            .map(effect => {
                const isDead = effect.id === 'dead';

                return {
                    ...effect,
                    duration: isDead ? undefined : { rounds: 99, startTime: 0 },
                    flags: {
                        [SYSTEM_ID]: {
                            [ActiveEffectsFlags.ORIGIN_ID]: effect.id,
                            [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
                            [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
                        }
                    }
                };
            });
    }

    static getItems() {
        return [
            ...this.#items,
            ...this.#getFoundryDefaultEffects()
        ].filter(Boolean);
    }
}
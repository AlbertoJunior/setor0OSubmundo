import { COLORS, SYSTEM_ID } from "../constants.mjs";
import { influencedActiveEffects } from "../core/effect/effect-items/influecedEffects.mjs";
import { seendActiveEffect } from "../core/effect/effect-items/seen.mjs";
import { shatteredActiveEffects } from "../core/effect/effect-items/shattered.mjs";
import { simulatedActiveEffect } from "../core/effect/effect-items/simulated.mjs";
import { surprisedActiveEffect } from "../core/effect/effect-items/surprised.mjs";
import { ActiveEffectsFlags, ActiveEffectsTypes } from "../enums/active-effects-enums.mjs";
import { FoundryApi } from "../api/foundry-api.mjs"

export class ActiveEffectRepository {
  static #items = [
    surprisedActiveEffect,
    simulatedActiveEffect,
    seendActiveEffect,
    ...influencedActiveEffects,
    ...shatteredActiveEffects,
  ];

  static #permitedDefault = [
    'dead', 'blind', 'burning', 'shock', 'poison', 'paralysis'
  ];

  static #effectModifiers = {
    dead: {
      duration: { rounds: 99, startTime: 0 },
      tint: COLORS.BASE.red,
      flags: {
        core: {
          overlay: true,
        }
      }
    },
    shock: {
      tint: COLORS.BASE.yellow,
      flags: {
        core: {
          overlay: true,
        }
      }
    }
  }

  static #getFoundryDefaultEffects() {
    return CONFIG.statusEffects
      .filter(effect => this.#permitedDefault.includes(effect.id))
      .map(effect => {
        const modifiedEffect = this.#modifyDefaultEffects(effect);
        return {
          ...modifiedEffect,
          flags: {
            ...modifiedEffect.flags,
            [SYSTEM_ID]: {
              [ActiveEffectsFlags.ORIGIN_ID]: effect.id,
              [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
              [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
            }
          }
        };
      });
  }

  static #modifyDefaultEffects(effect) {
    const modifiers = this.#effectModifiers[effect.id];
    if (modifiers) {
      return FoundryApi.mergeObject(effect, modifiers);
    } else {
      return effect;
    }
  }

  static getItems() {
    return [
      ...this.#items,
      ...this.#getFoundryDefaultEffects()
    ].filter(Boolean);
  }
}
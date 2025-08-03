import { TokenUtils } from "../token/token-utils.mjs";
import { ActiveEffectsUtils } from "./active-effects-utils.mjs";

export class OscillatingTintManager {
    static #TOKENS = new Map();
    static #OSCILLATION_TIME = 5000;

    static startOscillationForToken(token) {
        const actor = token.actor;
        if (!actor) {
            return;
        }

        if (this.#TOKENS.has(token.id)) {
            return;
        }

        const interval = setInterval(async () => {
            const activeTints = actor.effects
                .map(e => e.changes).flat()
                .filter(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN)
                .map(c => c.value);

            if (activeTints.length < 2) {
                clearInterval(interval);
                this.#TOKENS.delete(token.id);
                return;
            }

            const currentIndex = this.#TOKENS.get(token.id)?.index || 0;
            const nextIndex = (currentIndex + 1) % activeTints.length;
            const nextTint = activeTints[nextIndex];

            await TokenUtils.updateDocument(token, { [ActiveEffectsUtils.KEYS.TINT_TOKEN]: nextTint })

            this.#TOKENS.set(token.id, { interval, index: nextIndex });
        }, this.#OSCILLATION_TIME);

        this.#TOKENS.set(token.id, { interval, index: 0 });
    }

    static stopOscillationForToken(token) {
        const interval = this.#TOKENS.get(token.id);
        if (interval) {
            clearInterval(interval);
            this.#TOKENS.delete(token.id);
        }

        const actor = token.actor;
        if (!actor) {
            return
        };

        const remainingTintEffect = actor.effects.find(e => e.changes.some(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN));
        if (remainingTintEffect) {
            const tintChange = remainingTintEffect.changes.find(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN);
            const tint = tintChange?.value ?? null;
            TokenUtils.updateDocument(token, { [ActiveEffectsUtils.KEYS.TINT_TOKEN]: tint });
        } else {
            TokenUtils.updateDocument(token, { [ActiveEffectsUtils.KEYS.TINT_TOKEN]: null });
        }
    }

    static verifyOscilatingTokens() {
        const tokensOnCanvas = TokenUtils.getTokensPlaceables() ?? [];
        for (const token of tokensOnCanvas) {
            const actor = token.actor;
            if (!actor) {
                continue;
            }

            const tintEffects = actor.effects.filter(e => e.changes.some(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN));
            if (tintEffects.length > 1) {
                OscillatingTintManager.startOscillationForToken(token);
            }
        }
    }
}
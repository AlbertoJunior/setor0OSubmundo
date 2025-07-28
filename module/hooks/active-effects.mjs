import { ActiveEffectsUtils } from "../core/effect/active-effects.mjs";
import { OscillatingTintManager } from "../core/effect/oscilating-effect-manager.mjs";
import { FlagsUtils } from "../utils/flags-utils.mjs";
import { ActiveEffectsFlags } from "../enums/active-effects-enums.mjs";
import { TokenUtils } from "../core/token/token-utils.mjs";
import { Setor0TokenDocument } from "../core/token/Setor0TokenDocument.mjs";
import { FoundryApi } from "../utils/foundry-api.mjs";

export class ActiveEffectHookHandle {
    static register() {
        Hooks.on("createActiveEffect", ActiveEffectHookHandle.#onCreateActiveEffect);
        Hooks.on("deleteActiveEffect", ActiveEffectHookHandle.#onDeleteActiveEffect);
    }

    static async #onCreateActiveEffect(effect, options, userId) {
        if (game.user.isGM) {
            await ActiveEffectHookHandle.#verifyRemoveChain(effect, options, userId)
            await ActiveEffectHookHandle.#verifyChangeTokenTint(effect, options);
        }
    }

    static async #onDeleteActiveEffect(effect, options, userId) {
        await ActiveEffectHookHandle.#verifyRemoveTokenTint(effect);
    }

    static async #verifyRemoveChain(effect) {
        const effectsToRemove = new Set(FlagsUtils.getItemFlag(effect, ActiveEffectsFlags.REMOVE_EFFECTS) || []);
        const actor = effect.parent;
        const actorEffects = actor.effects
            .filter(eft => effectsToRemove.has(ActiveEffectsUtils.getOriginId(eft)))
            .map(eft => ActiveEffectsUtils.getOriginId(eft))
            .filter(Boolean);

        await ActiveEffectsUtils.removeActorEffects(actor, actorEffects);
    }

    static async #verifyChangeTokenTint(effect, options) {
        const token = this.#getToken(options);
        if (!token) {
            console.warn("this object not have a token")
            return;
        }

        const actor = token.actor;
        if (!actor) {
            console.warn("Token Actor is invalid");
            return;
        }

        const hasMultipleTints = this.#hasMultipleTints(actor);
        if (hasMultipleTints) {
            OscillatingTintManager.startOscillationForToken(token);
        } else {
            const tintChange = effect.changes.find(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN);
            if (tintChange) {
                await TokenUtils.updateDocument(token, { [ActiveEffectsUtils.KEYS.TINT_TOKEN]: tintChange.value });
            }
        }
    }

    static #getToken(options) {
        const parent = options.parent;
        if (parent instanceof Actor) {
            return TokenUtils.getActorToken(parent);
        }

        if (parent.parent instanceof FoundryApi.TokenDocument) {
            return TokenUtils.getTokenById(parent.parent.id);
        }

        console.warn("this object not have oscilating token tint")
        return;
    }

    static async #verifyRemoveTokenTint(effect) {
        const actor = effect.parent;

        const token = TokenUtils.getActorToken(actor);
        if (!token) {
            return;
        }

        const hasMultipleTints = this.#hasMultipleTints(actor);
        if (hasMultipleTints) {
            OscillatingTintManager.startOscillationForToken(token);
        } else {
            OscillatingTintManager.stopOscillationForToken(token);
        }
    }

    static #hasMultipleTints(actor) {
        return actor.effects.filter(e => e.changes.some(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN)).length > 1;
    }
}

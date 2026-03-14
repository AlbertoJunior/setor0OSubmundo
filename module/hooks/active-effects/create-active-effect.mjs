import { ActiveEffectsUtils } from "../../core/effect/active-effects-utils.mjs";
import { OscillatingTintManager } from "../../core/effect/oscilating-effect-manager.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { TokenUtils } from "../../core/token/token-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class CreateActiveEffectHookHandle {

  static async handle(effect, options, userId) {
    await CreateActiveEffectHookHandle.#verifyRemoveChain(effect, options, userId)
    await CreateActiveEffectHookHandle.#verifyChangeTokenTint(effect, options);
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
    const tintChange = effect.changes.find(c => c.key === ActiveEffectsUtils.KEYS.TINT_TOKEN);
    if (!tintChange) {
      return
    }

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

    const hasEffectsWithTint = ActiveEffectsUtils.hasEffectsWithTint(actor);
    if (hasEffectsWithTint) {
      OscillatingTintManager.startOscillationForToken(token);
    } else {
      await TokenUtils.updateDocument(token, { [ActiveEffectsUtils.KEYS.TINT_TOKEN]: tintChange.value });
    }
  }

  static #getToken(options) {
    const parent = options.parent;
    if (parent instanceof Actor) {
      return TokenUtils.getActorToken(parent);
    }

    if (parent instanceof ActorDelta) {
      return TokenUtils.getActorDeltaToken(parent);
    }

    if (parent.parent instanceof FoundryApi.TokenDocument) {
      return TokenUtils.getTokenById(parent.parent.id);
    }

    console.warn("this object not have oscilating token tint")
    return;
  }
}

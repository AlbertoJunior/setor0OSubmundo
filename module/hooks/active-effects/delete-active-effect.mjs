import { ActiveEffectsUtils } from "../../core/effect/active-effects-utils.mjs";
import { OscillatingTintManager } from "../../core/effect/oscilating-effect-manager.mjs";
import { TokenUtils } from "../../core/token/token-utils.mjs";

export class DeleteActiveEffectHookHandle {

  static async handle(effect, options, userId) {
    await DeleteActiveEffectHookHandle.#verifyRemoveTokenTint(effect);
  }

  static async #verifyRemoveTokenTint(effect) {
    const actor = effect.parent;

    const token = TokenUtils.getActorToken(actor);
    if (!token) {
      return;
    }

    const hasEffectsWithTint = ActiveEffectsUtils.hasEffectsWithTint(actor);
    if (hasEffectsWithTint) {
      OscillatingTintManager.startOscillationForToken(token);
    } else {
      OscillatingTintManager.stopOscillationForToken(token);
    }
  }
}

import { ActiveEffectsUtils } from "../../core/effect/active-effects-utils.mjs";
import { OscillatingTintManager } from "../../core/effect/oscilating-effect-manager.mjs";

export class CreateTokenHookHandle {
  static handle(tokenDocument, action, id) {
    const actor = tokenDocument.actor;
    if (!actor) {
      return;
    }

    const hasEffectsWithTint = ActiveEffectsUtils.hasEffectsWithTint(actor);
    if (hasEffectsWithTint) {
      OscillatingTintManager.startOscillationForToken(tokenDocument);
    }
  }
}
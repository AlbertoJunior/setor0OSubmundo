import { Setor0TokenDocument } from "../../base/document/Setor0TokenDocument.mjs";

export class TokenUtils {
  static getTokensPlaceables() {
    return canvas.tokens.placeables;
  }

  static getMovement(token) {
    if (!token) {
      console.warn("Token is null");
      return {
        error: "Token is null",
        history: 0,
        passed: 0,
      };
    }

    return {
      history: token.movement.history.cost,
      passed: token.movement.passed.cost
    }
  }

  static getTokenById(tokenId) {
    if (!tokenId) {
      console.warn("tokenId is null");
      return;
    }

    return this.getTokensPlaceables().find(t => t.id === tokenId);
  }

  static getActorToken(actor) {
    if (!actor) {
      console.warn("Actor is null");
      return;
    }

    const actorId = actor.id;
    return this.getTokensPlaceables().find(t => t.actor?.id === actorId);
  }

  static getActorDeltaToken(actorDelta) {
    if (!actorDelta) {
      console.warn("ActorDelta is null");
      return;
    }

    const actorDeltaParentId = actorDelta.parent?.id;
    return this.getTokenById(actorDeltaParentId);
  }

  static getTokenByCombatantTokenId(combatantTokenId) {
    if (!combatantTokenId) {
      console.warn("combatantTokenId is null");
      return;
    }

    return this.getTokenById(combatantTokenId);
  }

  static getControlled() {
    return canvas.tokens.controlled[0];
  }

  static getImg(token) {
    if (!token) {
      console.warn("Token is null");
      return;
    }

    return token.texture.src;
  }

  static async updateDocument(token, change = {}) {
    if (!token) {
      console.warn("Token is null");
      return;
    }

    if (token instanceof Setor0TokenDocument) {
      await token.update(change)
    } else if (token.document && token.document instanceof Setor0TokenDocument) {
      await token.document.update(change)
    } else {
      console.warn("Token is not a document");
    }
  }
}
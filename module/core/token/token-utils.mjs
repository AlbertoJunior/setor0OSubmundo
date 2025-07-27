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

        return this.getTokensPlaceables().find(t => t.actor?.id === actor.id);
    }

    static getTokenByCombatantTokenId(combatantTokenId) {
        if (!combatantTokenId) {
            console.warn("combatantTokenId is null");
            return;
        }

        return this.getTokensPlaceables().find(t => t.id === combatantTokenId);
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
        await token.document.update(change)
    }
}
import { TokenUtils } from "../token/token-utils.mjs";

export class CombatUtils {
    static currentCombat() {
        return game.combat;
    }

    static refreshRender() {
        ui.combat.render()
    }

    static async addOrUpdateActorOnCombat(actor, initiative, combatantInformations = {}) {
        const { hidden = false, combatantId, combatantTokenId } = combatantInformations;
        const currentCombat = this.currentCombat();
        if (!currentCombat) {
            return;
        }

        if (!actor) {
            return;
        }

        const token = combatantTokenId
            ? TokenUtils.getTokenByCombatantTokenId(combatantTokenId)
            : TokenUtils.getActorToken(actor);
        if (!token) {
            return;
        }

        const existingCombatant = combatantId
            ? this.getCombatantById(currentCombat, combatantId)
            : currentCombat.combatants.find(c => c.actor.id === actor.id);
        if (existingCombatant) {
            await existingCombatant.update({ initiative: initiative });
        } else {
            await this.#add(currentCombat, { token: token, actor: actor, hidden: hidden, initiative: initiative });
        }
    }

    static getCombatantById(currentCombat, combatantId) {
        return currentCombat.combatants.find(c => c.id === combatantId);
    }

    static getTokenInformations(combatantTokenId) {
        const token = TokenUtils.getTokenByCombatantTokenId(combatantTokenId);
        const document = token.document;
        return {
            id: document.id,
            name: document.name,
            disposition: document.disposition
        }
    }

    static async #add(currentCombat, params) {
        const { token, actor, hidden, initiative } = params;
        const combatant = {
            tokenId: token.id,
            sceneId: token.scene.id,
            actorId: actor.id,
            hidden: hidden,
            initiative: initiative
        }

        await currentCombat.createEmbeddedDocuments("Combatant", [combatant]);
    }
}
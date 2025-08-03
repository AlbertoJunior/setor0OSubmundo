import { ActorUtils } from "../../../core/actor/actor-utils.mjs";
import { DefaultActions } from "../../../utils/default-actions.mjs";
import { ActiveEffectsUtils } from "../../../core/effect/active-effects-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";

export async function configureSetor0Combat() {
    CONFIG.Combat.documentClass = Setor0Combat;
}

class Setor0Combat extends FoundryApi.Combat {
    getData() {
        const data = super.getData();
        return data;
    }

    async rollInitiative(combatantIdArray) {
        if (combatantIdArray) {
            for (const combatantId of combatantIdArray) {
                const combatant = this.combatants.get(combatantId);
                const actor = combatant.actor;
                const combatantInformations = { combatantId: combatantId, combatantTokenId: combatant.tokenId, hidden: combatant.hidden };
                await DefaultActions.processInitiativeRoll(actor, combatantInformations);
            }
        } else {
            super.rollInitiative(combatantIdArray);
        }
    }

    _getInitiativeFormula(combatant) {
        const actor = combatant.actor;
        const formula = this.constructor.defaultInitiative;
        if (!actor) {
            return formula;
        }

        return formula + ActorUtils.calculateInitiative(actor);
    }

    async startCombat() {
        return super.startCombat();
    }

    async nextTurn() {
        return super.nextTurn();
    }

    async previousTurn() {
        return super.previousTurn();
    }

    async nextRound() {
        return super.nextRound();
    }

    async previousRound() {
        return super.previousRound();
    }

    async endCombat() {
        return super.endCombat();
    }

    async delete() {
        await this.#removeActorCombatEffects();
        return super.delete();
    }

    async #removeActorCombatEffects() {
        const combatId = this.id;
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            if (!actor) {
                continue;
            }

            const effectsToRemove = actor.effects
                .filter(effect => effect.duration?.combat?.id === combatId)
                .map(effect => ActiveEffectsUtils.getOriginId(effect))
                .filter(Boolean);

            ActiveEffectsUtils.removeActorEffects(actor, effectsToRemove);
        }
    }
}
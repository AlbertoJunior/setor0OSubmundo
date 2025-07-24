import { FoundryApi } from "../../../utils/foundry-api.mjs";

class Setor0CombatTracker extends FoundryApi.CombatTracker {
    async _prepareTurnContext(combat, combatant, index) {
        const turn = await super._prepareTurnContext(combat, combatant, index);
        if (game.user.isGM || combatant.actor.isOwner) {
            return turn
        } else {
            turn.effects.icons = [];
            turn.effects.tooltip = '';
            return turn;
        }
    }
}

export async function configureSetor0CombatTracker() {
    CONFIG.ui.combat = Setor0CombatTracker;
}
import { TokenUtils } from "../../../core/token/token-utils.mjs";
import { ActiveEffectsFlags } from "../../../enums/active-effects-enums.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";

export function configureSetor0CombatTracker() {
    CONFIG.ui.combat = Setor0CombatTracker;
}

class Setor0CombatTracker extends FoundryApi.CombatTracker {
    async _prepareTurnContext(combat, combatant, index) {
        const turn = await super._prepareTurnContext(combat, combatant, index);

        this.#verifyUpdateName(turn, combatant);
        this.#verifyUpdateImg(turn, combatant);

        if (game.user.isGM || combatant.actor.isOwner) {
            return turn
        } else {
            this.#removeSecretEffects(turn, combatant);
            return turn;
        }
    }

    #verifyUpdateName(turn, combatant) {
        const tokenName = combatant.token.name;
        if (tokenName && tokenName !== turn.name) {
            turn.name = tokenName;
        }
    }

    #verifyUpdateImg(turn, combatant) {
        const tokenImg = TokenUtils.getImg(combatant.token);
        if (tokenImg && tokenImg !== turn.img) {
            turn.img = tokenImg;
        }
    }

    #removeSecretEffects(turn, combatant) {
        const temporaryEffects = combatant.actor?.temporaryEffects ?? [];
        const filtered = temporaryEffects.filter(effect => effect.img && FlagsUtils.getItemFlag(effect, ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN, false));
        turn.effects = {
            icons: filtered.map(effect => {
                return {
                    img: effect.img,
                    name: effect.name
                }
            }),
            tooltip: super._formatEffectsTooltip(filtered)
        };
    }
}
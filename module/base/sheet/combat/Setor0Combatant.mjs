import { FoundryApi } from "../../../api/foundry-api.mjs";

export function configureSetor0Combatant() {
    CONFIG.Combatant.documentClass = Setor0Combatant;
}

class Setor0Combatant extends FoundryApi.Combatant {
    updateResource() {
        if (!this.actor || !this.combat) {
            return this.resource = null;
        }
        const value = FoundryApi.Utils.getProperty(this.actor.system, this.parent.settings.resource);

        if (value == null || value == undefined) {
            this.resource = value;
        } else {
            this.resource = Number(value);
        }

        return this.resource;
    }
}

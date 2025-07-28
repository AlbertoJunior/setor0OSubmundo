import { TODO } from "../../../../../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../../../../core/actor/actor-equipment.mjs";
import { ActiveEffectsUtils } from "../../../../../core/effect/active-effects.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";

export const effectsHandleEvents = {
    [OnEventType.CHECK]: async (actor, event) => EffectsHandleEvents.handleCheck(actor, event),
    [OnEventType.REMOVE]: async (actor, event) => EffectsHandleEvents.handleRemove(actor, event),
    [OnEventType.VIEW]: async (actor, event) => EffectsHandleEvents.handleView(actor, event),
}

class EffectsHandleEvents {
    static async handleCheck(actor, event) {
        const mapCheck = {
            'refresh': async () => await this.#handleRefresh(actor),
            'expand': async () => this.#handleExpand(actor, event),
        }

        const type = event.currentTarget.dataset.type;
        const method = mapCheck[type];
        if (!method) {
            console.warn(`[${type}] não existe para [check]`);
            return
        }
        
        await method()
    }

    static async #handleRefresh(actor) {
        const nonePassiveEffects = actor.effects
            .filter(effect => !ActiveEffectsUtils.isPassive(effect))
            .map(effect => ActiveEffectsUtils.getOriginId(effect));

        await ActiveEffectsUtils.removeActorEffects(actor, nonePassiveEffects);
        ActorEquipmentUtils.verifyPassiveSuperEquipmentEffects(actor);
    }

    static #handleExpand(actor, event) {
        const minHeight = actor.sheet.defaultHeight;
        const container = event.currentTarget.parentElement.parentElement.querySelector('#effects-container');
        const resultExpand = HtmlJsUtils.expandOrContractElement(container, { minHeight: minHeight });
        HtmlJsUtils.flipClasses(event.currentTarget.children[0], 'fa-chevron-down', 'fa-chevron-up');

        actor.sheet.isExpandedEffects = resultExpand.isExpanded;
    }

    static async handleRemove(actor, event) {
        const currentTarget = event.currentTarget;
        const removeType = currentTarget.dataset.type;
        if (removeType == 'single') {
            const itemId = currentTarget.dataset.itemId;
            const effect = actor.effects.get(itemId);
            await ActiveEffectsUtils.removeActorEffect(actor, ActiveEffectsUtils.getOriginId(effect));
        } else if (removeType == 'all') {
            const effects = actor.effects.map(effect => ActiveEffectsUtils.getOriginId(effect));
            await ActiveEffectsUtils.removeActorEffects(actor, effects);
        }
    }

    static async handleView(actor, event) {
        TODO('implementar');
    }
}
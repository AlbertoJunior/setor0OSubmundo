import { getObject } from "../../scripts/utils/utils.mjs";
import { ActorType, CharacteristicType } from "../enums/characteristic-enums.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "../utils/flags-utils.mjs";

export class UpdateActorHookHandle {
    static #mapHandle = {
        [ActorType.PLAYER]: async (updatedActor, changes, options, userId) => {
            UpdateActorHookHandle.#handlePlayerUpdate(updatedActor, changes, options, userId)
        },
        [ActorType.NPC]: async (updatedActor, changes, options, userId) => {
            UpdateActorHookHandle.#handleNpcUpdate(updatedActor, changes, options, userId)
        },
    }

    static async handle(updatedActor, changes, options, userId) {
        await this.#mapHandle[updatedActor.type]?.(updatedActor, changes, options, userId);
    }

    static async #handlePlayerUpdate(updatedActor, changes, options, userId) {
        const { name, img } = changes;
        if (!name && !img) {
            return;
        }
        this.#refreshRenderSheetIfHasAlliesInformants(updatedActor.id);
    }

    static async #handleNpcUpdate(updatedActor, changes, options, userId) {
        const { name, img, system } = changes;
        if (!name && !img && !system) {
            return;
        }
        this.#refreshRenderSheetIfHasAlliesInformants(updatedActor.id);
    }

    static async #refreshRenderSheetIfHasAlliesInformants(updatedActorId) {
        const startRefreshTime = new Date().getTime();
        game.actors.forEach(actor => {
            const allies = getObject(actor, CharacteristicType.ALLIES) || [];
            const informants = getObject(actor, CharacteristicType.INFORMANTS) || [];
            const all = new Set([...allies, ...informants]);
            if (all.has(updatedActorId)) {
                if (this.#verifyNeedUpdate(actor, startRefreshTime)) {
                    FlagsUtils.setItemFlag(actor, SystemFlags.OTHER.LAST_REFRESH, startRefreshTime);
                    actor.sheet.render(false);
                }
            }
        });
    }

    static #verifyNeedUpdate(actor, currentTime) {
        if (!actor.sheet.rendered) {
            return false;
        }

        const lastRefresh = FlagsUtils.getItemFlag(actor, SystemFlags.OTHER.LAST_REFRESH);
        return !lastRefresh || currentTime - lastRefresh > 1000
    }
}
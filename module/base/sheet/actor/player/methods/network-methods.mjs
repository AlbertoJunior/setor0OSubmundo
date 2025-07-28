import { getObject, onArrayRemove } from "../../../../../utils/utils.mjs";
import { NpcConversor } from "../../../../../core/npc/npc-conversor.mjs";
import { NpcDialog } from "../../../../../creators/dialog/npc-dialog.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";

export const alliesHandleEvents = {
    [OnEventType.REMOVE]: async (actor, event) => NetworkHandleEvents.handleRemove(actor, CharacteristicType.ALLIES, event),
    [OnEventType.VIEW]: async (actor, event) => NetworkHandleEvents.handleView(actor, event),
}

export const informantsHandleEvents = {
    [OnEventType.REMOVE]: async (actor, event) => NetworkHandleEvents.handleRemove(actor, CharacteristicType.INFORMANTS, event),
    [OnEventType.VIEW]: async (actor, event) => NetworkHandleEvents.handleView(actor, event),
}

class NetworkHandleEvents {
    static async handleRemove(actor, characteristic, event) {
        const itemId = event.currentTarget.dataset.itemId;
        const allies = getObject(actor, characteristic) || [];
        onArrayRemove(allies, itemId);
        await ActorUpdater.verifyAndUpdateActor(actor, characteristic, allies);
    }

    static async handleView(actor, event) {
        const itemId = event.currentTarget.dataset.itemId;
        const fetchedActor = game.actors.get(itemId);
        if (!fetchedActor) {
            return;
        }

        if (fetchedActor.type == "Player") {
            const npcFromActor = NpcConversor.actorToNpc(fetchedActor);
            NpcDialog.open(npcFromActor);
        } else {
            fetchedActor.sheet?.render(true, { editable: false });
        }
    }
}
import { ChatCreator } from "../../../../../utils/chat-creator.mjs";
import { TraitDialog } from "../../../../../creators/dialog/trait-dialog.mjs";
import { TraitRepository } from "../../../../../repository/trait-repository.mjs";
import { TraitField } from "../../../../../field/trait-field.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { TraitMessageCreator } from "../../../../../creators/message/trait-message.mjs";
import { getObject, localize, TODO } from "../../../../../utils/utils.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";

function getCharacteristic(type) {
    return type == 'good' ? CharacteristicType.TRAIT.GOOD : CharacteristicType.TRAIT.BAD;
}

function getItemIndex(target) {
    const itemIndex = target.parentElement.dataset.itemIndex;
    if (itemIndex == undefined || itemIndex < 0) {
        return -1;
    }
    return itemIndex;
}

function getItemId(event) {
    return event.currentTarget.dataset.itemId;
}

function getTraitType(event) {
    return event.currentTarget.dataset.type;
}

export const traitMethods = {
    [OnEventType.ADD]: async (actor, event) => {
        const traitType = getTraitType(event);

        TraitDialog.open(traitType, async (trait) => {
            const characteristic = getCharacteristic(traitType);
            const actorTraits = getObject(actor, characteristic) || [];

            const objectTrait = TraitField.toJson({
                sourceId: trait.id,
                name: trait.name,
                particularity: trait.particularity
            });
            const updatedTraits = [...actorTraits, objectTrait];

            TODO("Verificar se vai adicionar algum bonus");

            await ActorUpdater.verifyAndUpdateActor(actor, characteristic, updatedTraits);
        });
    },
    [OnEventType.EDIT]: async (actor, event) => {
        const target = event.currentTarget;
        const itemIndex = getItemIndex(target);
        if (itemIndex < 0) {
            return;
        }

        const traitType = getTraitType(event);
        const characteristic = getCharacteristic(traitType);
        const actorTraits = getObject(actor, characteristic) || [];

        const trait = actorTraits[itemIndex];

        TraitDialog.openByTrait(trait, traitType, actor, async (editedTrait) => {
            const objectTrait = TraitField.toJson(editedTrait.id, editedTrait.name, editedTrait.particularity);
            const updatedTraits = [...actorTraits];
            updatedTraits[itemIndex] = objectTrait;
            await ActorUpdater.verifyAndUpdateActor(actor, characteristic, updatedTraits);
        });
    },
    [OnEventType.REMOVE]: async (actor, event) => {
        const target = event.currentTarget;
        const itemIndex = getItemIndex(target);
        if (itemIndex < 0) {
            return;
        }

        const traitType = getTraitType(event);
        const characteristic = getCharacteristic(traitType);
        const actorTraits = getObject(actor, characteristic) || [];

        const updatedTraits = [...actorTraits];
        updatedTraits.splice(itemIndex, 1);

        TODO("Verificar se vai remover algum bonus");

        await ActorUpdater.verifyAndUpdateActor(actor, characteristic, updatedTraits);
    },
    [OnEventType.CHAT]: async (actor, event) => {
        const traitType = getTraitType(event);
        const traitId = getItemId(event);

        const fetchedActorTrait = getObject(actor, getCharacteristic(traitType)).find(trait => trait.id == traitId);
        const sourceId = getObject(fetchedActorTrait, CharacteristicType.TRAIT.SOURCE_ID);
        if (!sourceId) {
            NotificationsUtils.error(localize("Aviso.Erro.Traco_Invalido"));
            return;
        }

        const originalTrait = TraitRepository.getItemByTypeAndId(traitType, sourceId);
        const mixedTrait = {
            ...originalTrait,
            particularity: getObject(fetchedActorTrait, CharacteristicType.TRAIT.PARTICULARITY)
        };

        const messageContent = await TraitMessageCreator.mountContent(mixedTrait);
        ChatCreator.sendToChat(actor, messageContent);
    },
    [OnEventType.VIEW]: async (actor, event) => {
        const target = event.currentTarget;
        const itemIndex = getItemIndex(target);
        if (itemIndex < 0) {
            return;
        }

        const traitType = getTraitType(event);
        const characteristic = getCharacteristic(traitType);
        const trait = getObject(actor, characteristic)?.[itemIndex];

        TraitDialog.openByTrait(trait, traitType, actor, undefined);
    }
}
import { ActorUtils } from "../../../../../core/actor/actor-utils.mjs";
import { selectCharacteristic } from "../../../../../utils/utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType, CharacteristicTypeMap } from "../../../../../enums/characteristic-enums.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";

export async function characteristicOnClick(event, actor) {
    const element = event.target;

    selectCharacteristic(element);

    const characteristicType = event.currentTarget.dataset.characteristic;
    const systemCharacteristic = CharacteristicTypeMap[characteristicType];

    if (systemCharacteristic) {
        const parentElement = element.parentElement;
        const level = Array.from(parentElement.children).filter(el => el.classList.contains('S0-selected')).length;
        handle(actor, systemCharacteristic, parentElement.id, level);
    }
}

async function handle(actor, systemCharacteristic, id, level) {
    if (systemCharacteristic.includes(CharacteristicType.VIRTUES.id)) {
        handleVirtue(actor, id, level);
    } else {
        handleOtherwise(actor, systemCharacteristic, id, level);
    }
}

async function handleVirtue(actor, virtueId, level) {
    let characteristic;

    switch (virtueId) {
        case CharacteristicType.VIRTUES.CONSCIOUSNESS.id: {
            characteristic = CharacteristicType.VIRTUES.CONSCIOUSNESS.LEVEL;
            break;
        }
        case CharacteristicType.VIRTUES.PERSEVERANCE.id: {
            characteristic = CharacteristicType.VIRTUES.PERSEVERANCE.LEVEL;
            break;
        }
        case CharacteristicType.VIRTUES.QUIETNESS.id: {
            characteristic = CharacteristicType.VIRTUES.QUIETNESS.LEVEL;
            break;
        }
        default: {
            console.warn("-> Possível erro ao pegar a virtude");
            return;
        }
    }

    await ActorUpdater.verifyAndUpdateActor(actor, characteristic, level);
}

async function handleOtherwise(actor, systemCharacteristic, characteristicId, level) {
    const params = [];
    params.push(
        {
            systemCharacteristic: `${systemCharacteristic}.${characteristicId}`,
            value: level
        }
    );

    if (characteristicId == CharacteristicType.ATTRIBUTES.STAMINA.id) {
        params.push(
            {
                systemCharacteristic: BaseActorCharacteristicType.VITALITY.TOTAL,
                value: ActorUtils.calculateVitalityByUpAttribute(actor, level)
            }
        );
    }

    await ActorUpdater.verifyKeysAndUpdateActor(actor, params);
}

import { ActorEquipmentUtils } from "../../module/core/actor/actor-equipment.mjs";
import { ActorUtils } from "../../module/core/actor/actor-utils.mjs";
import { CharacteristicType } from "../../module/enums/characteristic-enums.mjs";
import { getObject } from "../utils/utils.mjs";

const map = {
    'equipment_filtered': (actor) => {
        const type = actor?.sheet?.filterBag || 0;
        return ActorEquipmentUtils.getFilteredUnequippedEquipment(actor, type);
    },
    'equipment_equipped': (actor) => ActorEquipmentUtils.getEquippedItems(actor),
    'allies': (actor) => ActorUtils.getAllies(actor),
    'informants': (actor) => ActorUtils.getInformants(actor),
    'good_traits': (actor) => getObject(actor, CharacteristicType.TRAIT.GOOD),
    'bad_traits': (actor) => getObject(actor, CharacteristicType.TRAIT.BAD),
    'effects': (actor) => ActorUtils.getEffectsSorted(actor),
    'shortcuts': (actor) => getObject(actor, CharacteristicType.SHORTCUTS),
}

export default function actorLists(actor, value) {
    const mappedItem = map[value]
    if (typeof mappedItem == 'function') {
        return mappedItem(actor);
    }

    return [];
}
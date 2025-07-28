import { getObject, onArrayRemove, } from "../../../../utils/utils.mjs";
import { ActiveEffectsUtils } from "../../../../core/effect/active-effects.mjs";
import { EquipmentUtils } from "../../../../core/equipment/equipment-utils.mjs";
import { SuperEquipmentEffectsDialog } from "../../../../creators/dialog/superequipment-effects-dialog.mjs";
import { EquipmentCharacteristicType } from "../../../../enums/equipment-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { EquipmentUpdater } from "../../../updater/equipment-updater.mjs";

export const handlerSuperEquipmentEvents = {
    [OnEventType.ADD]: async (item, event) => SuperEquipmentSheeHandle.add(item, event),
    [OnEventType.REMOVE]: async (item, event) => SuperEquipmentSheeHandle.remove(item, event),
    [OnEventType.CHECK]: async (item, event) => SuperEquipmentSheeHandle.check(item, event),
}

class SuperEquipmentSheeHandle {
    static add(item, event) {
        const dataset = event.currentTarget.dataset;
        if (dataset.subcharacteristic == 'trait') {
            this.#addTrait(item, dataset.type);
        }
    }

    static #addTrait(item, type) {
        SuperEquipmentEffectsDialog.open(type, async (selectedEffect, characteristic) => {
            const actualList = getObject(item, characteristic) || [];
            const finalList = [...actualList, selectedEffect];

            const allTraits = [...EquipmentUtils.getSuperEquipmentTraits(item), selectedEffect];
            const needsActivate = EquipmentUtils.superEquipmentNeedsActivate(allTraits);

            const changes = [
                EquipmentUpdater.createChange(characteristic, finalList),
                EquipmentUpdater.createChange(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, !needsActivate)
            ];

            await EquipmentUpdater.updateEquipmentData(item, changes);
            this.#verifyActiveEffects(item);
        });
    }

    static async remove(item, event) {
        const dataset = event.currentTarget.dataset;
        if (dataset.subcharacteristic == 'trait') {
            await this.#verifyAndRemoveTrait(item, dataset.itemId, dataset.type);
        }
    }

    static async #verifyAndRemoveTrait(item, itemId, type) {
        if (!itemId) {
            return;
        }

        const isGood = type == 'good';

        const characteristic = isGood
            ? EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS
            : EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS;

        const list = getObject(item, characteristic) || [];
        const itemIndex = list.findIndex(trait => trait.id == itemId);
        if (itemIndex >= 0) {
            const trait = list[itemIndex];
            onArrayRemove(list, trait);

            const needsActivate = EquipmentUtils.getSuperEquipmentNeedsActivate(item);
            const changes = [
                EquipmentUpdater.createChange(characteristic, list),
                EquipmentUpdater.createChange(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, !needsActivate)
            ];

            await EquipmentUpdater.updateEquipmentData(item, changes);
            this.#verifyActiveEffects(item);
        }
    }

    static async check(item, event) {
        const isActive = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE) || false;
        await EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, !isActive);
        this.#verifyActiveEffects(item);
    }

    static async #verifyActiveEffects(item) {
        if (!item.actor) {
            return;
        }

        const activeEffect = ActiveEffectsUtils.getActorEffect(item.actor, item.id);
        if (activeEffect) {
            await this.#removeActiveEffects(item);
        }

        const isEquipped = getObject(item, EquipmentCharacteristicType.EQUIPPED) || false;
        const isActive = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE) || false;
        if (isEquipped && isActive) {
            await this.#addActiveEffects(item);
        }
    }

    static async #addActiveEffects(item) {
        const effectData = EquipmentUtils.getSuperEquipmentActiveEffect(item);
        if (effectData) {
            await ActiveEffectsUtils.addActorEffect(item.actor, [effectData]);
        }
    }

    static async #removeActiveEffects(item) {
        await ActiveEffectsUtils.removeActorEffect(item.actor, item.id);
    }
}
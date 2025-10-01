import { getObject } from "../../utils/utils.mjs";
import { EquipmentUpdater } from "../../base/updater/equipment-updater.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { EquipmentCharacteristicType, EquipmentType, validEquipmentTypes } from "../../enums/equipment-enums.mjs";
import { ActiveEffectsUtils } from "../effect/active-effects-utils.mjs";
import { EquipmentInfoParser } from "../equipment/equipment-info.mjs";
import { EquipmentUtils } from "../equipment/equipment-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class ActorEquipmentUtils {
    static #allowedTypes = validEquipmentTypes().map(EquipmentInfoParser.equipmentTypeIdToTypeString).filter(Boolean);

    static getEquipments(actor) {
        const object = Object.fromEntries(
            Object.entries(actor.itemTypes).filter(([type]) => this.#allowedTypes.includes(type))
        )

        const allItems = [];
        for (const items of Object.values(object)) {
            allItems.push(...items);
        }
        return allItems.sort((a, b) => a.sort - b.sort);
    }

    static getFilteredEquipment(actor, equipmentTypeId) {
        const items = this.getEquipments(actor);
        if (!equipmentTypeId) {
            return [...items];
        }

        const itemTypeString = EquipmentInfoParser.equipmentTypeIdToTypeString(equipmentTypeId);
        return [...actor.itemTypes[itemTypeString]];
    }

    static getFilteredUnequippedEquipment(actor, equipmentTypeId) {
        const equipments = this.getFilteredEquipment(actor, equipmentTypeId);
        return [...equipments.filter(item => !getObject(item, EquipmentCharacteristicType.EQUIPPED))];
    }

    static getEquipmentById(actor, equipmentId) {
        return actor.items.get(equipmentId);
    }

    static getEquippedItems(actor) {
        const items = this.getEquipments(actor);
        return [...items.filter(item => getObject(item, EquipmentCharacteristicType.EQUIPPED))];
    }

    static createDataItem(equipment, params = {}) {
        if (!equipment) {
            return undefined;
        }

        const { flags = {}, effects = [] } = params;

        const itemData = FoundryApi.duplicate(equipment);

        return {
            name: itemData.name,
            img: itemData.img,
            flags: {
                [SYSTEM_ID]: {
                    sourceId: itemData._id,
                    ...flags
                }
            },
            effects: effects,
            type: itemData.type,
            system: itemData.system
        };
    }

    static getEquippedArmorItem(actor) {
        const equipments = this.getEquippedItems(actor);
        const item = equipments.find(item => getObject(item, EquipmentCharacteristicType.TYPE) == EquipmentType.ARMOR);
        return item;
    }

    static getArmorEquippedValues(actor) {
        const equippedArmor = ActorEquipmentUtils.getEquippedArmorItem(actor);
        if (Boolean(equippedArmor)) {
            return {
                max: getObject(equippedArmor, EquipmentCharacteristicType.RESISTANCE) || 0,
                value: getObject(equippedArmor, EquipmentCharacteristicType.ACTUAL_RESISTANCE) || 0,
            };
        } else {
            return {
                max: 0,
                value: 0,
            };
        }
    }

    static getArmorEquippedResistence(actor) {
        const equippedArmor = this.getEquippedArmorItem(actor);
        return getObject(equippedArmor, EquipmentCharacteristicType.RESISTANCE) || 0;
    }

    static getArmorEquippedActualResistence(actor) {
        const equippedArmor = this.getEquippedArmorItem(actor);
        return getObject(equippedArmor, EquipmentCharacteristicType.ACTUAL_RESISTANCE) || 0;
    }

    static async equip(actor, equipment) {
        const changes = [
            EquipmentUpdater.createChange(EquipmentCharacteristicType.EQUIPPED, true),
        ];

        const superEquipment = getObject(equipment, EquipmentCharacteristicType.SUPER_EQUIPMENT);
        if (superEquipment) {
            const needsActivate = EquipmentUtils.getSuperEquipmentNeedsActivate(equipment);
            changes.push(EquipmentUpdater.createChange(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, !needsActivate));
        }

        await EquipmentUpdater.updateEquipmentData(equipment, changes);

        if (changes[1]?.value) {
            this.verifyPassiveSuperEquipmentEffects(actor);
        }
    }

    static async unequip(actor, equipment) {
        const changes = [
            EquipmentUpdater.createChange(EquipmentCharacteristicType.EQUIPPED, false),
        ];

        const superEquipment = getObject(equipment, EquipmentCharacteristicType.SUPER_EQUIPMENT);
        if (superEquipment) {
            changes.push(EquipmentUpdater.createChange(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, false));
        }

        await EquipmentUpdater.updateEquipmentData(equipment, changes);

        const activeEffect = ActiveEffectsUtils.getActorEffect(actor, equipment.id);
        if (activeEffect) {
            ActiveEffectsUtils.removeActorEffect(actor, equipment.id);
        }
    }

    static async updateArmorEquippedActualResistance(actor, value) {
        const armor = this.getEquippedArmorItem(actor);
        if (!armor) {
            return;
        }
        const safedValue = Math.min(getObject(armor, EquipmentCharacteristicType.RESISTANCE), value);
        await EquipmentUpdater.updateEquipment(armor, EquipmentCharacteristicType.ACTUAL_RESISTANCE, safedValue);
    }

    static getItemAndRollTest(actor, equipmentId) {
        if (!actor || !equipmentId) {
            return null
        }

        const item = ActorEquipmentUtils.getEquipmentById(actor, equipmentId);
        if (!item) {
            return null;
        }

        const defaultTestId = getObject(item, EquipmentCharacteristicType.DEFAULT_TEST);
        if (!defaultTestId) {
            return null;
        }

        const possibleTests = getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS) || [];
        const rollTest = possibleTests.find(test => test.id == defaultTestId) || null;

        return {
            item,
            rollTest
        };
    }

    static verifyPassiveSuperEquipmentEffects(actor) {
        const equippedItems = ActorEquipmentUtils.getEquippedItems(actor)
            .filter(item => EquipmentUtils.isSuperEquipment(item))
            .filter(superEquipment => getObject(superEquipment, EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE));

        const activatedEffectsIds = new Set(actor.effects.map(effect => {
            return ActiveEffectsUtils.getOriginId(effect);
        }));

        const equipmentsWithoutEffects = equippedItems.filter(item => !activatedEffectsIds.has(item.id));

        const effects = [];
        for (const item of equipmentsWithoutEffects) {
            const effectData = EquipmentUtils.getSuperEquipmentActiveEffect(item);
            if (effectData) {
                effects.push(effectData);
            }
        }

        if (effects.length > 0) {
            ActiveEffectsUtils.addActorEffect(actor, effects);
        }
    }
}
import { SYSTEM_ID, REGISTERED_TEMPLATES, TEMPLATES_PATH, SYSTEM_CLASS_CSS } from "../../../constants.mjs";
import { OnEventTypeClickableEvents } from "../../../enums/on-event-type.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { HtmlJsUtils } from "../../../utils/html-js-utils.mjs";
import { loadAndRegisterTemplates } from "../../../utils/templates.mjs";
import { menuHandleMethods } from "../../menu-default-methods.mjs";
import { handlerEquipmentCharacteristicsEvents } from "./methods/equipment-characteristics-methods.mjs";
import { handlerEquipmentItemRollEvents } from "./methods/equipment-item-roll-methods.mjs";
import { handlerEquipmentMenuRollEvents } from "./methods/equipment-menu-roll-methods.mjs";
import { handlerSuperEquipmentEvents } from "./methods/superequipment-methods.mjs";

export class EquipmentSheet extends FoundryApi.ItemSheet {
    #mapEvents = {
        menu: menuHandleMethods,
        item_roll: handlerEquipmentItemRollEvents,
        menu_roll: handlerEquipmentMenuRollEvents,
        characteristic: handlerEquipmentCharacteristicsEvents,
        superequipment: handlerSuperEquipmentEvents,
    };

    constructor(...args) {
        super(...args);
        this.isExpandedTests = false;
        this.defaultHeight = undefined;
        this.newHeight = undefined;
    }

    static get defaultOptions() {
        return FoundryApi.mergeObject(super.defaultOptions, {
            template: `${TEMPLATES_PATH}/items/default.hbs`,
            width: 320,
        });
    }

    get template() {
        const type = this.item.type.toLowerCase();
        const path = `${TEMPLATES_PATH}/items/sheet/${type}.hbs`;

        if (REGISTERED_TEMPLATES.has(path)) {
            return path;
        }

        return `${TEMPLATES_PATH}/items/default.hbs`
    }

    getData() {
        const data = super.getData();
        data.canEdit = game.user.isGM || this.item.getFlag(SYSTEM_ID, 'canEdit');
        return data;
    }

    get isEditable() {
        return FlagsUtils.getItemFlag(this.item, 'editable', false);
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.#setupListeners(html);
        this.#presetSheet(html);
    }

    #setupListeners(html) {
        const actionsClick = OnEventTypeClickableEvents.map(eventType => (
            {
                selector: `[data-action="${eventType}"]`,
                method: this.#onActionClick
            }
        ));

        actionsClick.forEach(action => html.find(action.selector).click(action.method.bind(this, html)));
    }

    #onActionClick(html, event) {
        this.#onEvent(event.currentTarget.dataset.action, html, event);
    }

    #onEvent(action, html, event) {
        event.preventDefault();
        const characteristic = event.currentTarget.dataset.characteristic;
        const method = this.#mapEvents[characteristic]?.[action];
        if (method) {
            method(this.item, event, html);
        } else {
            console.warn(`-> [${action}] não existe para: [${characteristic}]`);
        }
    }

    #presetSheet(html) {
        HtmlJsUtils.setupContent(html);
        HtmlJsUtils.setupHeader(html);
        this.#presetSheetExpandContainer(html);
    }

    #presetSheetExpandContainer(html) {
        html.find('#rollable-tests-list').toggleClass('S0-expanded', this.isExpandedTests);
        if (this.isExpandedTests && html.find('.fa-chevron-down').length > 0) {
            HtmlJsUtils.flipClasses(html.find('.fa-chevron-down')[0], 'fa-chevron-up', 'fa-chevron-down');
        }

        requestAnimationFrame(() => {
            const content = html.parent().parent()[0];
            if (!this.defaultHeight) {
                const windowElem = content.closest(`.${SYSTEM_CLASS_CSS}`);
                this.defaultHeight = windowElem?.offsetHeight;
            }

            if (this.isExpandedTests) {
                content.style.height = `${Math.max(this.defaultHeight, this.newHeight)}px`
            }
        });
    }
}

export async function equipmentTemplatesRegister() {
    const templates = [
        { path: "items/sheet/armor" },
        { path: "items/sheet/acessory" },
        { path: "items/sheet/melee" },
        { path: "items/sheet/projectile" },
        { path: "items/sheet/substance" },
        { path: "items/sheet/vehicle" },
        { path: "items/others/equipment-bag-item", call: 'equipamentBagItem' },
        { path: "items/others/equipment-equipped-item", call: 'equipamentEquippedItem' },
        { path: "items/others/common-equipment", call: "itemCommon" },
        { path: "items/others/common-weapon", call: "itemCommonWeapon" },
        { path: "items/others/common-resistance", call: "itemCommonResistance" },
        { path: "items/others/common-description", call: "itemCommonDescription" },
        { path: "items/others/rollable-tests", call: "itemRollableTests" },
        { path: "items/others/superequipment", call: "itemSuperEquipment" },
    ];

    return await loadAndRegisterTemplates(templates);
}

export async function registerEquipment() {
    await FoundryApi.Items.unregisterSheet("core", FoundryApi.ItemSheet);
    await FoundryApi.Items.registerSheet(SYSTEM_ID, EquipmentSheet, {
        types: ["Melee", "Projectile", "Armor", "Vehicle", "Substance", "Acessory"],
        makeDefault: true
    });
}
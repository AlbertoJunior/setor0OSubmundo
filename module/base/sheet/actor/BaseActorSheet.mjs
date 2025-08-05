import { getObject, selectCharacteristic } from "../../../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../../core/actor/actor-equipment-utils.mjs";
import { BaseActorCharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType } from "../../../enums/equipment-enums.mjs";
import { OnEventType, OnMethod, verifyAndParseOnEventType } from "../../../enums/on-event-type.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { HtmlJsUtils } from "../../../utils/html-js-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { ActorUpdater } from "../../updater/actor-updater.mjs";

export class Setor0BaseActorSheet extends FoundryApi.ActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ['actor'],
        window: {
            controls: []
        }
    };

    _getHeaderControls() {
        return super._getHeaderControls();
    }

    get mapEvents() {
        throw new Error("Getter 'mapEvents' must be implemented in the subclass.");
    }

    configureSheet(html) {
        console.warn("configureSheet(html) must be implemented in the subclass")
    }

    getMapEvents() {
        return this.mapEvents;
    }

    constructor(...args) {
        super(...args);
        this.currentPage = 1;
    }

    postRenderConfiguration(html) {
        super.postRenderConfiguration(html);
        this.configureSheet(html);
        this._setupAutoTabs(html);
    }

    async updateDocument(document, keyToUpdate, value) {
        await ActorUpdater.verifyAndUpdateActor(document, keyToUpdate, value);
    }

    get isEditable() {
        return FlagsUtils.getActorFlag(this.actor, "editable") && this.canRollOrEdit;
    }

    get canRollOrEdit() {
        return game.user.isGM || this.actor.isOwner;
    }

    getData() {
        const data = super.getData();
        if (data.options) {
            data.options.sheetConfig = Setor0BaseActorSheet.DEFAULT_OPTIONS.sheetConfig;
        }
        data.editable = this.isEditable;
        data.canRoll = this.canRollOrEdit;
        data.canEdit = this.canRollOrEdit;
        data.uuid = this.actor.uuid;
        return data;
    }

    async _onDropActor(event, data) {
        console.log('-> On Drop Actor');
    }

    async _onDropItem(event, data) {
        console.log('-> On Drop Item');
    }

    async onActionClick(html, event) {
        const action = verifyAndParseOnEventType(event.currentTarget.dataset.action, OnMethod.CLICK);
        this.onEvent(action, html, event);
    }

    async onChange(html, event) {
        this.onEvent(OnEventType.CHANGE, html, event);
    }

    async onContextualClick(html, event) {
        const action = verifyAndParseOnEventType(event.currentTarget.dataset.action, OnMethod.CONTEXTUAL);
        this.onEvent(action, html, event);
    }

    async onEvent(action, html, event) {
        event.preventDefault();

        const mapEvents = this.getMapEvents();

        const characteristic = event.currentTarget.dataset.characteristic;
        const method = mapEvents[characteristic]?.[action];
        if (method) {
            method(this.actor, event, html);
        } else {
            console.warn(`-> [${action}] não existe para: [${characteristic}]`);
        }
    }

    static presetStatusVitality(html, actor) {
        let letalDamage = getObject(actor, BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) || 0;
        let superFicialDamage = getObject(actor, BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE) || 0;
        html.find('#vitalidade .S0-characteristic-temp').each((index, item) => {
            if (superFicialDamage > 0) {
                item.classList.add('S0-superficial');
                superFicialDamage--;
            } else if (letalDamage > 0) {
                item.classList.add('S0-letal');
                letalDamage--;
            } else {
                return;
            }
        });
    }

    static presetStatusProtect(html, actor) {
        const armor = ActorEquipmentUtils.getEquippedArmorItem(actor);
        if (!armor) {
            return;
        }

        const value = getObject(armor, EquipmentCharacteristicType.ACTUAL_RESISTANCE) || 0;
        selectCharacteristic(html.find(`#protect .S0-characteristic`)[value - 1]);
    }

    _setupAutoTabs(html) {
        const group = "menu-tabs";
        const contentSelector = `.S0-nav-content`;

        HtmlJsUtils.setupTabs(html, group, contentSelector, this.currentPage - 1, (tab, index) => {
            if (index !== -1) {
                this.currentPage = index + 1;
            }
        });
    }
}
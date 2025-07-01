import { getObject, selectCharacteristic } from "../../../../scripts/utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../../../constants.mjs";
import { ActorEquipmentUtils } from "../../../core/actor/actor-equipment.mjs";
import { createLi } from "../../../creators/element/element-creator-jscript.mjs";
import { BaseActorCharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType } from "../../../enums/equipment-enums.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { OnEventType, OnMethod, verifyAndParseOnEventType } from "../../../enums/on-event-type.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { HtmlJsUtils } from "../../../utils/html-js-utils.mjs";

import { FoundryApi } from "../../../utils/foundry-api.mjs";

export class Setor0BaseActorSheet extends FoundryApi.ActorSheet {
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: [SYSTEM_CLASS_CSS, 'actor'],
        window: {
            subtitle: ""
        }
    };

    static PARTS = {}

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

    async _renderHTML(context, options) {
        const updatedContext = {
            ...context,
            ...this.getData(),
            actor: context.document
        };
        return await super._renderHTML(updatedContext, options);
    }

    _postRender(context, options) {
        super._postRender(context, options);
        this.configureSheet($(this.element));
    }

    get isEditable() {
        return FlagsUtils.getActorFlag(this.actor, "editable") && this.canRollOrEdit;
    }

    get canRollOrEdit() {
        return game.user.isGM || this.actor.isOwner;
    }

    getData() {
        const data = super.getData();
        data.editable = this.isEditable;
        data.canRoll = this.canRollOrEdit;
        data.canEdit = this.canRollOrEdit;
        return data;
    }

    async _onDropActor(event, data) {
        console.log('-> On Drop Actor');
    }

    async _onDropItem(event, data) {
        console.log('-> On Drop Item');
    }

    activateListeners(html) {
        super.activateListeners(html);
        HtmlJsUtils.setupContent(html);
        HtmlJsUtils.setupHeader(html);
        this.configureSheet(html);
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

    addPageButtonsOnFloatingMenu(html) {
        const buttonContainer = html.find("#floating-menu")[0];
        const pages = [];
        const buttons = [];

        const isCompacted = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT);

        html.find(".S0-page").each((index, page) => {
            pages.push(page);

            const pageLabel = page?.getAttribute('data-label') || `<${localize('Erro')}>`;
            const textContent = isCompacted ? undefined : pageLabel;

            const iconClass = page?.getAttribute('data-icon');
            const iconOption = iconClass ? { icon: { class: iconClass, marginRight: isCompacted ? '0px' : '4px', } } : {};

            const options = {
                title: pageLabel,
                classList: `S0-simulate-button ${isCompacted ? 'S0-compact' : ''}`,
                ...iconOption
            };

            const button = createLi(textContent, options);

            buttonContainer.appendChild(button);

            buttons.push(button);
            button.addEventListener('click', this.#changePage.bind(this, index + 1, pages, buttons));

            if (index + 1 != this.currentPage) {
                page.classList.add('hidden');
            } else {
                button.classList.add('S0-selected');
            }
        });
    }

    async #changePage(pageIndex, pages, buttons, event) {
        if (pageIndex == this.currentPage) {
            return;
        }

        const normalizedCurrentIndex = Math.max(this.currentPage - 1, 0);
        const normalizedIndex = Math.max(pageIndex - 1, 0);
        pages[normalizedCurrentIndex].classList.toggle('hidden');
        pages[normalizedIndex].classList.toggle('hidden');

        buttons[normalizedCurrentIndex].classList.toggle('S0-selected');
        buttons[normalizedIndex].classList.toggle('S0-selected');
        this.currentPage = pageIndex;
    }
}
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
        },
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
        this._postRenderConfiguration($(this.element));
    }

    _postRenderConfiguration(html) {
        this.configureSheet(html);
        this._setupAutoTabs(html);
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
        this._postRenderConfiguration(html);
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
        const classTabs = "S0-sheet-tabs";
        const navSelector = `nav.${classTabs}[data-group="${group}"]`;
        const contentSelector = `.S0-nav-content`;

        const nav = html.find(navSelector);
        if (!nav.length) {
            console.warn(`Tabs: nav[data-group="${group}"] não encontrado.`);
            return;
        }

        const isCompacted = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT);
        const classes = `S0-simulate-button ${isCompacted ? 'S0-compact' : ''}`

        const tabs = html.find(`.tab[data-group="${group}"][data-tab]`);
        tabs.each((_, element) => {
            const tab = $(element);
            const tabName = tab.data("tab");
            const label = tab.data("label");
            const icon = tab.data("icon") || "fa-circle";

            if (!tabName || !label) {
                const identifier = element.outerHTML.split("\n")[0]?.trim();
                console.warn(`Tab ignorada: falta 'data-tab' ou 'data-label' em ${identifier}`);
                return;
            }

            const button = $(`<a class="${classes}" data-tab="${tabName}" title="${label}"><i class="fas ${icon}"></i>${isCompacted ? '' : label}</a>`);
            nav.append(button);
        });

        const initial = tabs[Math.max(this.currentPage - 1, 0)]?.dataset?.tab ?? ""

        const tabsInstance = new FoundryApi.Tabs({
            navSelector: navSelector,
            contentSelector: contentSelector,
            initial: initial,
        });
        tabsInstance.bind(html[0]);

        html.find(`${navSelector} a[data-tab]`).on("click", event => {
            const selectedTab = $(event.currentTarget).data("tab");

            const index = Object.values(tabs).findIndex(el => el.dataset.tab === selectedTab);
            if (index !== -1) {
                this.currentPage = index + 1;
            }
        });
    }

    #addPageButtonsOnFloatingMenu(html) {
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
                page.classList.add('active');
                button.classList.add('S0-selected');
            }
        });
    }

    #changePage(pageIndex, pages, buttons, event) {
        if (pageIndex == this.currentPage) {
            return;
        }

        const normalizedCurrentIndex = Math.max(this.currentPage - 1, 0);
        const normalizedIndex = Math.max(pageIndex - 1, 0);
        pages[normalizedCurrentIndex].classList.toggle('hidden');
        pages[normalizedCurrentIndex].classList.toggle('active');
        pages[normalizedIndex].classList.toggle('hidden');
        pages[normalizedIndex].classList.toggle('active');

        buttons[normalizedCurrentIndex].classList.toggle('S0-selected');
        buttons[normalizedIndex].classList.toggle('S0-selected');
        this.currentPage = pageIndex;
    }
}
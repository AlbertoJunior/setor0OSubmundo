import { normalizeString } from "../utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../constants.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "./flags-utils.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";

export class HtmlJsUtils {
    static setupContent(html) {
        const content = html.closest(`.${SYSTEM_CLASS_CSS}`)[0];
        if (content) {
            const inDarkMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK, false);
            content.classList.toggle('S0-page-transparent', inDarkMode);
        }
    }

    static setupHeader(html) {
        const inDarkMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK, false);
        const isCompactMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT, false);

        // V1: html is form inside .window-content; V2: html is the app element itself
        const appElement = html.closest(`.${SYSTEM_CLASS_CSS}`)[0];
        if (!appElement) return;

        const header = appElement.querySelector('.window-header');
        if (!header) return;

        if (inDarkMode) {
            header.style.color = 'var(--primary-color)';
        } else {
            header.style.color = '';
        }

        const headerChildren = header.querySelectorAll('a') || [];
        if (isCompactMode) {
            for (const child of headerChildren) {
                const saveChild = child.firstElementChild;
                const saveText = normalizeString(child.textContent) || child.ariaLabel || "";
                child.classList.add('S0-icon-expand')
                child.textContent = '';
                child.appendChild(saveChild);
                if (!child.dataset.tooltip) {
                    child.dataset.tooltip = saveText;
                    child.dataset.tooltipDirection = 'UP';
                }
            }
        } else {
            for (const child of headerChildren) {
                child.classList.remove('S0-icon-expand')
                if (!child.textContent.trim()) {
                    child.appendChild(document.createTextNode(child.title));
                }
            }
        }
    }

    static flipClasses(element, classA, classB) {
        const classes = element.classList;
        if (classes.contains(classA)) {
            classes.replace(classA, classB);
        } else {
            classes.replace(classB, classA);
        }
    }

    static getActualHeight(element) {
        const windowElem = element.closest(`.${SYSTEM_CLASS_CSS}`);
        if (!windowElem) {
            return undefined;
        }

        return windowElem.offsetHeight;
    }

    static expandOrContractElement(element, params) {
        const windowElem = element.closest(`.${SYSTEM_CLASS_CSS}`);
        if (!windowElem) {
            return;
        }

        return this.#operate(element, windowElem, params);
    }

    static expandOrContractMessageElement(element, params) {
        const windowElem = element.closest(".message-content");
        if (!windowElem) {
            return;
        }

        return this.#operate(element, windowElem, params);
    }

    static #operate(element, windowElem, params = { minHeight: 0, marginBottom: 0 }) {
        const expanded = element.classList.toggle("S0-expanded");

        const { minHeight, maxHeight, marginBottom = 0 } = params;

        const currentHeight = windowElem.offsetHeight;
        const scrollSize = element.scrollHeight;
        const scrollWithMargin = scrollSize - marginBottom;
        const newHeight = expanded
            ? Math.min(currentHeight + scrollWithMargin, maxHeight)
            : Math.max(currentHeight - scrollWithMargin, minHeight);

        windowElem.classList.add("S0-expand-animating");
        windowElem.style.height = `${newHeight}px`;

        setTimeout(() => {
            windowElem.classList.remove("S0-expand-animating");
        }, 300);

        return {
            isExpanded: expanded,
            newHeight: newHeight
        };
    }

    static presetAllDragEvents(containerTarget, actor, onDrop = (actor, event) => { }) {
        if (!containerTarget) {
            return;
        }

        containerTarget.on('dragover', (event) => {
            containerTarget.addClass('S0-drop-target-hover');
        });

        containerTarget.on('dragenter', () => {
            containerTarget.addClass('S0-drop-target-hover');
        });

        containerTarget.on('dragleave', () => {
            containerTarget.removeClass('S0-drop-target-hover');
        });

        containerTarget.on('drop', (event) => {
            containerTarget.removeClass('S0-drop-target-hover');
            onDrop(actor, event);
        });
    }

    static setupTabs(html, group = "menu-tabs", contentSelector = ".S0-nav-content", currentTabIndex = 0, onTabClicked = (tab, index) => { }) {
        if (!html) {
            console.warn("the HTML is null");
            return;
        }

        const classTabs = "S0-sheet-tabs";
        const navSelector = `nav.${classTabs}[data-group="${group}"]`;
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

            const iconText = `<i class="fas ${icon}"></i>`;
            const dataTooltipConfigs = `data-tooltip="${label}" data-tooltip-direction="UP"`;
            const button = $(`<a class="${classes}" data-tab="${tabName}" ${dataTooltipConfigs}>${iconText}${isCompacted ? '' : label}</a>`);
            nav.append(button);
        });

        const initial = tabs[currentTabIndex]?.dataset?.tab ?? ""

        const tabsInstance = new FoundryApi.Tabs({
            navSelector: navSelector,
            contentSelector: contentSelector,
            initial: initial,
        });
        tabsInstance.bind(html[0]);

        html.find(`${navSelector} a[data-tab]`).on("click", event => {
            if (typeof onTabClicked === 'function') {
                const selectedTab = $(event.currentTarget).data("tab");
                const index = Object.values(tabs).findIndex(el => el.dataset.tab === selectedTab);
                onTabClicked(selectedTab, index);
            } else {
                console.warn("onTabClicked is not a function");
            }
        });
    }
}
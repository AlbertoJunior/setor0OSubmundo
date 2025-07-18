import { normalizeString } from "../../scripts/utils/utils.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "./flags-utils.mjs";

export class HtmlJsUtils {
    static setupContent(html) {
        const inDarkMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK, false);

        const parent = html.parent()[0];
        parent.classList.toggle('S0-page-transparent', inDarkMode);
        parent.style.margin = '0px';
        parent.style.padding = '0px 2px 0px 12px';
        parent.style.overflowY = 'scroll';
    }

    static setupHeader(html) {
        const inDarkMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK, false);
        const isCompactMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT, false);

        const parent = html.parent()[0];
        const header = parent.parentElement;

        if (inDarkMode) {
            header.style.color = 'var(--primary-color)';
        } else {
            header.style.color = '';
        }

        const headerChildren = header.children?.[0]?.querySelectorAll('a') || [];
        if (isCompactMode) {
            for (const child of headerChildren) {
                const saveChild = child.firstElementChild;
                const saveText = normalizeString(child.textContent);
                child.classList.add('S0-icon-expand')
                child.textContent = '';
                child.appendChild(saveChild);
                child.title = saveText;
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
        const windowElem = element.closest(".S0-content");
        if (!windowElem)
            return undefined;

        return windowElem.offsetHeight;
    }

    static expandOrContractElement(element, params) {
        const windowElem = element.closest(".S0-content");
        if (!windowElem)
            return;

        return this.#operate(element, windowElem, params);
    }

    static expandOrContractMessageElement(element, params) {
        const windowElem = element.closest(".message-content");
        if (!windowElem)
            return;

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
}
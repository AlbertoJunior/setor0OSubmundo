import { onArrayRemove, snakeToCamel } from "../../scripts/utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../constants.mjs";
import { createA } from "../creators/element/element-creator-jscript.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { HtmlJsUtils } from "./html-js-utils.mjs";

export class DialogUtils {
    static presetDialogV1Render(html, params = {}) {
        const div = html[0]?.parentElement;
        if (!div) {
            return null;
        }

        div.classList.add(SYSTEM_CLASS_CSS);
        div.parentElement.style.height = 'auto';

        const paramsContentStyles = params.contentStyles;
        if (paramsContentStyles && typeof paramsContentStyles === 'object') {
            Object.entries(paramsContentStyles).forEach(([key, value]) => {
                div.style[key] = value;
            });
        }

        const firtsChild = div.children[0];
        if (firtsChild) {
            firtsChild.classList.add('S0-page-transparent');
        }

        this.#setupHeaderParams(div, params.header);
        this.#verifyRemoveDialogButtonsContainer(div);

        HtmlJsUtils.setupHeader(html);

        return div.closest(`.${SYSTEM_CLASS_CSS}`);
    }

    static #setupHeaderParams(div, paramsHeader) {
        const headerElement = div.parentElement.children[0];
        headerElement.style.color = 'var(--primary-color)';

        if (paramsHeader) {
            const defaultChildren = [...headerElement.children];
            if (defaultChildren.length > 0) {
                headerElement.innerHTML = '';
                headerElement.appendChild(defaultChildren[0]);
                onArrayRemove(defaultChildren, defaultChildren[0]);
            }

            const buttons = paramsHeader.buttons || [];
            buttons.forEach(button => {
                const elementA = createA(button.label, {
                    icon: { class: button.icon }
                });

                elementA.onclick = event => button.onClick();
                headerElement.appendChild(elementA)
            });

            if (defaultChildren.length > 0) {
                defaultChildren.forEach(child => {
                    headerElement.appendChild(child);
                });
            }
        }
    }

    static #verifyRemoveDialogButtonsContainer(div) {
        const buttons = div.querySelectorAll('.dialog-button').length || 0;
        if (buttons == 0) {
            div.querySelector('.dialog-buttons')?.remove();
        }
    }

    static showArtWork(title, imgPath, shareable, uuid) {
        new FoundryApi.ImagePopout({
            src: imgPath,
            window: {
                title: title || "Título da Imagem"
            },
            classes: [SYSTEM_CLASS_CSS, 'S0-no-padding'],
            shareable: shareable || false,
            uuid: uuid,
        }).render(true);
    }

    static getDialogFormData(html) {
        try {
            const forms = html[0].querySelectorAll('form');
            const form = forms[forms.length - 1];
            const formData = new FormData(form);
            const data = snakeToCamel(formData.entries());
            return data;
        } catch (error) {
            console.error(error);
            return {};
        }
    }
}
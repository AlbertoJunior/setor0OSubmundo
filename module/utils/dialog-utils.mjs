import { onArrayRemove } from "../../scripts/utils/utils.mjs";
import { createA } from "../creators/element/element-creator-jscript.mjs";
import { HtmlJsUtils } from "./html-js-utils.mjs";

export class DialogUtils {
    static presetDialogRender(html, params = {}) {
        const div = html[0]?.parentElement;
        if (!div) {
            return null;
        }

        div.classList.add('S0-content');
        div.parentElement.style.height = 'auto';

        const paramsContent = params.content;
        if (paramsContent && typeof paramsContent === 'object') {
            Object.entries(params.content).forEach(([key, value]) => {
                div.style[key] = value;
            });
        }

        const firtsChild = div.children[0];
        if (firtsChild) {
            firtsChild.classList.add('S0-page-transparent');
        }

        this.#setupHeaderParams(div, params);
        this.#setupDialogButtons(div);

        HtmlJsUtils.setupHeader(html);

        return div.closest('.window-app');
    }

    static #setupHeaderParams(div, params) {
        const header = div.parentElement.children[0];
        header.style.color = 'var(--primary-color)';

        if (params.header) {
            const defaultChildren = [...header.children];
            if (defaultChildren.length > 0) {
                header.innerHTML = '';
                header.appendChild(defaultChildren[0]);
                onArrayRemove(defaultChildren, defaultChildren[0]);
            }

            const buttons = params.header.buttons || [];
            buttons.forEach(button => {
                const elementA = createA(button.label, {
                    icon: button.icon
                });

                elementA.onclick = event => button.onClick();
                header.appendChild(elementA)
            });

            if (defaultChildren.length > 0) {
                defaultChildren.forEach(child => {
                    header.appendChild(child);
                });
            }
        }
    }

    static #setupDialogButtons(div) {
        const buttons = div.querySelectorAll('.dialog-button').length || 0;
        if (buttons == 0) {
            div.querySelector('.dialog-buttons').remove();
        }
    }

    static showArtWork(title, imgPath, shareable, uuid) {
        new ImagePopout(imgPath, {
            title: title || "Título da Imagem",
            shareable: shareable || false,
            uuid: uuid,
        }).render(true);
    }
}
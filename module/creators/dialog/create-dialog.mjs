import { localize, randomId, snakeToCamel } from "../../../scripts/utils/utils.mjs"
import { TEMPLATES_PATH } from "../../constants.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

export class CreateFormDialog {
    static optionsTemplate = {
        onConfirm: async (data) => { },
        onCancel: async (html) => { },
        render: (html, windowApp) => { },
        onClose: () => { },
        presetForm: {},
    }

    static async open(title, fileHtml, options) {
        const buttons = this.#createButtons(
            {
                confirm: options.onConfirm,
                cancel: options.onCancel
            }
        );

        const content = await this.#mountContent(fileHtml.replace(/\.[^/.]+$/, ''), options.presetForm, buttons);

        if (!this.#verifyContentIsForm(content)) {
            console.error('Content isn\'t a form')
            return;
        }

        const dialog = new Dialog({
            title,
            content,
            buttons: {},
            render: (html) => {
                const windowApp = this.#render(html, dialog, { buttons });
                options.render?.(html, windowApp);
            },
            close: () => { options.onClose?.() }
        });
        dialog.render(true);
    }

    static #createButtons(eventButtons) {
        const onConfirm = eventButtons.confirm;
        const onCancel = eventButtons.cancel;

        const buttons = {};

        buttons['cancel'] = {
            label: localize("Cancelar"),
            classes: 'S0-button-confirm',
            callback: (html) => {
                onCancel?.(html)
            }
        };

        buttons['confirm'] = {
            label: localize("Confirmar"),
            classes: 'S0-button-confirm default',
            callback: (html) => {
                const form = html[0].querySelector("form");
                const formData = new FormData(form);
                const data = snakeToCamel(formData.entries());
                onConfirm?.(data);
            }
        };

        Object.keys(buttons).forEach(key => {
            buttons[key].key = key;
        });

        return buttons;
    }

    static async #mountContent(fileHtml, presetForm = {}, buttons = null) {
        const dataForm = {
            uuid: `form_dialog.${randomId(10)}`,
            ...Object.fromEntries(
                Object.entries(presetForm).filter(([key]) => key !== 'uuid')
            )
        };

        const dataButtons = {
            buttons: (buttons && typeof buttons === 'object') ? Object.values(buttons) : null,
        };

        const [formHtml, buttonsHtml] = await Promise.all([
            FoundryApi.renderTemplate(`${TEMPLATES_PATH}/${fileHtml}.hbs`, dataForm),
            FoundryApi.renderTemplate(`${TEMPLATES_PATH}/others/buttons-dialog.hbs`, dataButtons),
        ]);

        return `
        <div class="S0-dialog">
            ${formHtml}
            ${buttonsHtml}
        </div>`;
    }

    static #verifyContentIsForm(content) {
        return content.includes("<form");
    }

    static #render(html, dialog, params) {
        const { buttons, header } = params
        const windowApp = DialogUtils.presetDialogRender(html, header);
        this.#setupButtonsRender(html, dialog, buttons);
        return windowApp;
    }

    static #setupButtonsRender(html, dialog, buttons = {}) {
        const entries = Object.entries(buttons);
        for (const [key, { callback, closeDialog }] of entries) {
            const buttonElement = html.find(`[data-action="${key}"]`);
            if (!buttonElement.length) {
                continue;
            }

            buttonElement.on("click", () => {
                if (typeof callback === "function") {
                    callback(html);
                    if (closeDialog === false) {
                        return;
                    }
                }
                dialog.close();
            });
        }
    }
}

import { localize } from "../../../scripts/utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

export class ConfirmationDialog {
    static async open(params = { onConfirm: () => { }, onCancel: () => { } }) {
        const { titleDialog, cancelButtonText, confirmButtonText, message, titleMessage, onConfirm, onCancel } = params;

        const content = await this.#mountContent(message, titleMessage);

        new Dialog({
            title: titleDialog || localize("Confirmar"),
            content: content,
            buttons: {
                cancel: {
                    label: cancelButtonText || localize("Cancelar"),
                    callback: (html) => {
                        if (typeof onCancel === 'function') {
                            onCancel();
                        }
                    }
                },
                confirm: {
                    label: confirmButtonText || localize("Confirmar"),
                    callback: (html) => {
                        if (typeof onConfirm === 'function') {
                            onConfirm();
                        }
                    }
                }
            },
            render: (html) => {
                DialogUtils.presetDialogRender(html);
            },
            default: 'confirm',
            close: () => { }
        }).render(true);
    }

    static async #mountContent(message, title) {
        const data = {
            title: title || localize("Pergunta.Realizar_Acao"),
            message
        }
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/others/confirmation-dialog.hbs`, data);
    }
}
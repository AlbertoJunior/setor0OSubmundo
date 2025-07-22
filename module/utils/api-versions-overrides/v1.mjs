import { SYSTEM_CLASS_CSS, SYSTEM_CLASS_DIALOG_CSS } from "../../constants.mjs";
import { DialogUtils } from "../dialog-utils.mjs";

const VERSION_NAME = 'S0-V1';

class S0DialogV1 extends Dialog {
    static get defaultOptions() {
        const options = super.defaultOptions;
        return {
            ...options,
            classes: [
                ...(options.classes ?? []),
                SYSTEM_CLASS_CSS,
                SYSTEM_CLASS_DIALOG_CSS,
                VERSION_NAME,
            ]
        };
    }
}

export const v1Overrides = Object.freeze({
    VersionName: VERSION_NAME,
    Sheets: foundry.appv1.sheets,
    makeClass,
    createDialog,
});

function makeClass(BaseClass) {
    const name = BaseClass.name;
    return {
        [name]: class extends BaseClass {

        }
    }[name];
}

async function createDialog(data, options) {
    const {
        title,
        header,
        content,
        buttons = [],
        minimizable = true,
        render = (html, renderedDialog, window) => { },
        onClose = () => { }
    } = data;

    const parsedButtons = parseButtons(buttons);

    const dialog = await new S0DialogV1(
        {
            title,
            content,
            buttons: parsedButtons.buttons,
            default: parsedButtons.default,
            render: (html) => {
                const window = DialogUtils.presetDialogRender(html, header);
                render(html, dialog, window);
            },
            close: onClose
        },
        options
    ).render(true);
    return dialog;
}

/**
 * Converte uma lista de botões em um objeto formatado para uso em componentes de diálogo.
 *
 * Cada botão é indexado por seu `label` (em minúsculas), e recebe uma `callback` que encapsula o método `onClick`.
 * Também identifica qual botão é o padrão (`default: true`) e retorna seu identificador.
 *
 * @param {Array<{ label : string, onClick : function?, default : boolean? }>} buttons - Lista de botões, onde cada botão deve conter:
 * @param {string} buttons[].label - Texto que identifica o botão.
 * @param {Function} [buttons[].onClick] - Função callback executada ao clicar no botão (opcional).
 * @param {boolean} [buttons[].default] - Indica se o botão é o padrão do diálogo.
 *
 * @returns {{ buttons: Object<string, { label: string, callback: function }>, default: string|null }}
 * Um objeto contendo:
 * - `buttons`: Mapeamento de `label.toLowerCase()` → objeto com `label` e `callback`.
 * - `default`: O identificador (`label.toLowerCase()`) do botão marcado como padrão, ou `null` se nenhum for padrão.
 *
 * @example
 * const { buttons, default: defaultButton } = parseButtons([
 *   { label: 'Yes', onClick: () => console.log('Yes clicked'), default: true },
 *   { label: 'No', onClick: () => console.log('No clicked') }
 * ]);
 *
 * // buttons = {
 * //   yes: { label: 'Yes', callback: [Function] },
 * //   no: { label: 'No', callback: [Function] }
 * // }
 * // defaultButton = 'yes'
 */
function parseButtons(buttons) {
    const parsedButtons = {};
    let defaultButton = null;

    for (const bt of buttons) {
        const lowerLabel = bt.label.toLowerCase();
        parsedButtons[lowerLabel] = {
            label: bt.label,
            callback: (html) => {
                bt.onClick?.(html);
            }
        }
        if (bt.default == true) {
            defaultButton = lowerLabel;
        }
    }
    return { buttons: parsedButtons, default: defaultButton };
}
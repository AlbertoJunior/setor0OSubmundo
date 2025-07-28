import { randomId } from "../../utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../../constants.mjs";

const VERSION_NAME = 'S0-V2';

export const v2Overrides = Object.freeze(
    {
        VersionName: VERSION_NAME,
        Sheets: foundry.applications.sheets,
        makeClass,
        createDialog,
    }
);

function makeClass(BaseClass) {
    const { HandlebarsApplicationMixin } = foundry.applications.api;
    const name = BaseClass.name;

    return {
        [name]: class extends HandlebarsApplicationMixin(BaseClass) {
            getData() {
                return {};
            }
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
        resizable = false,
        render = (html, renderedDialog, window) => { },
        onClose = () => { }
    } = data;

    const parsedButtons = parseDialogButtons(buttons);
    const dialogButons = parsedButtons.buttons;
    const closeOnSubmit = parsedButtons.closeOnSubmit;
    const parsedHeaderToControls = parseHeaderToControls(header);

    let handleOnClose = true;

    // this form will be automatically removed before full rendering
    const modifiedContent = `<form></form>${content}`;

    const dialog = new this.Api.DialogV2(
        {
            window: {
                title: title,
                minimizable: minimizable,
                resizable: resizable,
                controls: [...parsedHeaderToControls],
            },
            position: {
                width: options?.width ?? 'auto',
                height: options?.height ?? 'auto',
            },
            classes: [SYSTEM_CLASS_CSS, VERSION_NAME, 'S0-dialog'],
            content: modifiedContent,
            buttons: dialogButons,
            submit: (result, dialog) => {
                const buttonAction = dialogButons.find(button => button.action == result);
                const method = buttonAction?.onClick;
                if (typeof method === 'function') {
                    handleOnClose = false;
                    method($(dialog.element), dialog);
                } else {
                    console.log(`User picked option: ${buttonAction.label}`);
                }

                if (!closeOnSubmit && (buttonAction.closeDialog === true || buttonAction.closeDialog == undefined)) {
                    dialog.close({ submitted: true })
                }
            },
            form: {
                closeOnSubmit: closeOnSubmit
            }
        },
        options
    );

    dialog.addEventListener('render', event => {
        const dialog = event.target;

        const $html = $(dialog.element);

        const buttonToRemove = parsedButtons.fakeButton;
        if (buttonToRemove) {
            $html.find(`[data-action="${buttonToRemove}"]`)?.remove();
        }

        const window = dialog.element.closest(`.${SYSTEM_CLASS_CSS}`);

        render($html, dialog, window);
    });

    dialog.addEventListener('close', () => {
        if (handleOnClose && typeof onClose === 'function') {
            setTimeout(onClose(), 100);
        }
    });
    return await dialog.render(true);
}

/**
 * Converte uma lista de botões em um formato padronizado para uso em componentes de diálogo.
 *
 * Cada botão recebe um `action` único (ID aleatório) e classes CSS normalizadas, garantindo
 * que o botão padrão (`default: true`) receba uma classe adicional de destaque.
 * 
 * Caso a lista de botões esteja vazia, um botão fictício é adicionado para evitar erros na renderização.
 *
 * @param {Array<{
 *   label: string,
 *   class?: string | string[],
 *   default?: boolean,
 *   [key: string]: any
 * }>} buttons - Lista de botões fornecidos. Cada botão pode conter propriedades extras além das esperadas.
 *
 * @returns {{
 *   buttons: Array<{
 *     label: string,
 *     action: string,
 *     class?: string,
 *     [key: string]: any
 *   }>,
 *   fakeButton: string | undefined
 * }} Um objeto com os botões processados:
 * - `buttons`: Lista de botões com `action` únicos e classes normalizadas.
 * - `fakeButton`: ID do botão fictício adicionado quando a lista estava vazia, ou `undefined` se não foi necessário.
 *
 * @example
 * const result = parseDialogButtons([
 *   { label: 'OK', class: 'primary', default: true },
 *   { label: 'Cancel', class: ['secondary'] }
 * ]);
 *
 * // result = {
 * //   buttons: [
 * //     { label: 'OK', action: 'a1b2c3d4e5', class: 'primary S0-button-dialog S0-button-focus' },
 * //     { label: 'Cancel', action: 'f6g7h8i9j0', class: 'secondary S0-button-dialog' }
 * //   ],
 * //   fakeButton: undefined
 * // }
 */
function parseDialogButtons(buttons) {
    const parsedButtons = buttons.map(button => {
        const actionId = randomId(10);
        const classList = new Set([
            ...(Array.isArray(button.class) ? button.class : []),
            'S0-button-dialog',
            ...(button.default === true ? ['S0-button-focus'] : [])
        ]);

        return {
            ...button,
            action: actionId,
            class: [...classList].join(' ')
        };
    });

    let buttonToRemove;
    if (parsedButtons.length == 0) {
        buttonToRemove = randomId(10);
        parsedButtons.push({
            label: buttonToRemove,
            action: buttonToRemove,
        });
    }

    return {
        buttons: parsedButtons,
        fakeButton: buttonToRemove,
        closeOnSubmit: !parsedButtons.find(button => button.closeDialog == false)
    }
}

function parseHeaderToControls(header) {
    const controls = [];

    header?.buttons
        ?.filter(button => typeof button.onClick === 'function')
        .forEach(buttonHeader => {
            controls.push(
                {
                    action: buttonHeader.label ?? "clicou",
                    icon: buttonHeader.icon ?? 'fas fa-add',
                    label: buttonHeader.label ?? "label",
                    onClick: (event, params) => {
                        buttonHeader.onClick();
                    },
                    ownership: buttonHeader.ownership ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
                    visible: true,
                }
            );
        });

    return controls;
}
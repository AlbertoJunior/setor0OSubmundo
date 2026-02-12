import { randomId, toKeyLang } from "../../utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../../constants.mjs";
import { FoundryApi } from "../foundry-api.mjs";
import { HtmlJsUtils } from "../../utils/html-js-utils.mjs";
import { Setor0BaseSheet } from "../../base/sheet/Setor0BaseSheet.mjs";

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
    const { HandlebarsApplicationMixin } = this.Api;
    const name = BaseClass.name;

    const Cls = {
        [name]: class extends HandlebarsApplicationMixin(BaseClass) {
            static DEFAULT_OPTIONS = {
                // viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED,
                // editPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                sheetConfig: false,
                classes: [SYSTEM_CLASS_CSS, VERSION_NAME],
                window: {
                    resizable: false,
                    controls: []
                },
                form: {
                    closeOnSubmit: false,
                    submitOnChange: true,
                    handler: this.#onSubmitDocumentForm
                },
                actions: {
                    img: this.#selectImg
                }
            }

            static async #onSubmitDocumentForm(event, form, formData, options = {}) {
                if (!this.isEditable) {
                    return;
                }

                const value = Cls.#operateValue(event.target);
                await this.updateDocument(this.document, event.target.name, value);
            }

            static #operateValue(target) {
                const targetType = target.type;
                const canBeBoolean = targetType == 'checkbox' || targetType == 'radiobutton';
                if (canBeBoolean) {
                    return target.checked;
                }

                return target.value;
            }

            static async #selectImg() {
                const document = this.document;
                const img = document.img;
                new FoundryApi.FilePicker.implementation({
                    type: 'image',
                    current: img,
                    displayMode: "thumbs",
                    // allowUpload: game.user.isGM,
                    callback: async (path, event) => {
                        await this.updateDocument(document, 'img', path);
                    }
                }).browse();
            }

            async updateDocument(document, keyToUpdate, value) {
                console.warn(`[${document.documentName}]: you need to implement this method (async updateDocument). There was an attempt to update field [${keyToUpdate}] with value [${value}]`);
            }

            _renderHTML(context, options) {
                const documentName = context.document.documentName.toLowerCase();
                const updatedContext = {
                    ...context,
                    ...this.getData(),
                    owner: this.document.isOwner,
                    [documentName]: context.document
                };

                if (options.parts.length > 1) {
                    options.parts = this._operateMultiParts(context.document, options.parts);
                }

                return super._renderHTML(updatedContext, options);
            }

            _operateMultiParts(document, parts) {
                return parts;
            }

            _replaceHTML(result, content, options) {
                this.#disableFormItemsOnHtml(result);
                return super._replaceHTML(result, content, options)
            }

            _postRender(context, options) {
                super._postRender(context, options);
                const html = $(this.element);
                HtmlJsUtils.setupContent(html);
                this.configureSheet(html);
                this.postRenderConfiguration(html);
            }

            #disableFormItemsOnHtml(result) {
                const isDisabled = this.isDisabled;
                if (isDisabled) {
                    Object.values(result)
                        .filter(el => el instanceof HTMLElement)
                        .forEach(el => {
                            el.querySelectorAll('input, select, textarea, button').forEach(input => {
                                input.disabled = true;
                            });
                        });
                }
            }

            getData() {
                return {};
            }
        }
    }[name];
    return Setor0BaseSheet(Cls);
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
                    console.log(`-> User picked option: ${buttonAction.label}`);
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
            setTimeout(() => onClose(), 100);
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
    } else if (parsedButtons.length == 1) {
        parsedButtons[0].class = `${parsedButtons[0].class} S0-single-button-dialog`;
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
        ?.filter(button => typeof button.onClick === 'function' && button.label)
        .forEach(buttonHeader => {
            const label = buttonHeader.label;
            const actionName = toKeyLang(label);
            controls.push(
                {
                    action: actionName,
                    icon: buttonHeader.icon ?? 'fas fa-add',
                    label: label,
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
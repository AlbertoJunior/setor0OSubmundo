import { localize, randomId, snakeToCamel } from "../../../scripts/utils/utils.mjs"
import { SYSTEM_CLASS_DIALOG_CSS, TEMPLATES_PATH } from "../../constants.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

/**
 * @typedef {Object} CreateFormDialogOptions
 * @property {Object} [presetForm] - Objeto com dados pré-preenchidos no formulário.
 * @property {Function} [onConfirm] - Callback chamada ao confirmar o formulário.
 * Recebe os dados processados como argumento.
 * @property {Function} [onCancel] - Callback chamada ao cancelar. Recebe o HTML do diálogo.
 * @property {Function} [render] - Função chamada após o conteúdo ser renderizado.
 * Recebe o HTML do formulário, o diálogo renderizado e a instância `windowApp`.
 * @property {Function} [onClose] - Função chamada ao fechar o diálogo (mesmo sem confirmação).
 * @property {Object|null} [windowOptions] - Opções da janela.
 * @property {FoundryApi.Versions|null} [forcedApiVersion] - Força o uso de uma versão específica da API.
 */

/**
 * Classe utilitária para criação de diálogos modais com formulários carregados dinamicamente.
 *
 * Fornece um método estático para abrir uma janela de diálogo com conteúdo HTML e callbacks de controle.
 */
export class CreateFormDialog {
    /**
     * Abre um diálogo contendo um formulário HTML, renderizado dinamicamente a partir de um arquivo externo.
     *
     * @param {string} title - Título do diálogo.
     * @param {string} fileHtml - Caminho para o arquivo HTML do formulário (sem extensão).
     * @param {CreateFormDialogOptions} options - Objeto de opções para configurar o comportamento do diálogo.
     *
     * @returns {Promise<void>} Uma Promise que resolve quando o diálogo for processado e exibido.
     *
     * @example
     * await CreateFormDialog.open('Nova Ficha', 'items/dialog/superequipment-effect-dialog', {
     *   presetForm: { name: 'Sem nome' },
     *   onConfirm: async (data) => { console.log('Form enviado', data); },
     *   onCancel: async (html) => { console.log('Cancelado'); },
     *   render: (html, dialog, app) => { console.log('Render extra'); },
     *   onClose: () => { console.log('Janela fechada'); },
     *   windowOptions: { width: 600, height: 'auto' },
     *   forcedApiVersion: FoundryApi.Versions.v1
     * });
     */
    static async open(title, fileHtml, options) {
        const buttons = this.#createButtons(
            {
                confirm: options.onConfirm,
                cancel: options.onCancel
            }
        );

        const content = await this.#mountContent(fileHtml.replace(/\.[^/.]+$/, ''), options.presetForm);

        if (!this.#verifyContentIsForm(content)) {
            console.error('Content isn\'t a form')
            return;
        }

        FoundryApi.createDialog(
            {
                title,
                header: options.header,
                content,
                buttons,
                render: (html, renderedDialog, window) => {
                    if (typeof options.render === 'function') {
                        options.render?.(html, renderedDialog, window);
                    }
                },
                close: () => {
                    if (typeof options.onClose === 'function') {
                        options.onClose?.();
                    }
                }
            },
            options.windowOptions,
            options.forcedApiVersion
        );
    }

    static #createButtons(eventButtons) {
        const onConfirm = eventButtons.confirm;
        const onCancel = eventButtons.cancel;
        return [
            {
                label: localize("Cancelar"),
                onClick: (html) => {
                    if (typeof onCancel === 'function') {
                        onCancel?.(html);
                    }
                }
            },
            {
                label: localize("Confirmar"),
                default: true,
                onClick: (html) => {
                    if (typeof onConfirm === 'function') {
                        const data = DialogUtils.getDialogFormData(html);
                        onConfirm?.(data);
                    }
                }
            },
        ];
    }

    static async #mountContent(fileHtml, presetForm = {}) {
        const dataForm = {
            uuid: `form_dialog.${randomId(10)}`,
            ...Object.fromEntries(
                Object.entries(presetForm).filter(([key]) => key !== 'uuid')
            )
        };

        const formHtml = await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/${fileHtml}.hbs`, dataForm);
        return `
        <div class="${SYSTEM_CLASS_DIALOG_CSS}">
            ${formHtml}
        </div>`;
    }

    static #verifyContentIsForm(content) {
        return content.includes("<form");
    }
}
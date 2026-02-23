import { localize } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

/**
 * @typedef {Object} ConfirmationDialogParams
 * @property {string} [titleDialog] - Título da janela de confirmação.
 * @property {string} [message] - Mensagem principal a ser exibida no conteúdo do diálogo.
 * @property {string} [titleMessage] - Título da mensagem exibida acima do conteúdo.
 * @property {string} [cancelButtonText] - Texto do botão de cancelamento.
 * @property {string} [confirmButtonText] - Texto do botão de confirmação.
 * @property {Function} [onConfirm] - Callback executada ao confirmar.
 * @property {Function} [onCancel] - Callback executada ao cancelar.
 * @property {Function} [onClose] - Callback executada ao fechar o diálogo, independentemente da ação.
 */

/**
 * Classe utilitária para exibição de diálogos simples de confirmação.
 *
 * Exibe uma janela modal com título, mensagem e dois botões (Confirmar e Cancelar).
 * Ideal para confirmar ações críticas antes de prosseguir.
 */
export class ConfirmationDialog {

  /**
   * Exibe um diálogo de confirmação com título, mensagem e botões de ação.
   *
   * @param {ConfirmationDialogParams} [params={}] - Parâmetros para personalizar o diálogo.
   * @returns {Promise<void>} Uma Promise que resolve após a exibição do diálogo.
   *
   * @example
   * await ConfirmationDialog.open({
   *   titleDialog: "Excluir Item",
   *   message: "Tem certeza que deseja excluir este item?",
   *   onConfirm: () => console.log("Confirmado"),
   *   onCancel: () => console.log("Cancelado"),
   *   onClose: () => console.log("Janela fechada")
   * });
  */
  static async open(params = { onConfirm: () => { }, onCancel: () => { }, onClose: () => { } }, options) {
    const {
      titleDialog,
      cancelButtonText,
      confirmButtonText,
      message,
      titleMessage,
      onConfirm,
      onCancel,
      onClose,
      isDanger = false
    } = params;

    const content = await this.#mountContent(message, titleMessage);

    const buttons = [
      {
        label: cancelButtonText ?? localize("Cancelar"),
        onClick: (html) => {
          if (typeof onCancel === 'function') {
            onCancel();
          }
        }
      },
      {
        label: confirmButtonText ?? localize("Confirmar"),
        default: !isDanger,
        onClick: (html) => {
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        }
      }
    ];

    if (isDanger) {
      buttons[1].class = ['S0-button-delete'];
    }

    FoundryApi.createDialog(
      {
        classes: ['S0-max-width-50'],
        title: titleDialog ?? localize("Confirmar"),
        content: content,
        buttons: buttons,
        close: (html) => {
          if (typeof onClose === 'function') {
            onClose();
          }
        }
      },
      options
    );
  }

  static async #mountContent(message, title) {
    const data = {
      title: title ?? localize("Pergunta.Realizar_Acao"),
      message
    };
    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/others/confirmation-dialog.hbs`, data);
  }
}
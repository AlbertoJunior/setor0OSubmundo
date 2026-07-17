import { localize } from "../../utils/utils.mjs";
import { ConfirmationDialog } from "./confirmation-dialog.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { NoteMessageCreator } from "../message/note-message.mjs";

const DIALOG_TEMPLATE = `${TEMPLATES_PATH}/actors/dialog/note-dialog.hbs`;
const DIALOG_WIDTH = 320;

/**
 * Classe responsável pela criação e gerenciamento dos dialogs de anotação.
 *
 * - view(note)                       → Dialog read-only sem botões de ação.
 * - open(note, onConfirm, onDelete)  → Dialog com botões contextuais:
 *     • Criação (note null): Cancelar + Confirmar
 *     • Edição (note existente): Apagar + Editar
 */
export class CreateNoteDialog {

  /**
   * Abre o dialog em modo somente leitura (sem botões de ação ou com envio ao chat se ator fornecido).
   */
  static async view(note, actor = null) {
    const content = await this.#mountContent({ readOnly: true, ...note });

    const buttons = [];
    if (actor) {
      buttons.push({
        label: localize("Chat"),
        class: ['S0-button-confirm'],
        onClick: async () => {
          const chatContent = await NoteMessageCreator.mountContent(note);
          await ChatCreator.sendToChat(actor, chatContent);
        }
      });
    }

    FoundryApi.createDialog(
      {
        title: `${localize("Visualizar")}: ${localize("Anotacao.Anotacao")}`,
        content,
        buttons,
      },
      { width: DIALOG_WIDTH }
    );
  }

  /**
   * Abre o dialog para criação ou edição de anotação.
   *
   * @param {Object|null} note - Dados atuais da anotação (null para criação).
   * @param {Function} onConfirm - Callback ao confirmar (recebe os dados parseados).
   * @param {Function} [onDelete] - Callback ao apagar. Se fornecido, exibe botão "Apagar".
   */
  static async open(note, onConfirm, onDelete) {
    const isCreate = !note;

    const content = await this.#mountContent({
      readOnly: false,
      descricao_curta: note?.descricao_curta,
      descricao_longa: note?.descricao_longa,
    });

    const buttons = this.#createButtons(note, { confirm: onConfirm, delete: onDelete });
    const mode = isCreate ? localize("Criar") : localize("Editar");

    FoundryApi.createDialog(
      {
        title: `${mode}: ${localize("Anotacao.Anotacao")}`,
        content,
        buttons,
      },
      { width: DIALOG_WIDTH }
    );
  }

  /**
   * Cria os botões contextuais do dialog.
   * Criação: Cancelar + Criar.
   * Edição:  Apagar + Editar.
   */
  static #createButtons(note, eventButtons) {
    const { confirm: onConfirm, delete: onDelete } = eventButtons;
    const isCreate = !note;
    const buttons = [];

    if (onDelete) {
      buttons.push({
        label: localize("Apagar"),
        closeDialog: false,
        icon: 'fas fa-trash',
        class: ['S0-button-delete'],
        onClick: (html, dialog) => {
          ConfirmationDialog.open({
            onConfirm: () => {
              dialog?.close();
              onDelete(note);
            }
          });
        }
      });
    } else {
      buttons.push({
        label: localize("Cancelar"),
        class: ['S0-button-confirm'],
      });
    }

    buttons.push({
      label: isCreate ? localize("Criar") : localize("Editar"),
      class: ['S0-button-confirm'],
      icon: isCreate ? 'fas fa-square-plus' : 'fas fa-edit',
      default: !isCreate,
      onClick: (html) => {
        const data = DialogUtils.getDialogFormData(html);
        onConfirm(data);
      }
    });

    return buttons;
  }

  static async #mountContent(presetForm) {
    return await FoundryApi.renderTemplate(DIALOG_TEMPLATE, presetForm);
  }
}

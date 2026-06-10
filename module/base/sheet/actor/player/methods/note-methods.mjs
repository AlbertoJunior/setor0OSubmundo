import { getObject, localize } from "../../../../../utils/utils.mjs";
import { CreateNoteDialog } from "../../../../../creators/dialog/create-note-dialog.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";

/**
 * Handlers de eventos para a seção de Anotações na ficha do Player e NPC.
 *
 * ADD   – Abre dialog para criar nova anotação.
 * EDIT  – Abre dialog editável com botões "Apagar" e "Editar".
 * VIEW  – Com data-item-id: abre dialog read-only (sem botões).
 *         Sem data-item-id: expande/contrai o container de anotações.
 */
export const handlerNoteEvents = {
  [OnEventType.ADD]: async (actor, event) => NoteHandleEvents.handleAdd(actor, event),
  [OnEventType.EDIT]: async (actor, event) => NoteHandleEvents.handleEdit(actor, event),
  [OnEventType.VIEW]: async (actor, event) => NoteHandleEvents.handleView(actor, event),
}

class NoteHandleEvents {

  /**
   * Abre o dialog de criação de anotação.
   * Valida que a descrição curta é obrigatória.
   */
  static async handleAdd(actor, event) {
    const onConfirm = async (data) => {
      if (!data.descricaoCurta) {
        NotificationsUtils.error(localize("Anotacao.Descricao_Obrigatoria"));
        return;
      }

      const note = {
        descricao_curta: data.descricaoCurta,
        descricao_longa: data.descricaoLonga || null,
      };

      const current = getObject(actor, CharacteristicType.NOTES) || [];
      current.push(note);

      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.NOTES, current);
    };

    CreateNoteDialog.open(null, onConfirm);
  }

  /**
   * Abre dialog de edição com botões "Apagar" e "Editar".
   */
  static async handleEdit(actor, event) {
    const itemIndex = Number(event.currentTarget.dataset.itemId);
    const notes = getObject(actor, CharacteristicType.NOTES) || [];
    const note = notes[itemIndex];

    if (!note) {
      NotificationsUtils.error(localize("Erro"));
      return;
    }

    const onConfirm = async (data) => {
      if (!data.descricaoCurta) {
        NotificationsUtils.error(localize("Anotacao.Descricao_Obrigatoria"));
        return;
      }

      notes[itemIndex] = {
        descricao_curta: data.descricaoCurta,
        descricao_longa: data.descricaoLonga || null,
      };

      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.NOTES, notes);
    };

    const onDelete = async () => {
      notes.splice(itemIndex, 1);
      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.NOTES, notes);
    };

    CreateNoteDialog.open(note, onConfirm, onDelete);
  }

  /**
   * Gerencia a ação "view" na seção de anotações.
   * - Se houver data-item-id no elemento clicado, abre dialog com detalhes (sem botões).
   * - Caso contrário, expande/contrai o container de anotações (chevron toggle).
   */
  static async handleView(actor, event) {
    const itemId = event.currentTarget.dataset.itemId;

    if (itemId !== undefined) {
      this.#openViewDialog(actor, Number(itemId));
    } else {
      this.#toggleExpand(actor, event);
    }
  }

  /**
   * Abre dialog read-only com todas as informações da anotação.
   * Não exibe botões de ação.
   */
  static #openViewDialog(actor, itemIndex) {
    const notes = getObject(actor, CharacteristicType.NOTES) || [];
    const note = notes[itemIndex];

    if (!note) {
      NotificationsUtils.error(localize("Erro"));
      return;
    }

    CreateNoteDialog.view(note, actor);
  }

  /**
   * Expande ou contrai o container de anotações e inverte o ícone chevron.
   */
  static #toggleExpand(actor, event) {
    const minHeight = actor.sheet.defaultHeight;
    const container = event.currentTarget.parentElement.parentElement.querySelector(`#notes-container-${actor.id}`);
    if (container) {
      const resultExpand = HtmlJsUtils.expandOrContractElement(container, { minHeight });
      HtmlJsUtils.flipClasses(event.currentTarget.children[0], 'fa-chevron-down', 'fa-chevron-up');

      actor.sheet.isExpandedNotes = resultExpand.isExpanded;
    }
  }
}

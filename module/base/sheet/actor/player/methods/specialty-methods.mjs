import { getObject, localize } from "../../../../../utils/utils.mjs";
import { CreateSpecialtyDialog } from "../../../../../creators/dialog/create-specialty-dialog.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { AbilityRepository } from "../../../../../repository/ability-repository.mjs";

/**
 * Nível mínimo da habilidade base para poder adquirir uma especialidade.
 */
const MIN_SKILL_LEVEL = 4;

/**
 * Handlers de eventos para a seção de Especialidades na ficha do Player.
 *
 * ADD   – Abre dialog para criar nova especialidade (filtra habilidades nível >= 4).
 * EDIT  – Abre dialog editável com botões "Apagar" e "Editar".
 * VIEW  – Com data-item-id: abre dialog read-only (sem botões).
 *         Sem data-item-id: expande/contrai o container de especialidades.
 */
export const handlerSpecialtyEvents = {
  [OnEventType.ADD]: async (actor, event) => SpecialtyHandleEvents.handleAdd(actor, event),
  [OnEventType.EDIT]: async (actor, event) => SpecialtyHandleEvents.handleEdit(actor, event),
  [OnEventType.VIEW]: async (actor, event) => SpecialtyHandleEvents.handleView(actor, event),
}

class SpecialtyHandleEvents {

  /**
   * Retorna as habilidades do ator cujo nível base é >= MIN_SKILL_LEVEL.
   * Não considera bônus — apenas o valor bruto da habilidade.
   */
  static #getEligibleSkills(actor) {
    const skills = getObject(actor, CharacteristicType.SKILLS);
    if (!skills) return [];

    return AbilityRepository.getItems().filter(ability => (skills[ability.id] || 0) >= MIN_SKILL_LEVEL);
  }

  /**
   * Abre o dialog de criação de especialidade.
   * Filtra apenas habilidades elegíveis (nível base >= 4).
   */
  static async handleAdd(actor, event) {
    const eligible = this.#getEligibleSkills(actor);

    if (eligible.length === 0) {
      NotificationsUtils.warning(localize("Especialidade.Nenhuma_Habilidade_Elegivel"));
      return;
    }

    const onConfirm = async (data) => {
      if (!data.habilidade) {
        NotificationsUtils.error(localize("Especialidade.Habilidade_Obrigatoria"));
        return;
      }

      if (!data.descricaoCurta) {
        NotificationsUtils.error(localize("Especialidade.Descricao_Obrigatoria"));
        return;
      }

      const specialty = {
        habilidade: data.habilidade,
        descricao_curta: data.descricaoCurta,
        descricao_longa: data.descricaoLonga || null,
        custo: Number(data.custo) || 0,
      };

      const current = getObject(actor, CharacteristicType.SPECIALTIES) || [];
      current.push(specialty);

      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SPECIALTIES, current);
    };

    CreateSpecialtyDialog.open(null, eligible, onConfirm);
  }

  /**
   * Abre dialog de edição com botões "Apagar" e "Editar".
   */
  static async handleEdit(actor, event) {
    const itemIndex = Number(event.currentTarget.dataset.itemId);
    const specialties = getObject(actor, CharacteristicType.SPECIALTIES) || [];
    const specialty = specialties[itemIndex];

    if (!specialty) {
      NotificationsUtils.error(localize("Erro"));
      return;
    }

    const eligible = this.#getEligibleSkills(actor);

    const onConfirm = async (data) => {
      if (!data.descricaoCurta) {
        NotificationsUtils.error(localize("Especialidade.Descricao_Curta_Obrigatoria"));
        return;
      }

      specialties[itemIndex] = {
        habilidade: data.habilidade || specialty.habilidade,
        descricao_curta: data.descricaoCurta,
        descricao_longa: data.descricaoLonga || null,
        custo: Number(data.custo) || 0,
      };

      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SPECIALTIES, specialties);
    };

    const onDelete = async () => {
      specialties.splice(itemIndex, 1);
      await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SPECIALTIES, specialties);
    };

    CreateSpecialtyDialog.open(specialty, eligible, onConfirm, onDelete);
  }

  /**
   * Gerencia a ação "view" na seção de especialidades.
   * - Se houver data-item-id no elemento clicado, abre dialog com detalhes (sem botões).
   * - Caso contrário, expande/contrai o container de especialidades (chevron toggle).
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
   * Abre dialog read-only com todas as informações da especialidade.
   * Não exibe botões de ação.
   */
  static #openViewDialog(actor, itemIndex) {
    const specialties = getObject(actor, CharacteristicType.SPECIALTIES) || [];
    const specialty = specialties[itemIndex];

    if (!specialty) {
      NotificationsUtils.error(localize("Erro"));
      return;
    }

    CreateSpecialtyDialog.view(specialty);
  }

  static #toggleExpand(actor, event) {
    const minHeight = actor.sheet.defaultHeight;
    const container = event.currentTarget.parentElement.parentElement.querySelector(`#specialties-container-${actor.id}`);
    if (container) {
      const resultExpand = HtmlJsUtils.expandOrContractElement(container, { minHeight });
      HtmlJsUtils.flipClasses(event.currentTarget.children[0], 'fa-chevron-down', 'fa-chevron-up');

      actor.sheet.isExpandedSpecialties = resultExpand.isExpanded;
    }
  }
}

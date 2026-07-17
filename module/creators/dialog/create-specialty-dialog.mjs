import { localize, gameLocalize } from "../../utils/utils.mjs";
import { ConfirmationDialog } from "./confirmation-dialog.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";

const DIALOG_TEMPLATE = `${TEMPLATES_PATH}/actors/dialog/specialty-dialog.hbs`;
const DIALOG_WIDTH = 320;

/**
 * Classe responsável pela criação e gerenciamento dos dialogs de especialidade.
 *
 * - view(specialty)         → Dialog read-only sem botões de ação.
 * - open(specialty, eligible, onConfirm, onDelete) → Dialog com botões contextuais:
 *     • Criação (specialty null): Cancelar + Confirmar
 *     • Edição (specialty existente): Apagar + Editar
 */
export class CreateSpecialtyDialog {

  /**
   * Abre o dialog em modo somente leitura (sem botões de ação).
   */
  static async view(specialty) {
    const abilityLabel = this.#resolveAbilityLabel(specialty.habilidade);
    const content = await this.#mountContent({ readOnly: true, abilityLabel, ...specialty });

    FoundryApi.createDialog(
      {
        title: `${localize("Visualizar")}: ${localize("Especialidade.Especialidade")}`,
        content,
        buttons: [],
      },
      { width: DIALOG_WIDTH }
    );
  }

  /**
   * Abre o dialog para criação ou edição de especialidade.
   *
   * @param {Object|null} specialty - Dados atuais da especialidade (null para criação).
   * @param {Array} eligible - Lista de habilidades elegíveis (nível >= 4).
   * @param {Function} onConfirm - Callback ao confirmar (recebe os dados parseados).
   * @param {Function} [onDelete] - Callback ao apagar (recebe a specialty). Se fornecido, exibe botão "Apagar".
   */
  static async open(specialty, eligible, onConfirm, onDelete) {
    const isCreate = !specialty;

    const content = await this.#mountContent({
      readOnly: false,
      abilities: eligible,
      selectedAbility: specialty?.habilidade,
      descricao_curta: specialty?.descricao_curta,
      descricao_longa: specialty?.descricao_longa,
      custo: specialty?.custo ?? 0,
    });

    const buttons = this.#createButtons(specialty, { confirm: onConfirm, delete: onDelete });
    const mode = isCreate ? localize("Criar") : localize("Editar");

    FoundryApi.createDialog(
      {
        title: `${mode}: ${localize("Especialidade.Especialidade")}`,
        content,
        buttons,
      },
      { width: DIALOG_WIDTH }
    );
  }

  static #createButtons(specialty, eventButtons) {
    const { confirm: onConfirm, delete: onDelete } = eventButtons;
    const isCreate = !specialty;
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
              onDelete(specialty);
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

  /**
   * Resolve a label localizada de uma habilidade a partir do seu ID.
   */
  static #resolveAbilityLabel(abilityId) {
    const abilityInfo = AbilityRepository.getItem(abilityId);
    return abilityInfo ? gameLocalize(abilityInfo.label) : abilityId;
  }

  static async #mountContent(presetForm) {
    return await FoundryApi.renderTemplate(DIALOG_TEMPLATE, presetForm);
  }
}

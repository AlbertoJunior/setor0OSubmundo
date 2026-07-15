import { AttributeRepository } from "../../repository/attribute-repository.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { localize, randomId } from "../../utils/utils.mjs"
import { ConfirmationDialog } from "./confirmation-dialog.mjs";
import { RollTestUtils } from "../../core/rolls/roll-test-utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";

export class CreateRollableTestDialog {
  static async view(rollTestData, actor, type) {
    this.open(rollTestData, undefined, undefined, actor, type);
  }

  static async open(rollTestData, onConfirm, onDelete, actor, type) {
    const needConfirmation = onConfirm !== undefined;
    const isCreate = rollTestData == undefined;

    const buttons = this.#createButtons(rollTestData, { confirm: onConfirm, delete: onDelete });
    const content = await this.#mountContent(rollTestData, needConfirmation);
    const mode = this.#getDialogMode(isCreate, needConfirmation);
    const header = this.#setupParamsHeader(isCreate, rollTestData, actor, type);

    FoundryApi.createDialog(
      {
        title: `${mode}: Teste`,
        header: header,
        content: content,
        buttons: buttons
      }
    );
  }

  static #createButtons(rollableData, eventButtons) {
    const { confirm: onConfirm, delete: onDelete } = eventButtons;
    const haveOnConfirm = onConfirm !== undefined;
    const haveOnDelete = onDelete !== undefined;
    const inCreate = !rollableData && haveOnConfirm;

    const buttons = [];
    if (haveOnConfirm) {
      if (haveOnDelete) {
        buttons.push({
          label: localize("Apagar"),
          closeDialog: false,
          icon: 'fas fa-trash',
          class: ['S0-button-delete'],
          onClick: (html, dialog) => {
            ConfirmationDialog.open({
              onConfirm: () => {
                dialog?.close();
                onDelete(rollableData);
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

      buttons.push(
        {
          label: inCreate ? localize("Criar") : localize("Editar"),
          class: ['S0-button-confirm'],
          icon: inCreate ? 'fas fa-square-plus' : 'fas fa-edit',
          default: !inCreate,
          onClick: (html) => {
            const data = DialogUtils.getDialogFormData(html);
            const parsed = {
              id: rollableData?.id || randomId(),
              name: data.name,
              primary_attribute: data.primaryAttribute,
              secondary_attribute: data.secondaryAttribute,
              ability: data.ability,
              bonus: Number(data.bonus || 0),
              automatic: Number(data.automatic || 0),
              difficulty: Number(data.difficulty || 6),
              critic: Number(data.critic || 10),
              specialist: Boolean(data.specialist)
            };
            onConfirm(parsed);
          }
        }
      )
    }

    return buttons;
  }

  static async #mountContent(rollableData, needConfirmation) {
    const data = {
      uuid: `form_dialog.${randomId(10)}`,
      canEdit: needConfirmation,
      attributes: AttributeRepository.getItems(),
      abilities: AbilityRepository.getItems(),
      difficulty: 6,
      critic: 10,
      bonus: 0,
      automatic: 0,
      specialist: false,
      ...rollableData
    };

    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/rolls/create-roll-test-dialog.hbs`, data);
  }

  static #getDialogMode(isCreate, needConfirmation) {
    let mode = '';
    if (isCreate) {
      mode = localize("Criar");
    } else if (needConfirmation) {
      mode = localize("Editar");
    } else {
      mode = localize("Visualizar");
    }

    return mode;
  }

  static #setupParamsHeader(isCreate, rollTestData, actor, type) {
    const headerButtons = [];

    if (!isCreate) {
      headerButtons.push(
        {
          label: localize("Criar_Macro"),
          icon: 'fas fa-code',
          onClick: async () => {
            await RollTestUtils.createMacroByRollTestData(rollTestData, { actor, type });
          }
        }
      );
    }
    return {
      buttons: headerButtons
    };
  }
}

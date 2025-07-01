import { AttributeRepository } from "../../repository/attribute-repository.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { localize, randomId } from "../../../scripts/utils/utils.mjs"
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { ConfirmationDialog } from "./confirmation-dialog.mjs";
import { RollTestUtils } from "../../core/rolls/roll-test-utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

export class CreateRollableTestDialog {
    static async view(rollTestData) {
        this.open(rollTestData);
    }

    static async open(rollTestData, onConfirm, onDelete) {
        const needConfirmation = onConfirm !== undefined;
        const isCreate = rollTestData == undefined;

        const buttons = this.#createButtons(rollTestData, { confirm: onConfirm, delete: onDelete });
        const content = await this.#mountContent(rollTestData, needConfirmation, buttons);
        const mode = this.#getDialogMode(isCreate, needConfirmation);

        const dialog = new Dialog({
            title: `${mode}: Teste`,
            content,
            buttons: {},
            render: (html) => {
                const params = {}
                this.#setupParamsHeader(isCreate, rollTestData, params);

                DialogUtils.presetDialogRender(html, params);

                this.#setupButtons(buttons, html, dialog);
            },
        });
        dialog.render(true);
    }

    static #createButtons(rollableData, eventButtons) {
        const { confirm: onConfirm, delete: onDelete } = eventButtons;
        const haveOnConfirm = onConfirm !== undefined;
        const haveOnDelete = onDelete !== undefined;
        const inCreate = !rollableData && haveOnConfirm;

        let buttons;
        if (haveOnConfirm) {
            buttons = {};

            if (haveOnDelete) {
                buttons['delete'] = {
                    label: localize("Apagar"),
                    closeDialog: false,
                    classes: 'S0-button-delete',
                    icon: 'fa-trash',
                    callback: (html, dialog) => {
                        ConfirmationDialog.open({
                            onConfirm: () => {
                                onDelete(rollableData);
                                dialog.close();
                            }
                        });
                    }
                };
            } else {
                buttons['cancel'] = {
                    label: localize("Cancelar"),
                    classes: 'S0-button-confirm',
                };
            }

            buttons['confirm'] = {
                label: inCreate ? localize("Criar") : localize("Editar"),
                classes: 'S0-button-confirm default',
                icon: inCreate ? 'fa-square-plus' : 'fa-edit',
                callback: (html, dialog) => {
                    const form = html[0].querySelector("form");
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    const parsed = {
                        id: rollableData?.id || randomId(),
                        name: data.name,
                        primary_attribute: data.primary_attribute,
                        secondary_attribute: data.secondary_attribute,
                        ability: data.ability,
                        bonus: Number(data.bonus || 0),
                        automatic: Number(data.automatic || 0),
                        difficulty: Number(data.difficulty || 6),
                        critic: Number(data.critic || 10),
                        specialist: Boolean(formData.has("specialist"))
                    };
                    onConfirm(parsed);
                }
            };

            Object.keys(buttons).forEach(key => {
                buttons[key].key = key;
            });
        }

        return buttons;
    }

    static async #mountContent(rollableData, needConfirmation, buttons) {
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
            buttons: buttons !== undefined ? Object.values(buttons) : null,
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

    static #setupParamsHeader(isCreate, rollTestData, params) {
        if (!isCreate) {
            params['header'] = {
                buttons: [
                    {
                        label: localize("Criar_Macro"),
                        icon: { class: 'fas fa-code' },
                        onClick: async () => {
                            await RollTestUtils.createMacroByRollTestData(rollTestData);
                        }
                    }
                ]
            }
        }
    }

    static #setupButtons(buttons, html, dialog) {
        if (buttons) {
            Object.keys(buttons).forEach(key => {
                const button = buttons[key];
                const buttonElement = html.find(`[data-action="${key}"]`);
                buttonElement.on("click", () => {
                    if (button.callback !== undefined) {
                        button.callback(html, dialog);
                        if (button.closeDialog == false) {
                            return;
                        }
                    }
                    dialog.close();
                });
            });
        }
    }
}

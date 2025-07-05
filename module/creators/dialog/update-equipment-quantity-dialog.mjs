import { localize } from "../../../scripts/utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

export class UpdateEquipmentQuantityDialog {
    static async updateQuantityDialog(quantity, onConfirm = () => { }) {
        const content = await this.#mountContent(quantity);

        FoundryApi.createDialog(
            {
                title: localize("Alterar_Quantidade"),
                content: content,
                buttons: [
                    {
                        label: localize("Remover"),
                        onClick: (html) => {
                            const attr1 = this.#getValue(html);
                            onConfirm?.(-attr1);
                        }
                    },
                    {
                        label: localize("Adicionar"),
                        onClick: (html) => {
                            const attr1 = this.#getValue(html);
                            onConfirm?.(attr1);
                        }
                    }
                ],
            }
        );
    }

    static async #mountContent(quantity) {
        const data = {
            quantity
        }
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/items/dialog/quantity-dialog.hbs`, data);
    }

    static #getValue(html) {
        return parseInt(html.find("#quantity").val());
    }
}
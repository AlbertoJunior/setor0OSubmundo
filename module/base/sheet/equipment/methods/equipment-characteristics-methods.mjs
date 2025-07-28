import { getObject, localize, onArrayRemove, selectCharacteristicAndReturnLength } from "../../../../utils/utils.mjs";
import { EquipmentUtils } from "../../../../core/equipment/equipment-utils.mjs";
import { ConfirmationDialog } from "../../../../creators/dialog/confirmation-dialog.mjs";
import { EquipmentCharacteristicType } from "../../../../enums/equipment-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { SuperEquipmentField } from "../../../../field/equipment-field.mjs";
import { EquipmentUpdater } from "../../../updater/equipment-updater.mjs";
import { CreateFormDialog } from "../../../../creators/dialog/create-dialog.mjs";
import { SubstanceEffectRepository } from "../../../../repository/substance-effect-repository.mjs";
import { NotificationsUtils } from "../../../../creators/message/notifications.mjs";
import { EquipmentInfoParser } from "../../../../core/equipment/equipment-info.mjs";

export const handlerEquipmentCharacteristicsEvents = {
    [OnEventType.CHECK]: async (item, event) => EquipmentSheetCharacteristicsHandle.check(item, event),
    [OnEventType.ADD]: async (item, event) => EquipmentSheetCharacteristicsHandle.add(item, event),
    [OnEventType.REMOVE]: async (item, event) => EquipmentSheetCharacteristicsHandle.remove(item, event),
}

class EquipmentSheetCharacteristicsHandle {
    static async add(item, event) {
        const target = event.currentTarget;
        const type = target.dataset.type;

        const mapCheck = {
            'substance': (item, target) => this.#addSubstanceEffect(item),
        }

        await mapCheck[type]?.(item, target);
    }

    static async #addSubstanceEffect(item) {
        CreateFormDialog.open(
            localize('Itens.Adicionar_Efeito'),
            'items/dialog/substance-effect',
            {
                presetForm: {
                    effects: this.#mapOptions(SubstanceEffectRepository.getItems())
                },
                onConfirm: async (data) => {
                    const actualList = getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];
                    const selectedEffect = SubstanceEffectRepository.getItem(data.selectedEffect);

                    if (actualList.some(item => item.id == selectedEffect.id)) {
                        NotificationsUtils.error(localize('Itens.Mensagens.Nao_Pode_Efeitos_Iguais'));
                        return;
                    }

                    if (selectedEffect) {
                        EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS, new Set([...actualList, selectedEffect]));
                    }
                },
            }
        );
    }

    static #mapOptions(list) {
        const groups = {};

        list.forEach((item, index) => {
            const groupLabel = EquipmentInfoParser.parseSubstanceEffectType(item.type);

            if (!groups[groupLabel]) {
                groups[groupLabel] = [];
            }

            groups[groupLabel].push({
                ...item,
                index,
            });
        });

        return Object.entries(groups)
            .sort(([labelA], [labelB]) => {
                return labelA.localeCompare(labelB);
            })
            .map(([label, options]) => (
                {
                    label,
                    options
                }
            ));
    }

    static async remove(item, event) {
        const target = event.currentTarget;
        const type = target.dataset.type;

        const mapCheck = {
            'substance': (item, target) => this.#removeSubstance(item, target.dataset.itemId),
        }

        await mapCheck[type]?.(item, target);
    }

    static async #removeSubstance(item, itemId) {
        const actualList = getObject(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS) || [];
        const selectedItem = actualList[actualList.findIndex(item => item.id == itemId)];
        onArrayRemove(actualList, selectedItem);
        EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUBSTANCE.EFFECTS, actualList);
    }

    static async check(item, event) {
        const target = event.currentTarget;
        const type = target.dataset.type;

        const mapCheck = {
            'superequipment': (item, target) => this.#checkSuperEquipment(item, target),
            'level': (item, target) => this.#checkLevel(item, target),
        }

        await mapCheck[type]?.(item, target);
    }

    static async #checkSuperEquipment(item, target) {
        const checked = target.checked;
        const superEquipment = getObject(item, EquipmentCharacteristicType.SUPER_EQUIPMENT);
        if (superEquipment && EquipmentUtils.getSuperEquipmentHaveEffects(superEquipment)) {
            ConfirmationDialog.open({
                titleDialog: localize('Itens.Pergunta.Excluir_SuperEquipamento'),
                message: localize('Itens.Pergunta.Excluir_SuperEquipamento_Completo'),
                onConfirm: () => {
                    this.#operateSuperEquipmentCheck(item, target, checked);
                }
            });
        } else {
            this.#operateSuperEquipmentCheck(item, target, checked);
        }
    }

    static #operateSuperEquipmentCheck(item, target, checked) {
        const parentClassList = target.parentElement.parentElement.classList;
        let objectToSet;
        if (checked) {
            parentClassList.remove('S0-superequipment-contracted');
            objectToSet = SuperEquipmentField.toJson();
        } else {
            parentClassList.add('S0-superequipment-contracted');
            objectToSet = null;
        }

        setTimeout(async () => {
            await EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUPER_EQUIPMENT, objectToSet);
        }, 150);
    }

    static async #checkLevel(item, target) {
        const level = selectCharacteristicAndReturnLength(target);
        await EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL, level);
    }
}
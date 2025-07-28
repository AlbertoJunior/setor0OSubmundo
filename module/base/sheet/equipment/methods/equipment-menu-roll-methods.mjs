import { getObject, localize } from "../../../../utils/utils.mjs";
import { CreateRollableTestDialog } from "../../../../creators/dialog/create-roll-test-dialog.mjs";
import { NotificationsUtils } from "../../../../creators/message/notifications.mjs";
import { EquipmentCharacteristicType } from "../../../../enums/equipment-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { HtmlJsUtils } from "../../../../utils/html-js-utils.mjs";
import { EquipmentUpdater } from "../../../updater/equipment-updater.mjs";

export const handlerEquipmentMenuRollEvents = {
    [OnEventType.ADD]: async (item, event) => EquipmentSheetMenuRollHandle.add(item, event),
    [OnEventType.VIEW]: async (item, event) => EquipmentSheetMenuRollHandle.view(item, event),
    createRollTest: async (item, rollable) => EquipmentSheetMenuRollHandle.createRollTest(item, rollable),
}

class EquipmentSheetMenuRollHandle {
    static add(item, event) {
        CreateRollableTestDialog.open(null, async (rollable) => {
            await this.createRollTest(item, rollable);
        });
    }

    static async createRollTest(item, rollable) {
        if (!rollable.name) {
            NotificationsUtils.error(localize('Aviso.Teste.Erro_Sem_Nome'));
            return;
        }

        const current = [...getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS)] || [];
        current.push(rollable);

        const changes = [];
        changes.push(EquipmentUpdater.createChange(EquipmentCharacteristicType.POSSIBLE_TESTS, current));

        if (current.length == 1) {
            changes.push(EquipmentUpdater.createChange(EquipmentCharacteristicType.DEFAULT_TEST, rollable.id));
        }
        await EquipmentUpdater.updateEquipmentData(item, changes);
    }

    static view(item, event) {
        const target = event.currentTarget;

        HtmlJsUtils.flipClasses(target.children[0], 'fa-chevron-up', 'fa-chevron-down');

        const containerList = target.parentElement.parentElement.parentElement.querySelector('#rollable-tests-list');
        const expandResult = HtmlJsUtils.expandOrContractElement(containerList, { minHeight: item.sheet.defaultHeight, maxHeight: 840 });
        item.sheet.isExpandedTests = expandResult.isExpanded;
        item.sheet.newHeight = expandResult.newHeight;
    }
}
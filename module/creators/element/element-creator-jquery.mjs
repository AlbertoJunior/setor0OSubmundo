import { gameLocalize } from "../../utils/utils.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";

export class ElementCreatorJQuery {
    static #createCharacteristicDiv(isEditable, safeEventType, characteristicType) {
        return $('<div>', {
            class: isEditable ? `S0-characteristic S0-clickable` : `S0-characteristic`,
            'data-action': isEditable ? `${safeEventType}` : undefined,
            'data-characteristic': characteristicType
        });
    };

    static _createCharacteristicContainer(characteristic, characteristicType, amount, isEditable, addLast, firstSelected, eventType) {
        const safeEventType = eventType ? eventType : OnEventType.CHARACTERISTIC

        const divContainer = $('<div>', {
            class: 'S0-characteristic-container',
            id: characteristic.id
        });

        const label = $('<label>', {
            text: gameLocalize(characteristic.label)
        });

        divContainer.append(label);

        for (let i = 0; i < amount; i++) {
            const divCharacteristic = this.#createCharacteristicDiv(isEditable, safeEventType, characteristicType);
            if (firstSelected && i == 0) {
                divCharacteristic.addClass('S0-selected');
            }
            divContainer.append(divCharacteristic);
        }

        if (addLast) {
            const divCaracteristica = this.#createCharacteristicDiv(isEditable, safeEventType, characteristicType);
            divCaracteristica.addClass('S0-characteristic-6');
            divContainer.append(divCaracteristica);
        }

        return divContainer;
    }

    static _createOption(itemId, name, value, isSelected) {
        return $('<option>', {
            value: value,
            text: name,
            'data-item-id': itemId,
            selected: isSelected || false
        });
    }
}
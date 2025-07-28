import { localize } from "../utils/utils.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";

export class VirtuesRepository {
    static #characteristics = [
        { id: CharacteristicType.VIRTUES.CONSCIOUSNESS.id, label: 'Consciencia' },
        { id: CharacteristicType.VIRTUES.PERSEVERANCE.id, label: 'Perseveranca' },
        { id: CharacteristicType.VIRTUES.QUIETNESS.id, label: 'Quietude' }
    ];

    static getItems() {
        return [... this.#characteristics]
            .map(item => {
                return {
                    ...item,
                    label: localize(item.label)
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }
}
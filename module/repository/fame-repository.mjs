import { localize } from "../utils/utils.mjs";
import { CharacteristicType, BaseActorCharacteristicType } from "../enums/characteristic-enums.mjs";

export class FameRepository {
    static #characteristics = [
        { id: CharacteristicType.CORE.id, label: 'Nucleo' },
        { id: BaseActorCharacteristicType.INFLUENCE.id, label: 'Influencia' },
        { id: BaseActorCharacteristicType.BOUNTY.id, label: 'Procurado' }
    ];

    static getItems() {
        return [... this.#characteristics]
            .map(item => {
                return {
                    ...item,
                    label: localize(item.label)
                };
            });
    }

    static getItemsNpc() {
        return FameRepository.getItems().filter(item => item.id != 'nucleo')
    }
}
import { localize } from "../utils/utils.mjs";
import { CharacteristicType, BaseActorCharacteristicType } from "../enums/characteristic-enums.mjs";

export class FameRepository {
    static TYPES = Object.freeze({
        CORE: { id: CharacteristicType.CORE.id, label: 'Nucleo', initialLevel: 1, maxLevel: 5 },
        INFLUENCE: { id: BaseActorCharacteristicType.INFLUENCE.id, label: 'Influencia', initialLevel: 0, maxLevel: 6 },
        BOUNTY: { id: BaseActorCharacteristicType.BOUNTY.id, label: 'Procurado', initialLevel: 0, maxLevel: 5 },
    });

    static #characteristics = Object.values(this.TYPES);

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
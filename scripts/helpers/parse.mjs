import { EquipmentInfoParser } from "../../module/core/equipment/equipment-info.mjs";
import { CharacteristicType } from "../../module/enums/characteristic-enums.mjs";
import { EnhancementRepository } from "../../module/repository/enhancement-repository.mjs";
import { gameLocalize, keyJsonToKeyLang } from "../utils/utils.mjs";

const parseables = {
    'roll_enhancement_formule': (values) => {
        const [enhancementId, val1, val2, val3 = ''] = values;

        const enhancement = EnhancementRepository.getEnhancementById(enhancementId);

        const replaceIfEnhancement = (val) => {
            if (val == CharacteristicType.ENHANCEMENT.id) {
                return enhancement.name;
            } else if (val) {
                return gameLocalize(keyJsonToKeyLang(val));
            } else {
                return '';
            }
        };

        const primary = replaceIfEnhancement(val1);
        const secondary = replaceIfEnhancement(val2);
        const base = `(${primary} + ${secondary})/2`;
        return val3 ? `${base} + ${replaceIfEnhancement(val3)}` : base;
    },
    'effect_on_status': (value) => {
        const effect = value[0];
        const origin = effect.origin;
        const name = effect.name;
        return origin ? `${origin}: ${name}` : name;
    },
    'item_quantity': (value) => EquipmentInfoParser.parseQuantity(value[0]),
}

export default function parse(op, ...params) {
    params.pop();
    return parseables[op](Object.values(params));
}
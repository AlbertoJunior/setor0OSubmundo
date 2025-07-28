import { SystemFlags } from "../../module/enums/flags-enums.mjs";
import { FlagsUtils } from "../../module/utils/flags-utils.mjs";

const returnableClasses = {
    'marked': (isMarked) => {
        if (isMarked) {
            return 'S0-marked';
        } else {
            return ''
        }
    },
    'compacted': () => {
        if (FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT)) {
            return 'S0-compact'
        } else {
            return '';
        }
    },
};

export default function htmlUtils(op, params) {
    const result = returnableClasses[op](params);
    if (result == undefined || result == null) {
        console.warn('Handlebar error?')
    }
    return result || '';
}
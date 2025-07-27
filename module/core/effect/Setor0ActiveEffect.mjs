import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

export class Setor0ActiveEffect extends FoundryApi.ActiveEffect {
    _onCreate(data, options, userId) {
        this.#verifyHideTooltipText(data, options);
        super._onCreate(data, options, userId);
    }
    _onDelete(options, userId) {
        this.#verifyHideTooltipText(null, options)
        super._onDelete(options, userId);
    }

    #verifyHideTooltipText(data, options) {
        const alwaysShow = data != null && FlagsUtils.getItemFlag(data, ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN, false);
        const isOwner = game.user.isGM || options.parent.isOwner;
        options.animate = isOwner || alwaysShow;
    }
}

export async function configureSetor0ActiveEffect() {
    CONFIG.ActiveEffect.documentClass = Setor0ActiveEffect;
}
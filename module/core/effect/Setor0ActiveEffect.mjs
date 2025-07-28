import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class Setor0ActiveEffect extends FoundryApi.ActiveEffect {
    _onCreate(data, options, userId) {
        this.#verifyHideTooltipText(data, options);
        super._onCreate(data, options, userId);
    }

    _onUpdate(changed, options, userId) {
        debugger
        this.#verifyHideTooltipText(data, options);
        super._onUpdate(data, options, userId);
    }

    _onDelete(options, userId) {
        this.#verifyHideTooltipText(null, options)
        super._onDelete(options, userId);
    }

    #verifyHideTooltipText(data, options) {
        const alwaysShow = data != null && FlagsUtils.getItemFlag(data, ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN, false);
        const isOwner = game.user.isGM || options.parent.isOwner;
        options.animate = isOwner || alwaysShow;

        if (options.animate) {
            this.modifyCreateScrollingText();
        }
    }

    modifyCreateScrollingText() {
        const originalCreate = canvas.interface.createScrollingText;
        canvas.interface.createScrollingText = async function (origin, content, options = {}) {
            //DIRECTION 1 == DOWN, DIRECTION 2 == UP
            const fillColor = options.direction == 2 ? "#ffdc00" : "#410082";
            const textStyle = {
                _fontFamily: "Setor0",
                _fontSize: 30,
                _fill: fillColor,
                _stroke: "#000000",
                _letterSpacing: 5,
                // _lineHeight: "1.2",
                // strokeThickness: 4,
                // fontWeight: "bold",
                // _dropShadow: true,
                // dropShadowBlur: 2,
                // dropShadowColor: "#000000"
            };

            options = {
                ...options,
                ...textStyle
            };

            canvas.interface.createScrollingText = originalCreate;
            return await originalCreate.call(this, origin, content, options);
        }
    }
}

export async function configureSetor0ActiveEffect() {
    CONFIG.ActiveEffect.documentClass = Setor0ActiveEffect;
}
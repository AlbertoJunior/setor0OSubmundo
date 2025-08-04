import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { COLORS } from "../../constants.mjs";

export function configureSetor0ActiveEffect() {
    CONFIG.ActiveEffect.documentClass = Setor0ActiveEffect;
}

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
        options.animate = !(options.animate == false) && (isOwner || alwaysShow);

        if (options.animate) {
            this.modifyCreateScrollingText();
        }
    }

    modifyCreateScrollingText() {
        const originalCreate = canvas.interface.createScrollingText;
        canvas.interface.createScrollingText = async function (origin, content, options = {}) {
            const toTop = options.direction == CONST.TEXT_ANCHOR_POINTS.TOP
            const fillColor = toTop ? COLORS.BASE.primary : COLORS.BASE.secondary;
            const strokeColor = toTop ? COLORS.ON.primary : COLORS.ON.secondary;

            const textStyle = {
                _fontFamily: "Setor0",
                _fontSize: 30,
                _fill: fillColor,
                _stroke: strokeColor,
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
import { gameLocalize, localize } from "../../utils/utils.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class Setor0TokenCanvas extends FoundryApi.TokenCanvas {

    #verifyIsForcedByFlag(effectFlags) {
        const isOverlay = effectFlags['core']?.['overlay'] ?? false
        const isForced = effectFlags[SYSTEM_ID][ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN] ?? false;
        return isOverlay || isForced;
    }

    get haveValidActor() {
        return this.actor && this.actor.isOwner;
    }

    #verifyShowEffect(effectFlags) {
        const canShowByActor = this.haveValidActor;
        const forcedShow = this.#verifyIsForcedByFlag(effectFlags);
        return forcedShow || canShowByActor;
    }

    /**
     * Sobrescrita do método original @{super._drawEffects()} apenas para poder passar as flags para _drawEffect e _drawOverlay, além de checar se a promise existe e saber qual efeito pode exibir ou não.
     */
    async _drawEffects() {
        this.effects.renderable = false;

        // Clear Effects Container
        this.effects.removeChildren().forEach(c => c.destroy());
        this.effects.bg = this.effects.addChild(new PIXI.Graphics());
        this.effects.bg.zIndex = -1;
        this.effects.overlay = null;

        // Categorize effects
        const activeEffects = this.actor?.temporaryEffects || [];
        const overlayEffect = activeEffects.findLast(e => e.img && e.getFlag("core", "overlay"));

        // Draw effects
        const promises = [];
        for (const [i, effect] of activeEffects.entries()) {
            if (!effect.img) continue;
            const promise = effect === overlayEffect
                ? this._drawOverlay(effect.img, effect.tint, effect.flags)
                : this._drawEffect(effect.img, effect.tint, effect.flags);

            if (!promise) continue;

            promises.push(promise.then(e => {
                if (e) e.zIndex = i;
            }));
        }
        await Promise.allSettled(promises);

        this.effects.sortChildren();
        this.effects.renderable = true;
        this.renderFlags.set({ refreshEffects: true });
    }

    async _drawEffect(src, tint, flags) {
        if (this.#verifyShowEffect(flags)) {
            return super._drawEffect(src, tint);
        }
        return null;
    }

    async _drawOverlay(src, tint, flags) {
        const icon = await this._drawEffect(src, tint, flags);
        if (icon) icon.alpha = 0.8;
        this.effects.overlay = icon ?? null;
        return icon;
    }
}

export class Setor0TokenDocument extends FoundryApi.TokenDocument {
    static #mappedLabel = new Map();

    static setValuesOnMapped(values = []) {
        const isValid = value => value && value.trim() !== '';

        values.forEach(({ id, label }) => {
            if (isValid(id) && isValid(label)) {
                this.#mappedLabel.set(id, label);
            }
        });
    }

    static getTrackedAttributeChoices(attributes) {
        const barGroup = gameLocalize("TOKEN.BarAttributes");
        const valueGroup = gameLocalize("TOKEN.BarValues");

        const preset = super.getTrackedAttributeChoices(attributes);
        const mappedItems = preset.map(item => {
            const itemLabel = item.label.replace('.value', '');
            return {
                group: item.group,
                value: item.value,
                label: this.#mappedLabel.has(itemLabel) ? localize(this.#mappedLabel.get(itemLabel)) : itemLabel
            }
        }).sort((a, b) => {
            if (a.group == b.group) {
                return a.label.compare(b.label);
            } else if (a.group == barGroup) {
                return -1
            } else if (a.group == valueGroup) {
                return 1
            } else {
                return a.label.compare(b.label);
            }
        });

        return mappedItems;
    }
}

export async function configureSetor0TokenDocument() {
    CONFIG.Token.documentClass = Setor0TokenDocument;
    CONFIG.Token.objectClass = Setor0TokenCanvas;
}
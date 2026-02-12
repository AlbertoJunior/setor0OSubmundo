import { ChatCreator } from "../../utils/chat-creator.mjs";
import { localize, keyJsonToKeyLang, gameLocalize } from "../../utils/utils.mjs";
import { EffectMessageCreator } from "../message/effect-message.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { ActiveEffectsUtils } from "../../core/effect/active-effects-utils.mjs";

export class EffectDialog {
    static async open(effect, actor) {
        const effectData = this.#extractEffectData(effect);
        const content = await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/effects/effect-dialog.hbs`, effectData);

        const buttons = [
            {
                label: localize("Chat"),
                default: true,
                onClick: async () => {
                    const messageContent = await EffectMessageCreator.mountContent(effectData);
                    ChatCreator.sendToChat(actor, messageContent);
                }
            }
        ];

        FoundryApi.createDialog(
            {
                title: localize("Efeito"),
                content: content,
                buttons: buttons,
            },
            { width: 400 }
        );
    }

    static #extractEffectData(effect) {
        const originType = ActiveEffectsUtils.getOriginType(effect);
        const originTypeLabel = originType ? ActiveEffectsUtils.activeEffectOriginTypeLabel(originType) : null;

        const isBuff = ActiveEffectsUtils.isBuff(effect);
        const isDebuff = ActiveEffectsUtils.isDebuff(effect);
        const effectTypeLabel = isBuff ? 'Buff' : isDebuff ? 'Debuff' : null;

        const changes = (effect.changes || [])
            .map(change => ({
                label: this.#parseChangeKey(change.key),
                value: this.#parseChangeValue(change.key, change.value),
            }));

        return {
            name: effect.name,
            origin: effect.origin || null,
            description: effect.description || null,
            img: effect.img || null,
            disabled: effect.disabled,
            originTypeLabel: originTypeLabel,
            effectTypeLabel: effectTypeLabel,
            hasChanges: changes.length > 0,
            changes: changes,
        };
    }

    static #parseChangeKey(key) {
        if (!key) {
            return key;
        }

        const segments = key.split('.');
        const lastSegment = segments[segments.length - 1];

        try {
            const langKey = keyJsonToKeyLang(lastSegment);
            const localized = gameLocalize(langKey);
            if (localized !== langKey) {
                return localized;
            }
        } catch (e) { }

        return lastSegment;
    }

    static #parseChangeValue(key, value) {
        if (!key) {
            return value;
        }

        const lastSegment = key.split('.').pop();
        if (lastSegment === 'defensivo_multiplo') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                return `${Math.round(numValue * 100)}%`;
            }
        }

        return value;
    }
}

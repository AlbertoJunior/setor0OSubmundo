import { randomId } from "../../utils/utils.mjs";
import { ActorUpdater } from "../../base/updater/actor-updater.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { ActiveEffectsFlags, ActiveEffectsTypes } from "../../enums/active-effects-enums.mjs";

export class ActiveEffectsUtils {
    static KEYS = {
        TINT_TOKEN: "texture.tint"
    }

    static createEffectData(params) {
        const {
            id,
            name = "",
            description = "",
            origin = "",
            img,
            tint,
            disabled = false,
            duration,
            statuses = [],
            changes = [],
            flags = {}
        } = params;

        const fullFlags = {
            originId: "",
            originType: "",
            ...flags
        };

        if (!fullFlags.originId?.trim()) {
            console.warn('Origin ID é OBRIGATÓRIO')
            return null;
        }

        const activeEffectData = {
            id: id || randomId(10),
            name: name,
            description: description,
            origin: origin,
            img: img,
            tint: tint,
            disabled: disabled,
            duration: duration,
            statuses: new Set(statuses),
            changes: changes,
            flags: {
                [SYSTEM_ID]: fullFlags
            }
        };

        return activeEffectData;
    }

    static getFlags(activeEffect) {
        return activeEffect.flags[SYSTEM_ID] || {};
    }

    static getOriginId(activeEffect) {
        return this.getFlags(activeEffect)[ActiveEffectsFlags.ORIGIN_ID];
    }

    static getOriginType(activeEffect) {
        return this.getFlags(activeEffect)[ActiveEffectsFlags.ORIGIN_TYPE];
    }

    static async addActorEffect(actor, activeEffectData) {
        await ActorUpdater.addEffects(actor, [...activeEffectData]);
    }

    static async removeActorEffect(actor, effectId) {
        this.removeActorEffects(actor, [effectId]);
    }

    static getActorEffect(actor, effectOriginId) {
        return actor?.effects.find(effect => this.getOriginId(effect) == effectOriginId);
    }

    static async removeActorEffects(actor, effectsId = []) {
        if (!actor || !Array.isArray(effectsId) || effectsId.length === 0) {
            return;
        }

        const effectsSet = new Set(effectsId);
        const effectsToRemove = actor.effects.filter(effect => effectsSet.has(ActiveEffectsUtils.getOriginId(effect)));

        await Promise.all(effectsToRemove.map(effect => effect.delete()));
    }

    static isPassive(effect) {
        return effect.duration.type == 'none';
    }

    static hasType(effect) {
        const effectType = this.getFlags(effect)[ActiveEffectsFlags.TYPE];
        return effectType != undefined;
    }

    static isBuff(effect) {
        const effectType = this.getFlags(effect)[ActiveEffectsFlags.TYPE];
        return effectType == ActiveEffectsTypes.BUFF;
    }

    static isDebuff(effect) {
        const effectType = this.getFlags(effect)[ActiveEffectsFlags.TYPE];
        return effectType == ActiveEffectsTypes.DEBUFF;
    }

    static async enableEffect(effect) {
        if (effect) {
            await effect.update({ disabled: false });
        }
    }

    static async disableEffect(effect) {
        if (effect) {
            await effect.update({ disabled: true });
        }
    }
}
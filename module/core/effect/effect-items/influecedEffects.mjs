import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { influenceEnhancement } from "../../enhancement/enhancement-items/influence.mjs";
import { ActiveEffectsUtils } from "../active-effects.mjs";

const addictedId = 'viciado';
const mesmerizedId = 'mesmerizado';
const racionalizeId = 'racionalizando';
const fascinatedId = 'fascinado';

const addicted = ActiveEffectsUtils.createEffectData({
    id: addictedId,
    name: "S0.Efeito_Ativo.Viciado",
    origin: `Aprimoramento: ${influenceEnhancement.name}`,
    img: `${influenceEnhancement.icon}`,
    tint: "#FFDC00",
    changes: [
        {
            key: CharacteristicType.BONUS.VIRTUES.PERSEVERANCE.system,
            value: -1,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: addictedId,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
    }
});

const mesmerized = ActiveEffectsUtils.createEffectData({
    id: mesmerizedId,
    name: "S0.Efeito_Ativo.Racionalizando",
    origin: `Aprimoramento: ${influenceEnhancement.name}`,
    img: `${influenceEnhancement.icon}`,
    duration: { rounds: 99, startTime: 0 },
    tint: "#FFDC00",
    changes: [
        {
            key: CharacteristicType.BONUS.VIRTUES.CONSCIOUSNESS.system,
            value: -1,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: mesmerizedId,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
    }
});

const racionalize = ActiveEffectsUtils.createEffectData({
    id: racionalizeId,
    name: "S0.Efeito_Ativo.Racionalizando",
    origin: `Aprimoramento: ${influenceEnhancement.name}`,
    img: `${influenceEnhancement.icon}`,
    duration: { rounds: 99, startTime: 0 },
    tint: "#FFDC00",
    changes: [],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: racionalizeId,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
    }
});

const fascinated = ActiveEffectsUtils.createEffectData({
    id: fascinatedId,
    name: "S0.Efeito_Ativo.Fascinado",
    origin: `Aprimoramento: ${influenceEnhancement.name}`,
    img: `${influenceEnhancement.icon}`,
    duration: { rounds: 99, startTime: 0 },
    tint: "#FFDC00",
    changes: [
        {
            key: CharacteristicType.BONUS.VIRTUES.QUIETNESS.system,
            value: -1,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: fascinatedId,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
    }
});

export const influencedActiveEffects = [addicted, mesmerized, racionalize, fascinated];
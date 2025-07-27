import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { brutalityEnhancement } from "../../enhancement/enhancement-items/brutality.mjs";
import { ActiveEffectsUtils } from "../active-effects.mjs";

const shattered1Id = 'destrocado1';
const shattered2Id = 'destrocado2';
const shattered3Id = 'destrocado3';

const shattered1 = ActiveEffectsUtils.createEffectData({
    id: shattered1Id,
    name: "S0.Efeito_Ativo.Destrocado1",
    origin: `Aprimoramento: ${brutalityEnhancement.name}`,
    img: `${brutalityEnhancement.icon}`,
    duration: { startRound: 0, rounds: 99 },
    tint: "#FFDC00",
    changes: [
        {
            key: CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT.system,
            value: 3,
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            priority: 100
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: shattered1Id,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
        [ActiveEffectsFlags.REMOVE_EFFECTS]: [shattered2Id, shattered3Id],
        [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
    }
});

const shattered2 = ActiveEffectsUtils.createEffectData({
    id: shattered2Id,
    name: "S0.Efeito_Ativo.Destrocado2",
    origin: `Aprimoramento: ${brutalityEnhancement.name}`,
    img: `${brutalityEnhancement.icon}`,
    duration: { startRound: 0, rounds: 99 },
    tint: "#F07823",
    changes: [
        {
            key: CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT.system,
            value: 4,
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            priority: 200
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: shattered2Id,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
        [ActiveEffectsFlags.REMOVE_EFFECTS]: [shattered1Id, shattered3Id],
        [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
    }
});

const shattered3 = ActiveEffectsUtils.createEffectData({
    id: shattered3Id,
    name: "S0.Efeito_Ativo.Destrocado3",
    origin: `Aprimoramento: ${brutalityEnhancement.name}`,
    img: `${brutalityEnhancement.icon}`,
    duration: { startRound: 0, rounds: 99 },
    tint: "#F00A0A",
    changes: [
        {
            key: CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT.system,
            value: 5,
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            priority: 300
        },
    ],
    flags: {
        [ActiveEffectsFlags.ORIGIN_ID]: shattered3Id,
        [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
        [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
        [ActiveEffectsFlags.REMOVE_EFFECTS]: [shattered1Id, shattered2Id],
        [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
    }
});

export const shatteredActiveEffects = [shattered1, shattered2, shattered3];
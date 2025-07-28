import { localize } from "../utils/utils.mjs";

export const ActiveEffectsOriginTypes = Object.freeze({
    ITEM: 1,
    ENHANCEMENT: 2,
    TRAIT: 3,
    OTHER: 4,
    AFFECTED_ENHANCEMENT: 5,
});

export function activeEffectOriginTypeLabel(type) {
    const map = {
        [ActiveEffectsOriginTypes.ITEM]: localize('Item'),
        [ActiveEffectsOriginTypes.ENHANCEMENT]: localize('Aprimoramento.Nome'),
        [ActiveEffectsOriginTypes.TRAIT]: localize('Traco'),
        [ActiveEffectsOriginTypes.OTHER]: localize('Outro'),
        [ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT]: localize('Aprimoramento.Afetado_Aprimoramento'),
    }

    return map[type] || `<${localize('Erro')}>`;
}

export const ActiveEffectsTypes = Object.freeze({
    BUFF: 'Buff',
    DEBUFF: 'Debuff',
});

export const ActiveEffectsFlags = Object.freeze({
    ORIGIN_ID: 'originId',
    ORIGIN_TYPE: 'originType',
    ORIGIN_TYPE_LABEL: 'originTypeLabel',
    TYPE: 'type',
    ALWAYS_SHOW_ON_TOKEN: 'alwaysShowOnToken',
    REMOVE_EFFECTS: 'removeEffects',
    COMBAT_ID: 'combatId',
    IS_PASSIVE: 'isPassve',
});
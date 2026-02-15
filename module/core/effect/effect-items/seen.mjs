import { COLORS, ICONS_PATH } from "../../../constants.mjs";
import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../enums/active-effects-enums.mjs";
import { EffectChangeValueType } from "../../../enums/enhancement-enums.mjs";
import { invisibilityEnhancement } from "../../enhancement/enhancement-items/invisibility.mjs";
import { ActiveEffectsUtils } from "../active-effects-utils.mjs";

const id = 'percebido';
const seen = ActiveEffectsUtils.createEffectData({
  id: id,
  name: "Percebido",
  origin: `Aprimoramento: ${invisibilityEnhancement.name}`,
  img: `${ICONS_PATH}/invisibility.svg`,
  duration: { startRound: 0, rounds: 99 },
  tint: COLORS.BASE.yellow,
  changes: [
    {
      key: ActiveEffectsUtils.KEYS.TINT_TOKEN,
      mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
      value: "#55C8FA",
      otherValue: "#55C8FA",
      typeOfValue: EffectChangeValueType.OTHER_VALUE,
      priority: 20
    },
  ],
  flags: {
    [ActiveEffectsFlags.ORIGIN_ID]: id,
    [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
    [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.BUFF,
    [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: false,
  }
});

export const seendActiveEffect = seen;
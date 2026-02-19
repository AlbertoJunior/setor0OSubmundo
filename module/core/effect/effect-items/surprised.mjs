import { ICONS_PATH } from "../../../constants.mjs";
import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { ActiveEffectsUtils } from "../active-effects-utils.mjs";

const id = 'surpreendido';
const surprised = ActiveEffectsUtils.createEffectData({
  id: id,
  name: "Surpreendido",
  img: `${ICONS_PATH}/user-ninja.svg`,
  duration: { startRound: 0, rounds: 1 },
  changes: [
    {
      key: CharacteristicType.BONUS.PM.system,
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -99
    }
  ],
  flags: {
    [ActiveEffectsFlags.ORIGIN_ID]: id,
    [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.OTHER,
    [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.DEBUFF,
    [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: true,
  }
});

export const surprisedActiveEffect = surprised;
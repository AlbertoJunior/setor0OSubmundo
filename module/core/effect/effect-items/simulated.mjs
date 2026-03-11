import { StandardEffectChangeField } from "../../../data/field/effect-fields.mjs";
import { COLORS } from "../../../constants.mjs";
import { ActiveEffectsFlags, ActiveEffectsOriginTypes, ActiveEffectsTypes } from "../../../enums/active-effects-enums.mjs";
import { CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EffectChangeValueType } from "../../../enums/enhancement-enums.mjs";
import { assimilationEnhancement } from "../../enhancement/enhancement-items/assimilation.mjs";
import { ActiveEffectsUtils } from "../active-effects-utils.mjs";

const id = 'cena_simulada';
const simulated = ActiveEffectsUtils.createEffectData({
  id: id,
  name: "Cena Simulada",
  origin: `Aprimoramento: ${assimilationEnhancement.name}`,
  img: `${assimilationEnhancement.icon}`,
  duration: { startRound: 0, rounds: 99 },
  tint: COLORS.BASE.yellow,
  changes: [
    StandardEffectChangeField.toJson({
      key: CharacteristicType.BONUS.ATTRIBUTES.INTELLIGENCE.system,
      value: 0,
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL
    }),
  ],
  flags: {
    [ActiveEffectsFlags.ORIGIN_ID]: id,
    [ActiveEffectsFlags.ORIGIN_TYPE]: ActiveEffectsOriginTypes.AFFECTED_ENHANCEMENT,
    [ActiveEffectsFlags.TYPE]: ActiveEffectsTypes.BUFF,
    [ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN]: false,
  }
});

export const simulatedActiveEffect = simulated;
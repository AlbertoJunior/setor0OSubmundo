import { SystemFlags } from "../../module/enums/flags-enums.mjs";
import { ChatCreator } from "../../module/utils/chat-creator.mjs";
import { FlagsUtils } from "../../module/utils/flags-utils.mjs";
import { localize } from "../utils/utils.mjs";

const parsedModes = [];

function rollModes() {
  if (parsedModes.length > 0) {
    return parsedModes;
  }

  const mappedLabel = {
    [ChatCreator.MODE_BLIND]: localize('Rolagem_GM_Oculta'),
    [ChatCreator.MODE_PRIVATE_TO_GM]: localize('Rolagem_Privada_GM'),
    [ChatCreator.MODE_PUBLIC]: localize('Rolagem_Publica'),
    [ChatCreator.MODE_SELF]: localize('Rolagem_Pessoal'),
  }

  const mappedModes = Object.values(CONST.DICE_ROLL_MODES).map(roll => {
    return {
      value: roll,
      label: mappedLabel[roll] || 'erro'
    }
  });

  parsedModes.push(...mappedModes);
  return parsedModes;
}

export default function gameFunc(func) {
  const funcMap = {
    isGm: () => game.user.isGM,
    isOwner: () => game.user.isOwner,
    inDarkMode: () => FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK),
    isCompactedSheet: () => FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT),
    'players-roll-mode': () => {
      return rollModes().filter(mode => mode.value != ChatCreator.MODE_SELF);
    },
    'gm-roll-mode': () => {
      return rollModes().filter(mode => mode.value == ChatCreator.MODE_SELF);
    }
  };

  return funcMap[func]?.() || false;
}
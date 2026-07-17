import { ICONS_PATH, SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const openRollMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '5',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.USER,
    }
  },
  name: "Fazer Rolagem",
  ownership: {
    default: CONST.USER_ROLES.PLAYER
  },
  command: `
${verifyAndReturnSelectedToken}
${verifyAndReturnActor}
await globalThis.${SYSTEM_ID}.MacroMethods.rollDialog(actor);
`,
  img: `${ICONS_PATH}/d10.webp`,
  type: "script"
}

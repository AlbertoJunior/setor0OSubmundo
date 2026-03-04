import { ICONS_PATH, SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const openRollMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '5',
      [SYSTEM_FLAGS.ROLE]: 'user',
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

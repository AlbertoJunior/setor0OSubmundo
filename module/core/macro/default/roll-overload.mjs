import { ICONS_PATH, SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const rollOverloadMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '3',
      [SYSTEM_FLAGS.ROLE]: 'user',
    }
  },
  name: "Teste de Sobrecarga",
  ownership: {
    default: CONST.USER_ROLES.PLAYER
  },
  command: `
${verifyAndReturnSelectedToken}
${verifyAndReturnActor}
await globalThis.${SYSTEM_ID}.MacroMethods.overload(actor);
`,
  img: `${ICONS_PATH}/s10.webp`,
  type: "script"
}
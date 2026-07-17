import { ICONS_PATH, SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const rollOverloadMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '3',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.USER,
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
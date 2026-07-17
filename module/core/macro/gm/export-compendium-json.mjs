import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";

export const exportCompendiunsMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '1004',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.GM,
    }
  },
  name: "Exportar compendiuns",
  img: "icons/svg/explosion.svg",
  type: "script",
  command: `await globalThis.${SYSTEM_ID}.MacroMethods.exportCompendium()`,
}
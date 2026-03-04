import { SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";

export const exportCompendiunsMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '1004',
      [SYSTEM_FLAGS.ROLE]: SYSTEM_FLAGS.ROLE_GM,
    }
  },
  name: "Exportar compendiuns",
  img: "icons/svg/explosion.svg",
  type: "script",
  command: `await globalThis.${SYSTEM_ID}.MacroMethods.exportCompendium()`,
}
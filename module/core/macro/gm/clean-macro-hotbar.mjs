import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";

export const cleanMacroHotbarUserMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '1001',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.GM,
    }
  },
  name: "Limpar Hotbar",
  img: "icons/svg/explosion.svg",
  type: "script",
  command: `
const user = game.user;
const hotbar = user.hotbar;

let updated = false;

for (const [slot, macroId] of Object.entries(hotbar)) {
  const macro = game.macros.get(macroId);
  if (!macro) {
    await user.assignHotbarMacro(null, Number(slot));
    updated = true;
  }
}

if (updated) {
  ui.notifications.info("Hotbar limpa: macros inválidas removidas.");
} else {
  ui.notifications.info("Nenhuma macro inválida encontrada na hotbar.");
}
`,
}
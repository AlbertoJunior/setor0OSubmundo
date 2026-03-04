import { SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";

export const cleanMacroHotbarUserMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '1001',
      [SYSTEM_FLAGS.ROLE]: SYSTEM_FLAGS.ROLE_GM,
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
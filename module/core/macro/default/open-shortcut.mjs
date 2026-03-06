import { SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const openShortcutMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '2',
      [SYSTEM_FLAGS.ROLE]: SYSTEM_FLAGS.ROLE_USER,
    }
  },
  name: "Abrir Atalhos",
  ownership: {
    default: CONST.USER_ROLES.PLAYER
  },
  command: `
${verifyAndReturnSelectedToken}
${verifyAndReturnActor}
actor.sheet.render(true);
setTimeout(() => {
  const targetPage = actor.system.nucleo > 0 ? 7 : 6;
  if (actor.sheet.currentPage !== undefined) {
    actor.sheet.currentPage = targetPage;
    actor.sheet.render(false);
  } else {
    ui.notifications.warn("Esta ficha não suporta navegação por página.");
  }
}, 50);
`,
  img: "icons/svg/book.svg",
  type: "script"
}
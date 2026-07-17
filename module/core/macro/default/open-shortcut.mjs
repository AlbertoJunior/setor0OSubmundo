import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const openShortcutMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '2',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.USER,
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
  const coreLevel = setor0OSubmundo.Utils.getObject(actor, setor0OSubmundo.Enums.CharacteristicType.CORE) || 0;
  const targetPage = coreLevel > 0 ? 7 : 6;
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
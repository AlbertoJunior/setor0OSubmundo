import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const openBagMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '1',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.USER,
    }
  },
  name: "Abrir Mochila",
  ownership: {
    default: CONST.USER_ROLES.PLAYER
  },
  command: `
${verifyAndReturnSelectedToken.trim()}
${verifyAndReturnActor.trim()}
actor.sheet.render(true);
setTimeout(() => {
  const coreLevel = setor0OSubmundo.Utils.getObject(actor, setor0OSubmundo.Enums.CharacteristicType.CORE) || 0;
  const targetPage = coreLevel > 0 ? 4 : 3;
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
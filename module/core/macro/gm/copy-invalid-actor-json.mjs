import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";

export const getInvalidActorJsonMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '1002',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.GM,
    }
  },
  name: "Pegar Json de Ator com erro",
  ownership: {
    default: CONST.USER_ROLES.GAMEMASTER
  },
  img: "icons/svg/explosion.svg",
  type: "script",
  command: `
const invalidIds = game.actors.invalidDocumentIds;
const invalidActors = game.actors._source.filter(actor => invalidIds.has(actor._id));

if (invalidActors.length > 0) {
    await navigator.clipboard.writeText(JSON.stringify(raw, null, 2));
    ui.notifications.info("Dados do ator ${raw.name || "sem nome"} copiados para a área de transferência.");
    console.log("-> Dados do ator ${raw.name || "sem nome"} copiados para a área de transferência.");
} else {
    ui.notifications.info("Nenhum actor corrompido");
    console.log("-> Nenhum actor corrompido");
}
`,
}

import { ICONS_PATH, SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "../commands/macro-utils-commands.mjs";

export const seeArtWorkMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '4',
      [SYSTEM_FLAGS.ROLE]: 'user',
    }
  },
  name: "Ver arte do Personagem",
  ownership: {
    default: CONST.USER_ROLES.PLAYER
  },
  command: `
${verifyAndReturnSelectedToken}
${verifyAndReturnActor}

new foundry.applications.apps.ImagePopout({
  src:actor.img,
  window: { title: "Arte de ${actor.name}" },
  shareable: true,
  uuid: actor.uuid
}).render(true);
`,
  img: `${ICONS_PATH}/overload.svg`,
  type: "script"
}
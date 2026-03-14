import { SYSTEM_ID } from "../../../constants.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";

export const resetUserFlagsMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SystemFlags.SOURCE.ID]: '1000',
      [SystemFlags.ROLE.ROLE]: SystemFlags.ROLE.GM,
    }
  },
  name: "Resetar Flags",
  img: "icons/svg/explosion.svg",
  type: "script",
  command: `
  const namespace = 'setor0OSubmundo';
  const user = game.user;
  const flags = foundry.utils.getProperty(user.flags, namespace);

  if (!flags) {
  ui.notifications.info("Nenhuma flag encontrada para este usuário.");
  } else {
  for (const key of Object.keys(flags)) {
  await user.unsetFlag(namespace, key);
  }
  ui.notifications.info("Flags resetadas com sucesso.");
  }
  `,
}
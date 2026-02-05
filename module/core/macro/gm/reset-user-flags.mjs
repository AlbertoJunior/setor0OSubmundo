import { SYSTEM_FLAGS, SYSTEM_ID } from "../../../constants.mjs";

export const resetUserFlagsMacroData = {
  flags: {
    [SYSTEM_ID]: {
      [SYSTEM_FLAGS.SOURCE_ID]: '1000',
      [SYSTEM_FLAGS.ROLE]: 'gm',
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
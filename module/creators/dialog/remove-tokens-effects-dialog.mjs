import { ActiveEffectsUtils } from "../../core/effect/active-effects-utils.mjs";
import { NotificationsUtils } from "../message/notifications.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { localize, localizeFormat } from "../../utils/utils.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";

export class RemoveTokensEffectsDialog {
  static async open(tokens = []) {
    if (tokens.length === 0) {
      NotificationsUtils.warning(localize('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.No_Tokens_Selected'));
      return;
    }

    const content = await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/others/remove-tokens-effects-dialog.hbs`, { qtd: tokens.length });

    FoundryApi.createDialog({
      title: localize('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Title'),
      content: content,
      classes: ['S0-max-width-50'],
      buttons: [
        {
          label: localize('Cancelar')
        },
        {
          label: localize('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Remove_Simple'),
          onClick: async () => {
            for (const token of tokens) {
              if (token.actor) {
                await ActiveEffectsUtils.removeAllRemovableActorEffects(token.actor);
              }
            }
            NotificationsUtils.success(localizeFormat('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Removed_Simple_Success', { qtd: tokens.length }));
          }
        },
        {
          label: localize('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Remove_All'),
          class: ['S0-button-delete'],
          onClick: async () => {
            for (const token of tokens) {
              if (token.actor) {
                await ActiveEffectsUtils.removeAllActorEffects(token.actor);
              }
            }
            NotificationsUtils.success(localizeFormat('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Removed_All_Success', { qtd: tokens.length }));
          }
        }
      ]
    }, { width: 450 });
  }
}

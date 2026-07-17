import { FoundryApi } from "../../api/foundry-api.mjs";

export function configureSetor0TooltipManager() {
  CONFIG.ux.TooltipManager = Setor0TooltipManager;
}

export class Setor0TooltipManager extends FoundryApi.TooltipManager {
  /**
   * Constante sobrescrita para refletir localmente o tempo de espera do tooltip na UI.
   * Valor nativo é 500ms.
   * @type {number}
   */
  static TOOLTIP_ACTIVATION_MS = 100;

  static applyActivationDelay() {
    if (game?.tooltip?.constructor) {
      game.tooltip.constructor.TOOLTIP_ACTIVATION_MS = this.TOOLTIP_ACTIVATION_MS;
    } else if (foundry?.helpers?.interaction?.TooltipManager) {
      foundry.helpers.interaction.TooltipManager.TOOLTIP_ACTIVATION_MS = this.TOOLTIP_ACTIVATION_MS;
    } else if (globalThis.TooltipManager) {
      globalThis.TooltipManager.TOOLTIP_ACTIVATION_MS = this.TOOLTIP_ACTIVATION_MS;
    }
  }
}

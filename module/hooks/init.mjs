import { loadHandlebarsHelpers } from "../setup/handlerbars-helper.mjs";
import { createDataModels } from "../setup/models.mjs";
import { Setor0Settings } from "../setup/settings.mjs";
import { registerTemplates } from "../setup/templates.mjs";
import { configureSetor0Combat } from "../base/document/Setor0Combat.mjs";
import { configureSetor0Combatant } from "../base/document/Setor0Combatant.mjs";
import { configureSetor0CombatTracker } from "../base/document/Setor0CombatTracker.mjs";
import { configureSetor0TokenDocument } from "../base/document/Setor0TokenDocument.mjs";
import { configureSetor0Item } from "../base/document/Setor0Item.mjs";
import { configureSetor0TooltipManager } from "../base/ui/Setor0TooltipManager.mjs";
import { DEFAULT_VALUES, SYSTEM_HOOKS, SYSTEM_ID } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { MacroUtils } from "../core/macro/macro-utils.mjs";
import { configureSetor0ActiveEffect } from "../base/document/Setor0ActiveEffect.mjs";
import { TokenUtils } from "../core/token/token-utils.mjs";
import { configureSetor0ChatLog } from "../core/chat/Setor0ChatLog.mjs";
import { PreCreateItemHookHandle } from "./item/pre-create-item.mjs";

export class InitHookHandle {
  static async handle() {
    console.log('=> Setor 0 - Inicializando sistema');

    this.#presetGlobalSystemConfigs();

    // Models
    await createDataModels();

    // Documents
    configureSetor0Combat();
    configureSetor0Combatant();
    configureSetor0CombatTracker();
    configureSetor0TokenDocument();
    configureSetor0ActiveEffect();
    configureSetor0ChatLog();
    configureSetor0Item();

    // UI
    configureSetor0TooltipManager();

    // SETUP
    await loadHandlebarsHelpers();
    await registerTemplates();
    await PreCreateItemHookHandle.validateDefaultIcons();

    // GM HOOKS
    if (game.user?.isGM) {
      Hooks.callAll(SYSTEM_HOOKS.GM_INIT);
    }
  }

  static #presetGlobalSystemConfigs() {
    // CONFIG.debug.hooks = true;

    globalThis[SYSTEM_ID] = {
      MacroMethods: MacroUtils.MacroMethods,
      FoundryApi: FoundryApi,
      TokenUtils: TokenUtils,
      DEFAULT_VALUES: DEFAULT_VALUES
    };
    Setor0Settings.register();
  }
}
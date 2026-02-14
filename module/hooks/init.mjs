import { createDataModels } from "../utils/models.mjs";
import { configureSetor0Combat } from "../base/sheet/combat/Setor0Combat.mjs";
import { configureSetor0Combatant } from "../base/sheet/combat/Setor0Combatant.mjs";
import { configureSetor0CombatTracker } from "../base/sheet/combat/Setor0CombatTracker.mjs";
import { configureSetor0TokenDocument } from "../core/token/Setor0TokenDocument.mjs";
import { loadHandlebarsHelpers } from "../utils/handlerbars-helper.mjs";
import { registerTemplates } from "../utils/templates.mjs";
import { SYSTEM_ID } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { MacroUtils } from "../core/macro/macro-utils.mjs";
import { configureSetor0ActiveEffect } from "../core/effect/Setor0ActiveEffect.mjs";
import { TokenUtils } from "../core/token/token-utils.mjs";
import { ActiveEffectHookHandle } from "./active-effects.mjs";
import { configureSetor0ChatLog } from "../core/chat/Setor0ChatLog.mjs";

export class InitHookHandle {
    static async handle() {
        console.log('-> Setor 0 - O Submundo | Inicializando sistema');

        this.#presetGlobalSystemConfigs();

        await createDataModels();

        configureSetor0Combat();
        configureSetor0Combatant();
        configureSetor0CombatTracker();
        configureSetor0TokenDocument();
        configureSetor0ActiveEffect();
        configureSetor0ChatLog();

        await loadHandlebarsHelpers();
        await registerTemplates();

        ActiveEffectHookHandle.register();
    }

    static #presetGlobalSystemConfigs() {
        globalThis[SYSTEM_ID] = {
            MacroMethods: MacroUtils.MacroMethods,
            FoundryApi: FoundryApi,
            TokenUtils: TokenUtils,
        };
        //CONFIG.debug.hooks = true;
    }
}
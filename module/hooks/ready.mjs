import { SceneHookHandle } from "./scene.mjs";
import { OscillatingTintManager } from "../core/effect/oscilating-effect-manager.mjs";
import { RepositoriesUtils } from "../utils/repositories.mjs";
import { ActiveEffectRepository } from "../repository/active-effects-repository.mjs";
import { MacroSync } from "../core/macro/macro-sync.mjs";
import { MacroInstaller } from "../core/macro/macro-installer.mjs";
import { registerEquipment } from "../base/sheet/equipment/equipment-sheet.mjs";
import { registerActor } from "../base/sheet/actor/player/actor-sheet.mjs";
import { registerNpc } from "../base/sheet/actor/npc/npc-sheet.mjs";

export class ReadyHookHandle {
    static async handle() {
        await this.#repositories();
        await this.#sheets();
        await this.#macro();

        this.#effects();

        await SceneHookHandle.register();

        if (!game.user.isGM) {
            console.log('-> Setor 0 - O Submundo | Sistema Pronto');
            return;
        }

        this.#loadOnlyForGm();
    }

    static async #repositories() {
        await RepositoriesUtils.loadFromPackages();
        await RepositoriesUtils.loadFromGame();
    }

    static async #sheets() {
        await registerEquipment();
        await registerActor();
        await registerNpc();
    }

    static #effects() {
        if (game.user.isGM) {
            CONFIG.statusEffects = ActiveEffectRepository.getItems();
        } else {
            CONFIG.statusEffects = [];
        }
    }

    static async #macro() {
        await MacroSync.verifyDefaultMacroCompendium();
        await MacroInstaller.installDefaultMacrosOnUser();
    }

    static async #loadOnlyForGm() {
        await MacroInstaller.installDefaultMacrosOnGm();

        OscillatingTintManager.verifyOscilatingTokens();
        console.log('-> Setor 0 - O Submundo | Sistema Pronto');
    }
}
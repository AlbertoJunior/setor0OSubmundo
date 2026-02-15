import { OscillatingTintManager } from "../core/effect/oscilating-effect-manager.mjs";
import { RepositoriesUtils } from "../utils/repositories.mjs";
import { ActiveEffectRepository } from "../repository/active-effects-repository.mjs";
import { MacroSync } from "../core/macro/macro-sync.mjs";
import { MacroInstaller } from "../core/macro/macro-installer.mjs";
import { registerEquipment } from "../base/sheet/equipment/equipment-sheet.mjs";
import { registerActor } from "../base/sheet/actor/player/actor-sheet.mjs";
import { registerNpc } from "../base/sheet/actor/npc/npc-sheet.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { CompendiumSync } from "../core/pack/compendium-sync.mjs";

export class ReadyHookHandle {
  static async handle() {
    await this.#repositories();
    await this.#sheets();
    await this.#macro();
    FoundryApi.Versions.current.TooltipManager.TOOLTIP_ACTIVATION_MS = 200;
    this.#effects();
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
    CONFIG.statusEffects = game.user.isGM ? ActiveEffectRepository.getItems() : [];
  }

  static async #macro() {
    await MacroSync.verifyDefaultMacroCompendium();
    await MacroInstaller.installDefaultMacrosOnUser();
  }

  static async #loadOnlyForGm() {
    if (!game.user.isGM) {
      console.log('-> Setor 0 - O Submundo | Sistema Pronto');
      return;
    }

    await MacroInstaller.installDefaultMacrosOnGm();
    await CompendiumSync.syncDefaultCompendiums();

    OscillatingTintManager.verifyOscilatingTokens();
    console.log('-> Setor 0 - O Submundo | Sistema Pronto');
  }
}
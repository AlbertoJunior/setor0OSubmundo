import { RepositoriesUtils } from "../setup/repositories.mjs";
import { MigrationHandler } from "../migration/migration-handler.mjs";
import { ActiveEffectRepository } from "../repository/active-effects-repository.mjs";
import { MacroSync } from "../core/macro/macro-sync.mjs";
import { MacroInstaller } from "../core/macro/macro-installer.mjs";
import { registerEquipment } from "../base/sheet/equipment/equipment-sheet.mjs";
import { registerActor } from "../base/sheet/actor/player/actor-sheet.mjs";
import { registerNpc } from "../base/sheet/actor/npc/npc-sheet.mjs";
import { registerTrait } from "../base/sheet/trait/trait-sheet.mjs";
import { registerManeuver } from "../base/sheet/maneuver/maneuver-sheet.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { CompendiumSync } from "../core/pack/compendium-sync.mjs";
import { Setor0TooltipManager } from "../base/ui/Setor0TooltipManager.mjs";
import { ConfigDefaults } from "../setup/config-defaults.mjs";
import { SYSTEM_HOOKS } from "../constants.mjs";
import { SocketHandler } from "../core/socket/socket-handler.mjs";

export class ReadyHookHandle {
  static async handle() {
    Setor0TooltipManager.applyActivationDelay();
    await this.#repositories();
    await this.#sheets();
    await this.#macro();
    await this.#config();
    this.#effects();
    SocketHandler.init();

    if (!game.user.isGM) {
      console.log('=> Setor 0 - O Submundo | Sistema Pronto');
      return;
    }
    await this.#loadOnlyForGm();
  }

  static async #repositories() {
    await RepositoriesUtils.loadFromPackages();
    await RepositoriesUtils.loadFromGame();
  }

  static async #sheets() {
    await FoundryApi.Items.unregisterSheet("core", FoundryApi.ItemSheet);
    await FoundryApi.Actors.unregisterSheet("core", FoundryApi.ActorSheet);

    await registerEquipment();
    await registerActor();
    await registerNpc();
    await registerTrait();
    await registerManeuver();
  }

  static #effects() {
    CONFIG.statusEffects = game.user.isGM ? ActiveEffectRepository.getItems() : [];
  }

  static async #macro() {
    await MacroSync.verifyDefaultMacroCompendium();
    await MacroInstaller.installDefaultMacrosOnUser();
  }

  static async #config() {
    await ConfigDefaults.enforceReadyDefaults();
  }

  static async #loadOnlyForGm() {
    await MacroInstaller.installDefaultMacrosOnGm();
    await CompendiumSync.syncDefaultCompendiums();
    await MigrationHandler.runMigrations();

    Hooks.callAll(SYSTEM_HOOKS.GM_READY);
    console.log('=> Setor 0 - O Submundo | Sistema Pronto');
  }
}
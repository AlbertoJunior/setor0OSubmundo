import { FoundryApi } from "../api/foundry-api.mjs";
import { SYSTEM_ID } from "../constants.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";

export class ConfigDefaults {

  static async enforceReadyDefaults() {
    await this.#enforceCombatTrackerDefaults();
    await this.#enforceInitialDarkMode();
    await this.#enforceLanguageSettings();
  }

  static async #enforceInitialDarkMode() {
    if (game.user.getFlag(SYSTEM_ID, SystemFlags.MODE.DARK) === undefined) {
      await game.user.setFlag(SYSTEM_ID, SystemFlags.MODE.DARK, true);
    }
  }

  static async #enforceCombatTrackerDefaults() {
    if (!game.user.isGM) return;

    const trackerInit = game.settings.get(SYSTEM_ID, SystemFlags.COMBAT.TRACKER_INITIALIZED);
    if (!trackerInit) {
      // Foundry V13 native core setting to disable combat turn marker
      try {
        if (game.settings.settings.has("core.combatTrackerConfig")) {
          const config = game.settings.get("core", "combatTrackerConfig") ?? {};
          const newConfig = FoundryApi.mergeObject(
            config,
            {
              resource: "actualVitality",
              skipDefeated: true,
              turnMarker: {
                enabled: true,
                src: "systems/setor0OSubmundo/imgs/setor0_ring.webp"
              }
            }
          );
          await game.settings.set("core", "combatTrackerConfig", newConfig);
        }
      } catch (e) {
        console.warn(`=> ${SYSTEM_ID} | Falha ao configurar combat tracker:`, e);
      }
      await game.settings.set(SYSTEM_ID, SystemFlags.COMBAT.TRACKER_INITIALIZED, true);
    }
  }

  static async #enforceLanguageSettings() {
    if (game.user.isGM) {
      await this.#syncWorldLanguageFromGM();
    } else {
      await this.#syncPlayerLanguageFromWorld();
    }
  }

  static async #syncWorldLanguageFromGM() {
    const currentGMLang = game.settings.get("core", "language");
    const worldLang = game.settings.get(SYSTEM_ID, SystemFlags.WORLD.DEFAULT_LANGUAGE);
    if (currentGMLang !== worldLang) {
      await game.settings.set(SYSTEM_ID, SystemFlags.WORLD.DEFAULT_LANGUAGE, currentGMLang);
    }
  }

  static async #syncPlayerLanguageFromWorld() {
    const hasChosenLanguage = game.user.getFlag(SYSTEM_ID, SystemFlags.LANGUAGE.SET_BY_USER);
    if (!hasChosenLanguage) {
      const worldLang = game.settings.get(SYSTEM_ID, SystemFlags.WORLD.DEFAULT_LANGUAGE);
      const currentLang = game.settings.get("core", "language");

      if (currentLang !== worldLang) {
        await game.settings.set("core", "language", worldLang);
        await game.user.setFlag(SYSTEM_ID, SystemFlags.LANGUAGE.SET_BY_USER, true);
        ui.notifications.info("Language automatically set to World Default. Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  }

  /**
   * Captures any manual change a player makes to their own language and persists the flag.
   * This ensures the player's choice is respected permanently.
   */
  static async onPlayerLanguageChange(setting, value) {
    if (setting === "core.language" && !game.user.isGM) {
      await game.user.setFlag(SYSTEM_ID, SystemFlags.LANGUAGE.SET_BY_USER, true);
    }
  }

  static enforceSceneCreationDefaults(scene, data, options, userId) {
    if (game.user.id !== userId) return;

    scene.updateSource({
      "grid.type": CONST.GRID_TYPES?.GRIDLESS ?? 0,
      "grid.distance": 1,
      "grid.units": "PM",
      "fog.exploration": false,
      padding: 0.0,
      tokenVision: false,
    });
  }

  static enforceTokenCreationDefaults(token, data, options, userId) {
    if (game.user.id !== userId) return;
    const parentScene = token.parent;
    if (!parentScene) return;

    const updates = {};
    const gridType = parentScene.grid?.type ?? parentScene.gridType;

    if (gridType === (CONST.GRID_TYPES?.GRIDLESS ?? 0)) {
      updates["shape"] = CONST.TOKEN_SHAPES.ELLIPSE_1;
    }

    if (parentScene.tokenVision) {
      updates["sight.enabled"] = true;
      updates["sight.range"] = 6;
      updates["sight.angle"] = 160;
    }

    if (Object.keys(updates).length > 0) {
      token.updateSource(updates);
    }
  }
}

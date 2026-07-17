import { SYSTEM_ID } from "../constants.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";

export class Setor0Settings {
  static register() {
    game.settings.register(SYSTEM_ID, SystemFlags.MIGRATION.VERSION, {
      name: "System Migration Version",
      hint: "Tracks the latest system version that ran local data migrations.",
      scope: "world",
      config: false,
      type: String,
      default: "0.0.0"
    });

    game.settings.register(SYSTEM_ID, SystemFlags.WORLD.DEFAULT_LANGUAGE, {
      name: "World Default Language",
      hint: "Stores the GM's preferred language to distribute to new players.",
      scope: "world",
      config: false,
      type: String,
      default: "pt-br"
    });

    game.settings.register(SYSTEM_ID, SystemFlags.COMBAT.TRACKER_INITIALIZED, {
      name: "Combat Tracker Initialized",
      hint: "Ensures the combat tracker is disabled by default only 1x per world.",
      scope: "world",
      config: false,
      type: Boolean,
      default: false
    });
  }
}
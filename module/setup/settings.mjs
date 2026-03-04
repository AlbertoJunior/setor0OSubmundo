import { SYSTEM_ID } from "../constants.mjs";

export class Setor0Settings {
  static register() {
    game.settings.register(SYSTEM_ID, "systemMigrationVersion", {
      name: "System Migration Version",
      hint: "Tracks the latest system version that ran local data migrations.",
      scope: "world",
      config: false,
      type: String,
      default: "0.0.0"
    });
  }
}
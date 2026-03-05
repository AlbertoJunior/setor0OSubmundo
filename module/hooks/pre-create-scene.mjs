import { ConfigDefaults } from "../setup/config-defaults.mjs";

export class PreCreateSceneHookHandle {
  static handle(scene, data, options, userId) {
    ConfigDefaults.enforceSceneCreationDefaults(scene, data, options, userId);
  }
}

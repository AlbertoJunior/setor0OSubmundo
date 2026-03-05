import { ConfigDefaults } from "../setup/config-defaults.mjs";

export class PreCreateTokenHookHandle {
  static handle(token, data, options, userId) {
    ConfigDefaults.enforceTokenCreationDefaults(token, data, options, userId);
  }
}

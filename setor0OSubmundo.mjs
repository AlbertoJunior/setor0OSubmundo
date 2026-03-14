import { InitHookHandle } from "./module/hooks/init.mjs";
import { ReadyHookHandle } from "./module/hooks/ready.mjs";
import { CreateCombatHookHandle } from "./module/hooks/create-combat.mjs";
import { UpdateActorHookHandle } from "./module/hooks/update-actor.mjs";
import { SceneControlButtonsHookHandle } from "./module/hooks/scene-control-buttons.mjs";
import { CreateItemHookHandle } from "./module/hooks/item/create-item.mjs";
import { PreCreateItemHookHandle } from "./module/hooks/item/pre-create-item.mjs";
import { PreCreateSceneHookHandle } from "./module/hooks/pre-create-scene.mjs";
import { ConfigDefaults } from "./module/setup/config-defaults.mjs";
import { CreateActiveEffectHookHandle } from "./module/hooks/active-effects/create-active-effect.mjs";
import { DeleteActiveEffectHookHandle } from "./module/hooks/active-effects/delete-active-effect.mjs";
import { SYSTEM_HOOKS } from "./module/constants.mjs";
import { PreCreateTokenHookHandle } from "./module/hooks/token/pre-create-token.mjs";
import { CreateTokenHookHandle } from "./module/hooks/token/create-token.mjs";
import { UpdateTokenHookHandle } from "./module/hooks/token/update-token.mjs";
import { OscillatingTintManager } from "./module/core/effect/oscilating-effect-manager.mjs";

// Life Cycle
Hooks.once('init', async () => {
  await InitHookHandle.handle();
});

Hooks.once('ready', async () => {
  await ReadyHookHandle.handle();
});

// GM Hooks
Hooks.once(SYSTEM_HOOKS.GM_INIT, () => {
  Hooks.callAll(SYSTEM_HOOKS.GM_REGISTER_MIGRATIONS);
  Hooks.on("createActiveEffect", (effect, options, userId) => {
    CreateActiveEffectHookHandle.handle(effect, options, userId);
  });

  Hooks.on("deleteActiveEffect", (effect, options, userId) => {
    DeleteActiveEffectHookHandle.handle(effect, options, userId);
  });

  Hooks.on('createToken', (token) => {
    CreateTokenHookHandle.handle(token);
  });
});

Hooks.once(SYSTEM_HOOKS.GM_READY, () => {
  OscillatingTintManager.verifyOscilatingTokens();
});

// Item
Hooks.on('preCreateItem', (item, data, options, userId) => {
  PreCreateItemHookHandle.handle(item, data, options, userId);
});

Hooks.on('createItem', (item) => {
  CreateItemHookHandle.handle(item);
});

// Combat
Hooks.on('createCombat', (combat) => {
  CreateCombatHookHandle.handle(combat);
});

// Actor
Hooks.on('updateActor', (updatedActor, changes, options, userId) => {
  UpdateActorHookHandle.handle(updatedActor, changes, options, userId);
});

// Scene
Hooks.on('getSceneControlButtons', (controls) => {
  SceneControlButtonsHookHandle.handle(controls);
});

Hooks.on('preCreateScene', (scene, data, options, userId) => {
  PreCreateSceneHookHandle.handle(scene, data, options, userId);
});

// Token
Hooks.on('preCreateToken', (token, data, options, userId) => {
  PreCreateTokenHookHandle.handle(token, data, options, userId);
});

Hooks.on('updateToken', (updatedToken, changes, options, userId) => {
  UpdateTokenHookHandle.handle(updatedToken, changes, options, userId);
});

// Settings
Hooks.on('updateSetting', (setting, value) => {
  ConfigDefaults.onPlayerLanguageChange(setting.key, value);
});
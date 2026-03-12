import { InitHookHandle } from "./module/hooks/init.mjs";
import { ReadyHookHandle } from "./module/hooks/ready.mjs";
import { CreateItemHookHandle } from "./module/hooks/create-item.mjs";
import { CreateCombatHookHandle } from "./module/hooks/create-combat.mjs";
import { UpdateActorHookHandle } from "./module/hooks/update-actor.mjs";
import { UpdateTokenHookHandle } from "./module/hooks/update-token.mjs";
import { SceneControlButtonsHookHandle } from "./module/hooks/scene-control-buttons.mjs";
import { PreCreateItemHookHandle } from "./module/hooks/pre-create-item.mjs";
import { PreCreateSceneHookHandle } from "./module/hooks/pre-create-scene.mjs";
import { PreCreateTokenHookHandle } from "./module/hooks/pre-create-token.mjs";
import { ConfigDefaults } from "./module/setup/config-defaults.mjs";
import { ActiveEffectCreateHookHandle } from "./module/hooks/active-effects-create.mjs";
import { ActiveEffectDeleteHookHandle } from "./module/hooks/active-effects-delete.mjs";
import { SYSTEM_HOOKS } from "./module/constants.mjs";

// Life Cycle
Hooks.once('init', async function () {
  await InitHookHandle.handle();
});

Hooks.once('ready', async () => {
  await ReadyHookHandle.handle();
});

// GM Hooks
Hooks.once(SYSTEM_HOOKS.GM_INIT, async () => {
  Hooks.on("createActiveEffect", (effect, options, userId) => {
    ActiveEffectCreateHookHandle.handle(effect, options, userId);
  });

  Hooks.on("deleteActiveEffect", (effect, options, userId) => {
    ActiveEffectDeleteHookHandle.handle(effect, options, userId);
  });
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

Hooks.on('createToken', (data) => {
  console.log("create token")
});

Hooks.on('updateToken', (updatedToken, changes, options, userId) => {
  UpdateTokenHookHandle.handle(updatedToken, changes, options, userId);
});

// Settings
Hooks.on('updateSetting', (setting, value) => {
  ConfigDefaults.onPlayerLanguageChange(setting.key, value);
});
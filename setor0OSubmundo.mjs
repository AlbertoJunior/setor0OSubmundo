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

Hooks.once('init', async function () {
  await InitHookHandle.handle();
});

Hooks.once('ready', async () => {
  await ReadyHookHandle.handle();
});

Hooks.on('createItem', (item) => {
  CreateItemHookHandle.handle(item);
});

Hooks.on('preCreateItem', (item, data, options, userId) => {
  // PreCreateItemHookHandle.handle(item, data, options, userId);
});

Hooks.on('createCombat', (combat) => {
  CreateCombatHookHandle.handle(combat);
});

Hooks.on('updateActor', (updatedActor, changes, options, userId) => {
  UpdateActorHookHandle.handle(updatedActor, changes, options, userId);
});

Hooks.on('updateToken', (updatedToken, changes, options, userId) => {
  UpdateTokenHookHandle.handle(updatedToken, changes, options, userId);
});

Hooks.on('getSceneControlButtons', (controls) => {
  SceneControlButtonsHookHandle.handle(controls);
});

Hooks.on('preCreateScene', (scene, data, options, userId) => {
  PreCreateSceneHookHandle.handle(scene, data, options, userId);
});

Hooks.on('preCreateToken', (token, data, options, userId) => {
  PreCreateTokenHookHandle.handle(token, data, options, userId);
});

Hooks.on('updateSetting', (setting, value) => {
  ConfigDefaults.onPlayerLanguageChange(setting.key, value);
});
import { InitHookHandle } from "./module/hooks/init.mjs";
import { ReadyHookHandle } from "./module/hooks/ready.mjs";
import { CreateItemHookHandle } from "./module/hooks/create-item.mjs";
import { CreateCombatHookHandle } from "./module/hooks/create-combat.mjs";
import { UpdateActorHookHandle } from "./module/hooks/update-actor.mjs";
import { UpdateTokenHookHandle } from "./module/hooks/update-token.mjs";
import { SceneControlButtonsHookHandle } from "./module/hooks/scene-control-buttons.mjs";

Hooks.once('init', async function () {
  await InitHookHandle.handle();
});

Hooks.once('ready', async () => {
  await ReadyHookHandle.handle();
});

Hooks.on('createItem', (item) => {
  CreateItemHookHandle.handle(item);
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
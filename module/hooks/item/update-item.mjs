import { ManeuverItemHookHandle } from "./maneuver-item-hook-handle.mjs";

export class UpdateItemHookHandle {
  static async handle(item, changes, options, userId) {
    if (game.user.id !== userId) return;

    await ManeuverItemHookHandle.handleUpdate(item, changes);
  }
}

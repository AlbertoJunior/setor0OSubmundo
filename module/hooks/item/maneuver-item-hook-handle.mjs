import { TokenUtils } from "../../core/token/token-utils.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";

/**
 * Handler responsável por propagar alterações feitas em uma Manobra
 * de origem (Sidebar/Compêndio) para todas as cópias embutidas em fichas de atores.
 */
export class ManeuverItemHookHandle {
  /**
   * Verifica se o item atualizado é uma Manobra não-embutida (original).
   * Se for, propaga as mudanças para todos os atores que possuam
   * uma cópia com `flags.core.sourceId` apontando para ele.
   */
  static async handleUpdate(item, changes) {
    if (item.type !== ItemType.MANEUVER || item.isEmbedded) return;

    const isChangeSystem = !!changes.system;
    const isChangeName = !!(changes?.name && (changes?.name?.length ?? 0) > 0);
    if (!(isChangeSystem || isChangeName)) return;

    const sourceId = item.uuid;

    const actorTokens = TokenUtils.getCanvasActorTokens();
    const gameActors = game.actors.contents;
    const allActors = [...actorTokens, ...gameActors];

    for (const actor of allActors) {
      const maneuversToUpdate = actor.items.filter(i =>
        i.type === ItemType.MANEUVER && FlagsUtils.getItemFlag(i, SystemFlags.SOURCE.ID) === sourceId
      );

      if (maneuversToUpdate.length === 0) continue;

      const updates = maneuversToUpdate.map(m => {
        const updateData = { _id: m.id };
        if (changes.system) updateData.system = { ...changes.system, [ManeuverType.IS_READ_ONLY.id]: true };
        if (changes.name) updateData.name = changes.name;
        if (changes.img) updateData.img = changes.img;
        return updateData;
      });

      await actor.updateEmbeddedDocuments("Item", updates);
    }
  }
}

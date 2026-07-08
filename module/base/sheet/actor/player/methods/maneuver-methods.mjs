import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { ItemType } from "../../../../../enums/item-type-enums.mjs";
import { RollManeuver } from "../../../../../core/actor/roll-maneuver.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";
import { localize } from "../../../../../utils/utils.mjs";

export const maneuverHandleEvents = {
  [OnEventType.ADD]: async (actor, event) => ManeuverHandleEvents.handleAdd(actor, event),
  [OnEventType.EDIT]: async (actor, event) => ManeuverHandleEvents.handleEdit(actor, event),
  [OnEventType.REMOVE]: async (actor, event) => ManeuverHandleEvents.handleRemove(actor, event),
  [OnEventType.VIEW]: async (actor, event) => ManeuverHandleEvents.handleView(actor, event),
  [OnEventType.ROLL]: async (actor, event) => ManeuverHandleEvents.handleRoll(actor, event),
}

class ManeuverHandleEvents {

  static async handleAdd(actor, event) {
    const itemData = {
      name: localize("Manobra.Manobra"),
      type: ItemType.MANEUVER
    };

    const [newItem] = await ActorUpdater.addDocuments(actor, [itemData]);
    if (newItem) newItem.sheet.render(true);
  }

  static async handleEdit(actor, event) {
    const itemId = event.currentTarget.dataset.itemId;
    const item = actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  static async handleRemove(actor, event) {
    const itemId = event.currentTarget.dataset.itemId;
    await ActorUpdater.removeDocuments(actor, [itemId]);
  }

  static async handleView(actor, event) {
    const dataset = event.currentTarget.dataset;
    const subCharacteristic = dataset.subCharacteristic;

    switch (subCharacteristic) {
      case 'original': {
        const sourceId = dataset.sourceId;
        if (!sourceId) return;
        const original = await fromUuid(sourceId);
        if (original) original.sheet.render(true, { editable: false });
        return;
      }
      default: {
        const itemId = dataset.itemId;
        if (itemId !== undefined) {
          const item = actor.items.get(itemId);
          if (item) item.sheet.render(true, { editable: false });
        } else {
          const minHeight = actor.sheet.defaultHeight;
          const container = event.currentTarget.parentElement.parentElement.querySelector(`#maneuvers-${actor.id}`);
          if (container) {
            const resultExpand = HtmlJsUtils.expandOrContractElement(container, { minHeight });
            HtmlJsUtils.flipClasses(event.currentTarget.children[0], 'fa-chevron-down', 'fa-chevron-up');
            actor.sheet.isExpandedManeuvers = resultExpand.isExpanded;
          }
        }
        return;
      }
    }
  }

  static async handleRoll(actor, event) {
    const itemId = event.currentTarget.dataset.itemId;
    const item = actor.items.get(itemId);
    if (item) {
      RollManeuver.roll(actor, item);
    }
  }
}

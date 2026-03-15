import { ActorRollDialog } from "../../../../../creators/dialog/actor-roll-dialog.mjs";
import { getObject, selectCharacteristic, } from "../../../../../utils/utils.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { handleStatusMethods } from "./status-methods.mjs";
import { handlerEquipmentEvents } from "./equipment-methods.mjs";
import { traitMethods } from "./trait-methods.mjs";
import { enhancementHandleMethods } from "./enhancement-methods.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { handlerShortcutEvents } from "./shortcut-methods.mjs";
import { menuHandleMethods } from "../../../../menu-default-methods.mjs";
import { alliesHandleEvents, informantsHandleEvents } from "./network-methods.mjs"
import { effectsHandleEvents } from "./effects-methods.mjs";
import { characteristicOnClick } from "./characteristics-methods.mjs";
import { handlerSpecialtyEvents } from "./specialty-methods.mjs";

export class SheetMethods {
  static handleMethods = {
    menu: {
      ...menuHandleMethods,
      [OnEventType.ROLL]: async (actor, event) => { ActorRollDialog.open(actor); },
    },
    language: {
      [OnEventType.ADD]: async (actor, event) => {
        if (!actor.sheet.isEditable) {
          return;
        }

        const element = event.target;
        selectCharacteristic(element);

        const parentElement = element.parentElement;
        const checked = Array.from(parentElement.children).some(el => el.classList.contains('S0-selected'));

        const updatedLanguages = getObject(actor, CharacteristicType.LANGUAGE);
        if (checked) {
          updatedLanguages.push(parentElement.id);
        } else {
          const indexToRemove = updatedLanguages.indexOf(parentElement.id);
          if (indexToRemove !== -1) {
            updatedLanguages.splice(indexToRemove, 1);
          }
        }

        await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.LANGUAGE, new Set(updatedLanguages))
      }
    },
    characteristic: {
      [OnEventType.CHARACTERISTIC]: async (actor, event) => {
        await characteristicOnClick(event, actor);
      }
    },
    trait: traitMethods,
    enhancement: enhancementHandleMethods,
    effects: effectsHandleEvents,
    temporary: handleStatusMethods,
    equipment: handlerEquipmentEvents,
    allies: alliesHandleEvents,
    informants: informantsHandleEvents,
    specialties: handlerSpecialtyEvents,
    shortcuts: handlerShortcutEvents
  }
}
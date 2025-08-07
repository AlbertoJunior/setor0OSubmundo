import { Setor0BaseActorSheet } from "../BaseActorSheet.mjs";
import { selectCharacteristic } from "../../../../utils/utils.mjs";
import { SYSTEM_ID, TEMPLATES_PATH } from "../../../../constants.mjs";
import { BaseActorCharacteristicType } from "../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs";
import { DialogUtils } from "../../../../utils/dialog-utils.mjs";
import { loadAndRegisterTemplates } from "../../../../utils/templates.mjs";
import { menuHandleMethods } from "../../../menu-default-methods.mjs";
import { ActorUpdater } from "../../../updater/actor-updater.mjs";
import { handlerEquipmentEvents } from "../player/methods/equipment-methods.mjs";
import { npcRollHandle } from "./methods/npc-roll-methods.mjs";
import { SheetActorDragabbleMethods } from "../player/methods/dragabble-methods.mjs";
import { handleStatusMethods } from "../player/methods/status-methods.mjs";
import { FoundryApi } from "../../../../api/foundry-api.mjs";
import { effectsHandleEvents } from "../player/methods/effects-methods.mjs";

export async function npcTemplatesRegister() {
    const templates = [
        { path: "npc/skill", call: "npcSkillPartial" },
        { path: "npc/informations", call: "npcInformations" },
        { path: "npc/status", call: "npcStatus" },
        { path: "npc/bag", call: "npcBag" },
    ];

    return await loadAndRegisterTemplates(templates);
}

export async function registerNpc() {
    await FoundryApi.Actors.registerSheet(SYSTEM_ID, Setor0NpcSheet, {
        types: ["NPC"],
        makeDefault: true
    });
}

export const NpcSheetSize = {
    width: 680,
    height: 460,
}

class Setor0NpcSheet extends Setor0BaseActorSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: NpcSheetSize.width,
        },
        window: {
            resizable: false,
        }
    };

    static PARTS = {
        sheet: {
            template: `${TEMPLATES_PATH}/npc/npc-sheet.hbs`,
        },
    };

    get mapEvents() {
        return {
            menu: menuHandleMethods,
            skill: npcRollHandle,
            img: {
                [OnEventType.VIEW]: async (actor, event) => {
                    DialogUtils.showArtWork(actor.name, actor.img, true, actor.uuid);
                }
            },
            temporary: handleStatusMethods,
            characteristic: {
                [OnEventType.CHARACTERISTIC]: async (actor, event) => {
                    const dataset = event.currentTarget.dataset;
                    switch (dataset.type) {
                        case 'vigor':
                            selectCharacteristic(event.currentTarget);
                            const level = event.currentTarget.parentElement.querySelectorAll('.S0-selected').length;
                            ActorUpdater.verifyAndUpdateActor(actor, BaseActorCharacteristicType.VITALITY.TOTAL, level + 5);
                            break;
                        case 'influencia':
                            this.#updateCharacteristic(actor, BaseActorCharacteristicType.INFLUENCE, event.currentTarget);
                            break;
                        case 'nivel_de_procurado':
                            this.#updateCharacteristic(actor, BaseActorCharacteristicType.BOUNTY, event.currentTarget);
                            break;
                    }
                }
            },
            equipment: {
                ...handlerEquipmentEvents,
                [OnEventType.ROLL]: async (actor, event) => npcRollHandle.rollEquipment(actor, event),
            },
            effects: effectsHandleEvents
        };
    }

    /* Only run on Application V1 */
    static get defaultOptions() {
        return FoundryApi.mergeObject(super.defaultOptions, {
            template: this.PARTS.sheet.template,
            resizable: this.DEFAULT_OPTIONS.window.resizable,
            width: this.DEFAULT_OPTIONS.position.width,
            height: NpcSheetSize.height,
        });
    }

    configureSheet(html) {
        super.configureSheet(html);
        SheetActorDragabbleMethods.setup(html, this.actor);
    }

    postRenderConfiguration(html) {
        super.postRenderConfiguration(html);
        Setor0BaseActorSheet.presetStatusVitality(html, this.actor);
        Setor0BaseActorSheet.presetStatusProtect(html, this.actor);
    }

    #updateCharacteristic(actor, characteristic, target) {
        selectCharacteristic(target);
        const level = target.parentElement.querySelectorAll('.S0-selected').length;
        ActorUpdater.verifyAndUpdateActor(actor, characteristic, level);
    }
}
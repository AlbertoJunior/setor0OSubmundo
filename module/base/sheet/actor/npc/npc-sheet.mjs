import { Setor0BaseActorSheet } from "../BaseActorSheet.mjs";
import { selectCharacteristic, TODO } from "../../../../../scripts/utils/utils.mjs";
import { SYSTEM_ID, TEMPLATES_PATH, SYSTEM_CLASS_CSS } from "../../../../constants.mjs";
import { BaseActorCharacteristicType } from "../../../../enums/characteristic-enums.mjs";
import { OnEventType, OnEventTypeClickableEvents, OnEventTypeContextualEvents } from "../../../../enums/on-event-type.mjs";
import { DialogUtils } from "../../../../utils/dialog-utils.mjs";
import { loadAndRegisterTemplates } from "../../../../utils/templates.mjs";
import { menuHandleMethods } from "../../../menu-default-methods.mjs";
import { ActorUpdater } from "../../../updater/actor-updater.mjs";
import { handlerEquipmentEvents } from "../player/methods/equipment-methods.mjs";
import { npcRollHandle } from "./methods/npc-roll-methods.mjs";
import { SheetActorDragabbleMethods } from "../player/methods/dragabble-methods.mjs";
import { handleStatusMethods } from "../player/methods/status-methods.mjs";
import { FoundryApi } from "../../../../utils/foundry-api.mjs";

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
    height: 454,
}

class Setor0NpcSheet extends Setor0BaseActorSheet {
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
            }
        };
    }

    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: [SYSTEM_CLASS_CSS, "sheet", "actor"],
            template: `${TEMPLATES_PATH}/npc/npc-sheet.hbs`,
            width: NpcSheetSize.width,
            height: NpcSheetSize.height,
            resizable: false,
        });
    }

    configureSheet(html) {
        this.#setupListeners(html);
        Setor0BaseActorSheet.presetStatusVitality(html, this.actor);
        Setor0BaseActorSheet.presetStatusProtect(html, this.actor);
        SheetActorDragabbleMethods.setup(html, this.actor);
        super.addPageButtonsOnFloatingMenu(html);
    }

    #setupListeners(html) {
        [OnEventType.CHARACTERISTIC, ...OnEventTypeClickableEvents]
            .map(eventType => ({
                selector: `[data-action="${eventType}"]`,
                method: super.onActionClick
            }))
            .forEach(action => {
                html.find(action.selector).click(action.method.bind(this, html));
            });

        [...OnEventTypeContextualEvents]
            .map(eventType => ({
                selector: `[data-action="${eventType}"]`,
                method: super.onContextualClick
            }))
            .forEach(action => {
                html.find(action.selector).on('contextmenu', action.method.bind(this, html));
            });

    }

    #updateCharacteristic(actor, characteristic, target) {
        selectCharacteristic(target);
        const level = target.parentElement.querySelectorAll('.S0-selected').length;
        ActorUpdater.verifyAndUpdateActor(actor, characteristic, level);
    }
}
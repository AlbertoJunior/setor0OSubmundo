import { localize, randomId, TODO } from "../../utils/utils.mjs";
import { Setor0BaseActorSheet } from "../../base/sheet/actor/BaseActorSheet.mjs";
import { npcRollHandle } from "../../base/sheet/actor/npc/methods/npc-roll-methods.mjs";
import { NpcSheetSize } from "../../base/sheet/actor/npc/npc-sheet.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { createLi } from "../element/element-creator-jscript.mjs";

export class NpcDialog {
    static #mapEvents = {
        skill: npcRollHandle,
        img: {
            [OnEventType.VIEW]: async (actor, event) => {
                DialogUtils.showArtWork(actor.name, actor.img, true, actor.uuid);
            }
        }
    }

    static async open(npcInformations) {
        if (!npcInformations) {
            console.warn('npcInformations is required');
            return;
        }

        TODO("npc dialog funcionar na versão v2");

        const content = await this.#mountContent(npcInformations);
        const actor = npcInformations.actor;
        FoundryApi.createDialog(
            {
                title: actor.name,
                content: content,
                render: (html) => this.#render(html, actor)
            },
            {
                height: NpcSheetSize.height + 20,
                width: NpcSheetSize.width,
            },
            FoundryApi.Versions.v1
        );
    }

    static async #mountContent(npcActor) {
        const actorId = npcActor.id ?? npcActor.actor?.id ?? `Actor.${randomId(10)}`;
        const uuid = `dialog.${actorId}`;
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/npc/npc-sheet.hbs`, { uuid, ...npcActor });
    }

    static #render(html, npcActor) {
        this.#configureListeners(html, npcActor);
        this.#configureButtonsMenu(html, npcActor);
        Setor0BaseActorSheet.presetStatusVitality(html, npcActor);
        this.#removeElements(html);
    }

    static #configureListeners(html, npcActor) {
        Object.values(OnEventType)
            .filter(event => event != 'contextual' && event != 'check_contextual' && event != 'change')
            .map(eventType => (
                {
                    selector: `[data-action="${eventType}"]`,
                    method: NpcDialog.onActionClick
                }
            ))
            .forEach(action => html.find(action.selector).click(action.method.bind(this, html, npcActor)));
    }

    static #configureButtonsMenu(html, npcActor) {
        const simulatedActorSheet = new Setor0BaseActorSheet();
        simulatedActorSheet._setupAutoTabs(html);

        const buttonContainer = html.find("#floating-menu")[0];
        if (!buttonContainer) {
            return;
        }

        if (!game.user.isGM || !npcActor.isOwner) {
            buttonContainer.remove();
            return;
        }

        const isCompacted = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT);
        const buttonLabel = localize('NPC.Ver_Ficha');
        const textContent = isCompacted ? undefined : buttonLabel;
        const options = {
            title: buttonLabel,
            classList: `S0-simulate-button ${isCompacted ? 'S0-compact' : ''}`,
            icon: {
                class: 'fas fa-eye',
                margin: '0px',
                marginRight: isCompacted ? '0px' : '4px',
            },
        };
        const button = createLi(textContent, options);
        button.addEventListener('click', () => {
            game.actors.get(npcActor.id)?.sheet?.render(true);
        });

        buttonContainer.appendChild(button);
    }

    static async onActionClick(html, npcActor, event) {
        event.preventDefault();

        const dataset = event.currentTarget.dataset;
        const characteristic = dataset.characteristic;
        const action = dataset.action;
        const method = this.#mapEvents[characteristic]?.[action];
        if (method) {
            method(npcActor, event, html);
        } else {
            console.warn(`-> [${action}] não existe para: [${characteristic}]`);
        }
    }

    static #removeElements(html) {
        html.find('.S0-characteristic.S0-clickable').removeClass("S0-clickable");
        html.find('h3 a').remove();
    }
}
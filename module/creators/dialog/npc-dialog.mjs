import { localize } from "../../../scripts/utils/utils.mjs";
import { Setor0BaseActorSheet } from "../../base/sheet/actor/BaseActorSheet.mjs";
import { npcRollHandle } from "../../base/sheet/actor/npc/methods/npc-roll-methods.mjs";
import { NpcSheetSize } from "../../base/sheet/actor/npc/npc-sheet.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";
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
            }
        );
    }

    static async #mountContent(npcActor) {
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/npc/npc-sheet.hbs`, npcActor);
    }

    static #render(html, npcActor) {
        this.#configureListeners(html, npcActor);

        this.#addPageButtonsOnFloatingMenu(html, npcActor);

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

    static #addPageButtonsOnFloatingMenu(html, npcActor) {
        const isCompacted = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT);
        const htmlPages = html.find(".S0-page");
        const buttonContainer = html.find("#floating-menu")[0];

        if (!buttonContainer || !htmlPages.length) {
            return;
        }

        let currentPage = 1;

        if (game.user.isGM) {
            const pages = Array.from(htmlPages);
            const buttons = [];

            pages.forEach((page, index) => {
                const pageLabel = page.getAttribute('data-label') || "[Erro]";
                const iconClass = page.getAttribute('data-icon');
                const textContent = isCompacted ? undefined : pageLabel;

                const options = {
                    title: pageLabel,
                    classList: `S0-simulate-button ${isCompacted ? 'S0-compact' : ''}`,
                    ...(iconClass && {
                        icon: {
                            class: iconClass,
                            marginRight: isCompacted ? '0px' : '4px',
                        },
                    }),
                };

                const button = createLi(textContent, options);
                buttonContainer.appendChild(button);
                buttons.push(button);

                button.addEventListener('click', () => {
                    if (currentPage === index + 1) {
                        return;
                    }

                    const prevIndex = currentPage - 1;
                    const newIndex = index;

                    pages[prevIndex].classList.add('hidden');
                    pages[newIndex].classList.remove('hidden');

                    buttons[prevIndex].classList.remove('S0-selected');
                    buttons[newIndex].classList.add('S0-selected');

                    currentPage = index + 1;
                });

                if (index + 1 === currentPage) {
                    button.classList.add('S0-selected');
                } else {
                    page.classList.add('hidden');
                }
            });

            const buttonLabel = localize('NPC.Ver_Ficha');
            const textContent = isCompacted ? undefined : buttonLabel;
            const options = {
                title: buttonLabel,
                classList: `S0-simulate-button ${isCompacted ? 'S0-compact' : ''}`,
                icon: {
                    class: 'fas fa-eye',
                    marginRight: isCompacted ? '0px' : '4px',
                },
            };

            const button = createLi(textContent, options);
            button.addEventListener('click', () => {
                game.actors.get(npcActor.id)?.sheet?.render(true);
            });

            buttonContainer.appendChild(button);
            buttons.push(button);

        } else {
            htmlPages.each((index, page) => {
                if (index > 0) {
                    page.classList.add('hidden');
                }
            });
        }
    }

    static #removeElements(html) {
        html.find('.S0-characteristic.S0-clickable').removeClass("S0-clickable");
        html.find('h3 a').remove();
    }
}
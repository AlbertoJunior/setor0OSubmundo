import { localize, randomId, TODO } from "../../utils/utils.mjs";
import { Setor0BaseActorSheet } from "../../base/sheet/actor/BaseActorSheet.mjs";
import { npcRollHandle } from "../../base/sheet/actor/npc/methods/npc-roll-methods.mjs";
import { NpcSheetSize } from "../../base/sheet/actor/npc/npc-sheet.mjs";
import { SYSTEM_CLASS_DARK_CSS, TEMPLATES_PATH } from "../../constants.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { DialogUtils } from "../../utils/dialog-utils.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { createLi } from "../element/element-creator-jscript.mjs";
import { ActorUtils } from "../../core/actor/actor-utils.mjs";

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
        classes: [SYSTEM_CLASS_DARK_CSS, 'S0-overflow-visible'],
        title: actor.name,
        content: content,
        render: (html) => this.#render(html, actor)
      },
      {
        height: NpcSheetSize.height,
        width: NpcSheetSize.width,
      },
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
      .forEach(action => {
        html.querySelectorAll(action.selector).forEach(element => {
          element.addEventListener('click', action.method.bind(this, html, npcActor));
        });
      });
  }

  static #configureButtonsMenu(html, npcActor) {
    Setor0BaseActorSheet.setupTabs(html, 1);

    const buttonContainer = html.querySelector("#floating-menu");
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
      ActorUtils.getActor(npcActor.id)?.sheet?.render(true);
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
    html.querySelectorAll('.S0-characteristic.S0-clickable').forEach(el => el.classList.remove("S0-clickable"));
    html.querySelectorAll('h3 a').forEach(el => el.remove());
  }
}
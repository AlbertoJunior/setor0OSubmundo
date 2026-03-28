import { getObject } from "../../../../../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../../../../core/actor/actor-equipment-utils.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { CharacteristicType } from "../../../../../enums/characteristic-enums.mjs"
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { HtmlJsUtils } from "../../../../../utils/html-js-utils.mjs";
import { EquipmentUtils } from "../../../../../core/equipment/equipment-utils.mjs";
import { FoundryApi } from "../../../../../api/foundry-api.mjs";
import { ChatCreator } from "../../../../../utils/chat-creator.mjs";
import { TransferEquipmentMessageCreator } from "../../../../../creators/message/transfer-equipment-message.mjs";

export class SheetActorDragabbleMethods {
  static async setup(html, actor) {
    this.#setupBagDrag(html, actor);
    this.#setupNetworkDrag(html, actor);

    if (!window.Sortable) {
      return;
    }

    this.#setupShortcutDragSortable(html, actor);
    this.#setupBagDragSortable(html, actor);
  }

  static #findUsingActorId(html, id, actor) {
    return html.querySelector(`#${id}-${actor.id}`);
  }

  static #setupBagDrag(html, actor) {
    const containerBag = this.#findUsingActorId(html, 'bag', actor);
    if (!containerBag) return;

    containerBag.addEventListener('dragover', (event) => {
      event.preventDefault(); // Obrigatório para permitir o drop entre janelas do navegador
      containerBag.classList.add("S0-drag-over");
    });

    containerBag.addEventListener('drop', (event) => {
      containerBag.classList.remove("S0-drag-over");
      this.#onDropOnBag(actor, event);
    });
    containerBag.addEventListener('dragenter', (event) => {
      containerBag.classList.add("S0-drag-over");
    });

    containerBag.addEventListener('dragleave', (event) => {
      containerBag.classList.remove("S0-drag-over");
    });
  }

  static async #setupNetworkDrag(html, actor) {
    const containerAllies = this.#findUsingActorId(html, 'allies', actor);
    HtmlJsUtils.presetAllDragEvents(
      containerAllies, actor, (actor, event) => { this.#onDropOnAlliesInformants(actor, CharacteristicType.ALLIES, event); }
    );

    const containerInformants = this.#findUsingActorId(html, 'informants', actor);
    HtmlJsUtils.presetAllDragEvents(
      containerInformants, actor, (actor, event) => { this.#onDropOnAlliesInformants(actor, CharacteristicType.INFORMANTS, event); }
    );
  }

  static #setupShortcutDragSortable(html, actor) {
    const containerShortcut = this.#findUsingActorId(html, `shortcuts-container`, actor);
    if (!containerShortcut) {
      return;
    }

    window.Sortable.create(containerShortcut, {
      animation: 150,
      handle: ".draggable",
      draggable: ".draggable",
      onStart: (evt) => {
        containerShortcut.classList.add('S0-drop-target-hover');
      },
      onEnd: (evt) => {
        containerShortcut.classList.remove('S0-drop-target-hover');

        const shortcuts = getObject(actor, CharacteristicType.SHORTCUTS);
        const newOrder = Array.from(containerShortcut.children)
          .map(element => {
            const id = element.querySelector("[data-item-id]")?.dataset?.itemId;
            return shortcuts.find(shortcut => shortcut.id == id);
          }).filter(Boolean);

        ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SHORTCUTS, newOrder);
      }
    });
  }

  static #setupBagDragSortable(html, actor) {
    const actorId = actor.id;
    const equippedList = this.#findUsingActorId(html, 'equipped', actor);
    const bagList = this.#findUsingActorId(html, 'bag', actor);
    if (!equippedList || !bagList) {
      return;
    }

    const sortableOptions = {
      group: {
        name: `equipment-move`,
        put: (to, from) => {
          const toActorId = to.el.id.split('-')[1];
          const fromActorId = from.el.id.split('-')[1];

          if (toActorId === fromActorId) return true;

          const toSource = to.el.id.split('-')[0];
          const fromSource = from.el.id.split('-')[0];
          return toSource === "bag" && fromSource === "bag";
        }
      },
      animation: 150,
      swapThreshold: 0.65,
      emptyInsertThreshold: 20,
      draggable: "li:not(.S0-label-drop-container)",
      handle: ".S0-item-bag",
      onStart: (evt) => {
        bagList.classList.add('S0-drop-target-hover');
        equippedList.classList.add('S0-drop-target-hover');
      },
      onEnd: async (evt) => {
        bagList.classList.remove('S0-drop-target-hover');
        equippedList.classList.remove('S0-drop-target-hover');

        const itemElement = evt.item.querySelector("[data-item-id]");
        const itemId = itemElement?.dataset?.itemId;
        if (!itemId) {
          console.warn("-> possível erro ao pegar o id");
          return;
        }

        const equipment = ActorEquipmentUtils.getEquipmentById(actor, itemId);
        if (!equipment) {
          console.warn("-> possível erro ao pegar o equipamento");
          return
        }

        const origin = evt.from.id;
        const destination = evt.to?.id;

        if (!destination) return;

        const originSource = origin.split('-')[0];
        const destSource = destination.split('-')[0];

        const originActorId = origin.split('-')[1];
        const destActorId = destination.split('-')[1];

        const isTrade = originActorId !== destActorId;

        if (isTrade) {
          await this.#tradeEquipment(actor, destActorId, equipment);
        } else if (originSource === destSource) {
          await this.#sortEquipments(actor, originSource, bagList, equippedList);
        } else {
          await this.#equipOrUnequip(actor, originSource, equipment);
        }
      }
    };

    window.Sortable.create(equippedList, sortableOptions);
    window.Sortable.create(bagList, sortableOptions);
  }

  static async #tradeEquipment(actor, destActorId, equipment) {
    const targetActor = game.actors.get(destActorId);
    if (!targetActor) return;

    const itemData = ActorEquipmentUtils.createDataItem(equipment);
    const createdItems = await ActorUpdater.addDocuments(targetActor, [itemData]);
    await ActorUpdater.removeDocuments(actor, [equipment.id]);

    const createdItem = createdItems && createdItems.length > 0 ? createdItems[0] : null;
    const targetUuid = createdItem ? createdItem.uuid : equipment.uuid;

    const contentMessage = await TransferEquipmentMessageCreator.mountContent({
      sourceActorName: actor.name,
      itemName: equipment.name,
      targetActorName: targetActor.name,
      targetUuid: targetUuid
    });

    await ChatCreator.sendToChat(actor, contentMessage);
  }

  static async #sortEquipments(actor, originSource, bagList, equippedList) {
    const equipped = ActorEquipmentUtils.getEquippedItems(actor);
    const unequipped = ActorEquipmentUtils.getFilteredUnequippedEquipment(actor);

    let elementContainer, sourceItems, staticItems;

    if (originSource === 'bag') {
      elementContainer = bagList;
      sourceItems = unequipped;
      staticItems = equipped;
    } else if (originSource === 'equipped') {
      elementContainer = equippedList;
      sourceItems = equipped;
      staticItems = unequipped;
    } else {
      console.warn("-> possível erro ao pegar a fonte de onde saiu o item");
      return;
    }

    const newOrder = Array.from(elementContainer.children)
      .map(element => {
        const id = element.querySelector("[data-item-id]")?.dataset?.itemId;
        return sourceItems.find(item => item.id === id);
      })
      .filter(Boolean);

    const orderedItems = originSource === 'bag' ? [...staticItems, ...newOrder] : [...newOrder, ...staticItems];

    const finalItems = orderedItems.map((item, index) => ({
      _id: item.id,
      sort: index * 100
    }));

    await ActorUpdater.updateDocuments(actor, finalItems);
  }

  static async #equipOrUnequip(actor, originSource, equipment) {
    if (originSource == 'bag') {
      if (EquipmentUtils.canEquip(equipment)) {
        await ActorEquipmentUtils.equip(actor, equipment);
      } else {
        NotificationsUtils.warning("Este Item não pode ser equipado");
        actor.sheet.render();
      }
    } else if (originSource == 'equipped') {
      await ActorEquipmentUtils.unequip(actor, equipment);
    } else {
      console.warn("-> possível erro ao pegar a fonte de onde saiu o item");
    }
  }

  static #verifyDropAndReturnData(actor, event) {
    if (!actor.isOwner) {
      return null;
    }

    const dataTransfer = event.dataTransfer || event.originalEvent?.dataTransfer;
    const textPlain = dataTransfer.getData("text/plain");
    try {
      return JSON.parse(textPlain);
    } catch (error) {
      return null;
    }
  }

  static async #onDropOnBag(actor, event) {
    const data = this.#verifyDropAndReturnData(actor, event);
    if (!data) {
      return;
    }

    if (data.type !== "Item") {
      NotificationsUtils.warning("Este campo só aceita Equipamentos");
      return;
    }

    event.preventDefault();
    if (event.originalEvent) event.originalEvent.preventDefault();

    const item = await FoundryApi.Item.implementation.fromDropData(data);
    if (!item) {
      console.warn("-> possível erro ao criar o Item");
      return;
    }

    const itemData = ActorEquipmentUtils.createDataItem(item);
    await ActorUpdater.addDocuments(actor, [itemData]);
  }

  static async #onDropOnAlliesInformants(actor, characteristic, event) {
    const data = this.#verifyDropAndReturnData(actor, event);
    if (!data) {
      return;
    }

    event.preventDefault();
    if (event.originalEvent) event.originalEvent.preventDefault();

    if (data.type !== "Actor") {
      NotificationsUtils.warning("Este campo só aceita Personagens");
      return;
    }

    const actorCreated = await FoundryApi.Actor.implementation.fromDropData(data);
    if (!actorCreated || !characteristic) {
      console.warn("-> possível erro ao criar o Actor ou na Characteristic");
      NotificationsUtils.warning("Não foi possível adicionar este Personagem.");
      return;
    }

    if (actorCreated.id == actor.id) {
      NotificationsUtils.error("O personagem não pode se adicionar como Aliado ou Informante.")
      return;
    }

    const list = getObject(actor, characteristic) || [];
    await ActorUpdater.verifyAndUpdateActor(actor, characteristic, new Set([...list, actorCreated.id]));
  }
}
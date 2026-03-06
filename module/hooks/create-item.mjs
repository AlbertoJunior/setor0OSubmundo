import { EquipmentUtils } from "../core/equipment/equipment-utils.mjs";
import { NotificationsUtils } from "../creators/message/notifications.mjs";
import { EquipmentRepository } from "../repository/equipment-repository.mjs";
import { localizeType } from "../utils/utils.mjs";

export class CreateItemHookHandle {
  static async handle(item) {
    const canContinue = this.#validateItemAgainstPackFilter(item);

    if (!canContinue) {
      return;
    }

    this.#operateItemCreated(item);
  }

  static async #validateItemAgainstPackFilter(item) {
    const { pack: packId, type: itemType } = item;
    if (!packId) {
      return true;
    }

    const pack = game.packs.get(packId);
    const filterTypes = pack?.metadata?.flags?.filter?.type;
    if (!filterTypes || filterTypes.includes(itemType)) {
      return true;
    }

    const filterTypesMessage = filterTypes.map(type => localizeType(`Item.${type}`)).join(', ');
    NotificationsUtils.warning(`Este pacote só aceita itens do tipo '${filterTypesMessage}'.`);
    item.delete();

    return false;
  }

  static async #operateItemCreated(item) {
    if (this.#isItemInActor(item)) return;

    if (EquipmentUtils.isEquipment(item)) {
      EquipmentRepository.addItem(item);
    }
  }

  /**
   * Verifica se o item pertence a um Ator (Embedded Document)
   * em vez de ser um item global (World Item)
   * @param {Item} item 
   * @returns {boolean}
   */
  static #isItemInActor(item) {
    return Boolean(item.parent);
  }
}
import { getObject } from "../utils/utils.mjs";
import { SYSTEM_ID } from "../constants.mjs";
import { equipmentParseData } from "../data/equipment-data-model.mjs";
import { EquipmentCharacteristicType, validEquipmentTypes } from "../enums/equipment-enums.mjs";

export class EquipmentRepository {

  static #loadedFromPack = [];
  static #loadedFromGame = [];

  static async _loadFromGame() {
    const validTypes = validEquipmentTypes();
    EquipmentRepository.#loadedFromPack = await game.items?.filter(item => validTypes.includes(getObject(item, EquipmentCharacteristicType.TYPE)));
  }

  static async _loadFromPack() {
    const compendium = await game.packs.get(`${SYSTEM_ID}.itens`)?.getDocuments();
    if (compendium) {
      EquipmentRepository.#loadedFromPack = compendium.map((equipment) => {
        return equipmentParseData(equipment);
      });
    }
  }

  static addItem(item) {
    if (!this.#loadedFromGame.includes(item)) {
      this.#loadedFromGame.push(item);
    }
  }

  static async refresh() {
    this.#loadedFromPack.splice(0, arr.length);
    this.#loadedFromGame.splice(0, arr.length);
    this._loadFromPack();
    this._loadFromGame();
  }

  static getItems() {
    return [... this.#loadedFromPack, ... this.#loadedFromGame];
  }

  static getItemById(items, itemId) {
    return items.find(item => item.id == itemId);
  }
}
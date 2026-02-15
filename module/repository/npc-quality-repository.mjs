import { FoundryApi } from "../api/foundry-api.mjs";
import { localize } from "../utils/utils.mjs";

export class NpcQualityRepository {

  static TYPES = Object.freeze({
    WORST: { id: 'worst', label: 'NPC.Horrivel', bonusOrDebuff: -4 },
    BAD: { id: 'bad', label: 'NPC.Ruim', bonusOrDebuff: -2 },
    NORMAL: { id: 'normal', label: 'NPC.Normal', bonusOrDebuff: 0 },
    GOOD: { id: 'good', label: 'NPC.Bom', bonusOrDebuff: 2 },
    EXCEPTIONAL: { id: 'exceptional', label: 'NPC.Excepcional', bonusOrDebuff: 4 },
  });

  static #items = Object.values(NpcQualityRepository.TYPES);

  static getItems() {
    return [... this.#items]
      .map(item => {
        return {
          ...item,
          label: localize(item.label)
        };
      });
  }

  static getItem(id) {
    const item = this.getItems().find(item => item.id == id);
    return item ? FoundryApi.deepClone(item) : null;
  }
}
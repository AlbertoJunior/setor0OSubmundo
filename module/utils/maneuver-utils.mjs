import { CharacteristicType } from "../enums/characteristic-enums.mjs";
import { ItemType } from "../enums/item-type-enums.mjs";

const SKILL_WEAPON_MAP = Object.freeze({
  [CharacteristicType.SKILLS.MELEE.id]: ItemType.MELEE,
  [CharacteristicType.SKILLS.PROJECTILE.id]: ItemType.PROJECTILE,
});

export class ManeuverUtils {
  /**
   * Retorna o tipo de item (arma) exigido pela manobra, baseado na habilidade usada.
   *
   * @param {string} skillId 
   * @returns {string|null} Retorna ItemType.MELEE, ItemType.PROJECTILE ou null
   */
  static getRequiredWeaponType(skillId) {
    return SKILL_WEAPON_MAP[skillId] || null;
  }
}

import { CombatUtils } from "../../core/combat/combat-utils.mjs";

export class UpdateTokenHookHandle {
  static async handle(updatedToken, changes, options, userId) {
    this.#verifyUpdateCombatTracker(updatedToken, changes, options, userId);
  }

  /**
   * Verifica se o token está no combat tracker e se algum campo rastreado do token foi atualizado, 
   * caso tenha sido, atualiza no combat tracker as seguintes informações: Imagem, nome, posição x e y
   * @param {TokenDocument} updatedToken 
   * @param {Object} changes 
   * @param {Object} options 
   * @param {string} userId 
   */
  static #verifyUpdateCombatTracker(updatedToken, changes, options, userId) {
    const currentCombat = CombatUtils.currentCombat();
    if (!currentCombat || !this.verifyNeedUpdateCombatTracker(changes)) {
      return;
    }

    const updatedTokenId = updatedToken.id;
    const combatant = currentCombat.combatants.contents.find(combatant => combatant.tokenId === updatedTokenId);
    if (combatant) {
      if (changes.x || changes.y) {
        combatant.updateResource();
      }

      if (changes.texture) {
        CombatUtils.refreshRender();
      }
    }
  }

  static verifyNeedUpdateCombatTracker(changes) {
    const FIELDS = ["name", "texture", "x", "y"];
    return FIELDS.some(field => field in changes);
  }
}
export class ActiveEffectUpdater {

  /**
   * Atualiza as propriedades de um Efeito Ativo.
   * @param {ActiveEffect} effect - O Efeito Ativo.
   * @param {Object} dataToUpdate - Objeto com os campos a atualizar.
   * @returns {Promise<ActiveEffect>}
   */
  static async updateEffectData(effect, dataToUpdate = {}) {
    if (Object.keys(dataToUpdate).length > 0) {
      return await effect.update(dataToUpdate);
    }
  }

  /**
   * Ativa ou desativa um efeito ativo.
   * @param {ActiveEffect} effect - O Efeito Ativo.
   * @param {boolean} disabled - True se deve ser desativado, false para ativar.
   * @returns {Promise<ActiveEffect>}
   */
  static async setDisabledStatus(effect, disabled) {
    if (!effect) return;
    return await this.updateEffectData(effect, { disabled });
  }

}

import { localize, getObject } from "../../utils/utils.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";

export class ManeuverUpdater {
  /**
   * Atualiza a manobra, validando as regras de negócio.
   *
   * @param {Item} document - O item da manobra
   * @param {string} keyToUpdate - Chave sendo atualizada (ex: "system.skill")
   * @param {any} value - Novo valor
   */
  static async updateManeuver(document, keyToUpdate, value) {
    if (document.isEmbedded && getObject(document, ManeuverType.IS_READ_ONLY)) return;

    const pendingUpdate = { [keyToUpdate]: value };
    
    // Calcula como ficará o system data após o update
    const systemData = FoundryApi.Utils.mergeObject(
      FoundryApi.Utils.deepClone(document.system),
      this.#extractSystemFields(pendingUpdate),
      { inplace: false }
    );

    // Validação: atributos primário e secundário não podem ser iguais
    const primaryAttr = systemData[ManeuverType.PRIMARY_ATTRIBUTE.id];
    const secondaryAttr = systemData[ManeuverType.SECONDARY_ATTRIBUTE.id];
    if (primaryAttr && secondaryAttr && primaryAttr === secondaryAttr) {
      NotificationsUtils.error(localize("Aviso.Erro.Atributos_Iguais"));
      return;
    }

    await document.update(pendingUpdate);
  }

  /**
   * Extrai campos de system.* de um objeto de update plano.
   * Ex: { "system.skill": "briga" } → { skill: "briga" }
   */
  static #extractSystemFields(updateObj) {
    const result = {};
    for (const [key, val] of Object.entries(updateObj)) {
      if (key.startsWith('system.')) {
        result[key.replace('system.', '')] = val;
      }
    }
    return result;
  }
}

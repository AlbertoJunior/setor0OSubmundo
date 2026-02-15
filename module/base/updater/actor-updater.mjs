import { getObject } from "../../utils/utils.mjs";

export class ActorUpdater {
  static async verifyAndUpdateActor(actor, systemCharacteristic, value) {
    await this.verifyKeysAndUpdateActor(actor, [{ systemCharacteristic: systemCharacteristic, value: value }]);
  }

  static async verifyKeysAndUpdateActor(actor, params = []) {
    const keysToUpdate = {};
    params.forEach(item => {
      const verifiedSystemCharacteristic = item.systemCharacteristic.system ? item.systemCharacteristic.system : item.systemCharacteristic;

      if (getObject(actor, verifiedSystemCharacteristic) == undefined) {
        console.warn(`-> [${verifiedSystemCharacteristic}] não existe, impossível atualizar o Actor`);
      } else {
        keysToUpdate[verifiedSystemCharacteristic] = item.value;
      }
    });

    await actor.update(keysToUpdate);
  }

  static async addEffects(actor, activeEffectData = []) {
    await actor.createEmbeddedDocuments("ActiveEffect", activeEffectData);
  }

  static async addDocuments(actor, itemsData = []) {
    await actor.createEmbeddedDocuments("Item", itemsData);
  }

  static async removeDocuments(actor, itemsId = []) {
    await actor.deleteEmbeddedDocuments("Item", itemsId);
  }

  static async updateDocuments(actor, itemUpdatedData = []) {
    await actor.updateEmbeddedDocuments("Item", itemUpdatedData);
  }
}
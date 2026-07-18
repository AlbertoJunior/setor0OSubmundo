import { getObject } from "../../utils/utils.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { ActorEquipmentUtils } from "../../core/actor/actor-equipment-utils.mjs";
import { ActorUpdater } from "./actor-updater.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class EquipmentUpdater {
  static async updateEquipment(equipment, characteristic, value) {
    const change = this.createChange(characteristic, value);
    return await this.updateEquipmentData(equipment, [change]);
  }

  static createChange(characteristic, value) {
    let haveSystem = characteristic;
    if (characteristic.system) {
      haveSystem = characteristic.system;
    }
    return { characteristic: haveSystem, value };
  }

  static async updateEquipmentData(equipment, changes = []) {
    const dataToUpdate = {};
    for (const { characteristic, value } of changes) {
      if (getObject(equipment, characteristic) === undefined) {
        throw new Error(`Característica [${characteristic}] não existe no Equipamento, impossível atualizar.`);
      }
      dataToUpdate[characteristic] = value;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      return await equipment.update(dataToUpdate);
    }
  }

  static async updateEquipmentFlags(equipment, flagKey, value) {
    return await this.updateOnActorEquipmentFlags(equipment, [{ flagKey, value }]);
  }

  static async updateOnActorEquipmentFlags(equipment, updates = []) {
    if (!equipment) {
      throw new Error(`[EquipmentUpdater] Equipamento não fornecido ou inválido.`);
    }

    const flags = FoundryApi.deepClone(equipment.flags?.[SYSTEM_ID] || {});

    for (const { flagKey, value } of updates) {
      flags[flagKey] = value;
    }

    return await equipment.update(
      {
        [`flags.${SYSTEM_ID}`]: flags
      }
    );
  }

  static async updateOnActorMultipleEquipments(actor, equipmentsData = []) {
    const updatedItems = [];

    for (const { equipmentId, flagsToUpdate } of equipmentsData) {
      const equipment = ActorEquipmentUtils.getEquipmentById(actor, equipmentId);
      if (!equipment) {
        throw new Error(`[EquipmentUpdater] Equipamento ID [${equipmentId}] não encontrado no Ator.`);
      }

      const existingFlags = FoundryApi.deepClone(equipment.flags?.[SYSTEM_ID] || {});
      for (const { flagKey, value } of flagsToUpdate) {
        existingFlags[flagKey] = value;
      }

      updatedItems.push({
        _id: equipmentId,
        [`flags.${SYSTEM_ID}`]: existingFlags
      });
    }

    if (updatedItems.length) {
      await ActorUpdater.updateDocuments(actor, updatedItems);
    }
  }
}
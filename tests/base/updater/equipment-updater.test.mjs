import { describe, expect, it, vi } from "vitest";
import { EquipmentUpdater } from "../../../module/base/updater/equipment-updater.mjs";
import { ActorEquipmentUtils } from "../../../module/core/actor/actor-equipment-utils.mjs";

describe("EquipmentUpdater", () => {
  describe("updateEquipmentData", () => {
    it("deve lançar erro se a característica não existir", async () => {
      const mockEq = {
        name: "Test Eq",
        system: {
          quantity: 1
        }
      };
      const changes = [{ characteristic: "system.invalid", value: 5 }];

      await expect(EquipmentUpdater.updateEquipmentData(mockEq, changes))
        .rejects.toThrow(/Característica \[system\.invalid\] não existe no Equipamento/);
    });

    it("deve atualizar caso exista a característica", async () => {
      const mockEq = {
        name: "Test Eq",
        system: {
          quantity: 1
        },
        update: vi.fn()
      };
      const changes = [{ characteristic: "system.quantity", value: 5 }];

      await EquipmentUpdater.updateEquipmentData(mockEq, changes);
      expect(mockEq.update).toHaveBeenCalledWith({ "system.quantity": 5 });
    });
  });

  describe("updateOnActorEquipmentFlags", () => {
    it("deve lançar erro se o equipamento for inválido", async () => {
      await expect(EquipmentUpdater.updateOnActorEquipmentFlags(null, []))
        .rejects.toThrow(/Equipamento não fornecido ou inválido/);
    });
  });

  describe("updateOnActorMultipleEquipments", () => {
    it("deve lançar erro se o equipamento não for encontrado no ator", async () => {
      vi.spyOn(ActorEquipmentUtils, "getEquipmentById").mockReturnValue(null);
      const mockActor = {};
      const eqData = [{ equipmentId: "invalid_id", flagsToUpdate: [] }];

      await expect(EquipmentUpdater.updateOnActorMultipleEquipments(mockActor, eqData))
        .rejects.toThrow(/Equipamento ID \[invalid_id\] não encontrado no Ator/);
    });
  });
});

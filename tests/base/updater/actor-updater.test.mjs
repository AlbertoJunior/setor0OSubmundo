import { describe, expect, it, vi } from "vitest";
import { ActorUpdater } from "../../../module/base/updater/actor-updater.mjs";

describe("ActorUpdater", () => {
  describe("verifyAndUpdateActor", () => {
    it("deve lançar erro se o atributo não existir no ator", async () => {
      const mockActor = {
        name: "Test Actor",
        system: {
          vitalidade: { total: 10 }
        }
      };
      
      const systemCharacteristic = { system: "system.atributo_invalido" };
      const value = 5;
      
      await expect(ActorUpdater.verifyAndUpdateActor(mockActor, systemCharacteristic, value))
        .rejects.toThrow(/Atributo ou característica \[system\.atributo_invalido\] não existe no Ator/);
    });

    it("deve chamar update se o atributo existir", async () => {
      const mockActor = {
        name: "Test Actor",
        system: {
          vitalidade: { total: 10 }
        },
        update: vi.fn()
      };
      
      const systemCharacteristic = { system: "system.vitalidade.total" };
      const value = 15;
      
      await ActorUpdater.verifyAndUpdateActor(mockActor, systemCharacteristic, value);
      
      expect(mockActor.update).toHaveBeenCalledWith({
        "system.vitalidade.total": 15
      });
    });
  });
});

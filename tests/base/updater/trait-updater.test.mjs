import { describe, expect, it, vi } from "vitest";
import { TraitUpdater } from "../../../module/base/updater/trait-updater.mjs";

describe("TraitUpdater", () => {
  describe("updateTraitData", () => {
    it("deve lançar erro se a característica não existir", async () => {
      const mockTrait = {
        name: "Test Trait",
        system: {
          xp: 1
        }
      };
      const changes = [{ characteristic: "system.invalid", value: 5 }];
      
      await expect(TraitUpdater.updateTraitData(mockTrait, changes))
        .rejects.toThrow(/Característica \[system\.invalid\] não existe no Traço/);
    });

    it("deve atualizar caso exista a característica", async () => {
      const mockTrait = {
        name: "Test Trait",
        system: {
          xp: 1
        },
        update: vi.fn()
      };
      const changes = [{ characteristic: "system.xp", value: 5 }];
      
      await TraitUpdater.updateTraitData(mockTrait, changes);
      expect(mockTrait.update).toHaveBeenCalledWith({ "system.xp": 5 });
    });
  });
});

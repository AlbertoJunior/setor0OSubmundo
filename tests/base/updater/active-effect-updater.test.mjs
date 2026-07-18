import { describe, expect, it, vi } from "vitest";
import { ActiveEffectUpdater } from "../../../module/base/updater/active-effect-updater.mjs";

describe("ActiveEffectUpdater", () => {
  describe("updateEffectData", () => {
    it("deve chamar update com os dados corretos", async () => {
      const mockEffect = { update: vi.fn() };
      const dataToUpdate = { name: "Novo Efeito" };

      await ActiveEffectUpdater.updateEffectData(mockEffect, dataToUpdate);

      expect(mockEffect.update).toHaveBeenCalledWith(dataToUpdate);
    });

    it("não deve chamar update se dataToUpdate for vazio", async () => {
      const mockEffect = { update: vi.fn() };

      await ActiveEffectUpdater.updateEffectData(mockEffect, {});

      expect(mockEffect.update).not.toHaveBeenCalled();
    });
  });

  describe("setDisabledStatus", () => {
    it("deve chamar updateEffectData com disabled: true", async () => {
      const mockEffect = { update: vi.fn() };
      const spy = vi.spyOn(ActiveEffectUpdater, "updateEffectData");

      await ActiveEffectUpdater.setDisabledStatus(mockEffect, true);

      expect(spy).toHaveBeenCalledWith(mockEffect, { disabled: true });
      expect(mockEffect.update).toHaveBeenCalledWith({ disabled: true });
      
      spy.mockRestore();
    });

    it("deve retornar undefinded e não fazer nada se effect for null", async () => {
      const spy = vi.spyOn(ActiveEffectUpdater, "updateEffectData");

      const result = await ActiveEffectUpdater.setDisabledStatus(null, true);

      expect(result).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });
});

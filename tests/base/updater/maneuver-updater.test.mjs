import { describe, expect, it, vi, beforeEach } from "vitest";
import { ManeuverUpdater } from "../../../module/base/updater/maneuver-updater.mjs";
import { ManeuverType } from "../../../module/enums/maneuver-enums.mjs";
import { NotificationsUtils } from "../../../module/creators/message/notifications.mjs";

describe("ManeuverUpdater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateManeuver", () => {
    it("não deve atualizar se o documento for embedded e readonly", async () => {
      const mockDocument = {
        isEmbedded: true,
        update: vi.fn(),
        system: {
          [ManeuverType.IS_READ_ONLY.id]: true
        }
      };

      await ManeuverUpdater.updateManeuver(mockDocument, "system.skill", "Luta");
      expect(mockDocument.update).not.toHaveBeenCalled();
    });

    it("deve abortar e notificar erro se atributos primário e secundário forem iguais (estado atual)", async () => {
      const mockDocument = {
        isEmbedded: false,
        update: vi.fn(),
        system: {
          [ManeuverType.PRIMARY_ATTRIBUTE.id]: "for",
          [ManeuverType.SECONDARY_ATTRIBUTE.id]: "for"
        }
      };
      
      const spy = vi.spyOn(NotificationsUtils, "error").mockImplementation(() => {});

      await ManeuverUpdater.updateManeuver(mockDocument, "system.skill", "Luta");

      expect(spy).toHaveBeenCalledWith("S0.Aviso.Erro.Atributos_Iguais");
      expect(mockDocument.update).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });
    
    it("deve abortar se ao aplicar o update atributos primário e secundário ficarem iguais", async () => {
      const mockDocument = {
        isEmbedded: false,
        update: vi.fn(),
        system: {
          [ManeuverType.PRIMARY_ATTRIBUTE.id]: "for",
          [ManeuverType.SECONDARY_ATTRIBUTE.id]: "des"
        }
      };
      
      const spy = vi.spyOn(NotificationsUtils, "error").mockImplementation(() => {});

      // Alterando o secundário para 'for'
      await ManeuverUpdater.updateManeuver(mockDocument, `system.${ManeuverType.SECONDARY_ATTRIBUTE.id}`, "for");

      expect(spy).toHaveBeenCalledWith("S0.Aviso.Erro.Atributos_Iguais");
      expect(mockDocument.update).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it("deve atualizar normalmente se as regras de negócio forem cumpridas", async () => {
      const mockDocument = {
        isEmbedded: false,
        update: vi.fn(),
        system: {
          [ManeuverType.PRIMARY_ATTRIBUTE.id]: "for",
          [ManeuverType.SECONDARY_ATTRIBUTE.id]: "des"
        }
      };
      
      const spy = vi.spyOn(NotificationsUtils, "error").mockImplementation(() => {});

      await ManeuverUpdater.updateManeuver(mockDocument, `system.${ManeuverType.PRIMARY_ATTRIBUTE.id}`, "con");

      expect(spy).not.toHaveBeenCalled();
      expect(mockDocument.update).toHaveBeenCalledWith({ [`system.${ManeuverType.PRIMARY_ATTRIBUTE.id}`]: "con" });
      
      spy.mockRestore();
    });
  });
});

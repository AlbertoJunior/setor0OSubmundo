import { FoundryApi } from "../../api/foundry-api.mjs";
import { ICONS_PATH } from "../../constants.mjs";
import { logTable, localize } from "../../utils/utils.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";

export class PreCreateItemHookHandle {
  static DEFAULT_ICONS = {
    [ItemType.MELEE]: `${ICONS_PATH}/melee.svg`,
    [ItemType.PROJECTILE]: "icons/svg/target.svg",
    [ItemType.ARMOR]: "icons/svg/shield.svg",
    [ItemType.SUBSTANCE]: `${ICONS_PATH}/substance.svg`,
    [ItemType.VEHICLE]: "icons/svg/tank.svg",
    [ItemType.ACESSORY]: "icons/svg/clockwork.svg",
    [ItemType.TRAIT]: "icons/svg/aura.svg",
    [ItemType.ENHANCEMENT]: "icons/svg/upgrade.svg",
    [ItemType.MANEUVER]: "icons/svg/combat.svg"
  };

  static async validateDefaultIcons() {
    const fallbackIcon = "icons/svg/item-bag.svg";
    const logResults = [];

    const promises = Object.entries(this.DEFAULT_ICONS)
      .map(async ([type, path]) => {
        if (path === fallbackIcon) {
          logResults.push({ Type: type, Status: "Ignorado", Error: "Usa item-bag.svg" });
          return;
        }

        try {
          const fileExists = await FoundryApi.Canvas.srcExists(path);
          if (!fileExists) {
            this.DEFAULT_ICONS[type] = fallbackIcon;
            logResults.push({ Type: type, Status: "Falha", Error: `Fallback para item-bag (path: ${path})` });
          } else {
            logResults.push({ Type: type, Status: "Sucesso", Error: "-" });
          }
        } catch (e) {
          this.DEFAULT_ICONS[type] = fallbackIcon;
          logResults.push({ Type: type, Status: "Erro", Error: `Exceção ao validar o path: ${path}` });
        }
      });

    await Promise.allSettled(promises);

    logTable('Validação de Ícones Padrão dos Itens', logResults);
  }

  static handle(item, data, options, userId) {
    if (item.type === ItemType.MANEUVER && item.actor) {
      return this.#handleManeuverCreation(item, data);
    }
  }

  static #handleManeuverCreation(item, data) {
    const existing = item.actor.items.find(i => i.type === ItemType.MANEUVER && i.name === item.name);
    if (existing) {
      NotificationsUtils.warning(localize('Itens.Mensagens.Nao_Pode_Manobras_Iguais'));
      return false;
    }

    const sourceId = item.flags?.core?.sourceId || data.flags?.core?.sourceId;
    if (sourceId) {
      item.updateSource({ [ManeuverType.IS_READ_ONLY.system]: true });
    }
  }
}

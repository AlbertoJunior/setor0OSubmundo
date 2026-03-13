import { FoundryApi } from "../../api/foundry-api.mjs";
import { ICONS_PATH } from "../../constants.mjs";
import { logTable } from "../../utils/utils.mjs";

export class PreCreateItemHookHandle {
  static DEFAULT_ICONS = {
    Melee: `${ICONS_PATH}/melee.svg`,
    Projectile: "icons/svg/target.svg",
    Armor: "icons/svg/shield.svg",
    Substance: `${ICONS_PATH}/substance.svg`,
    Vehicle: "icons/svg/tank.svg",
    Acessory: "icons/svg/clockwork.svg",
    Trait: "icons/svg/aura.svg",
    Enhancement: "icons/svg/upgrade.svg"
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
    // if (item.img === "icons/svg/item-bag.svg" || !item.img) {
    //   const typeIcon = this.DEFAULT_ICONS[item.type];
    //   if (typeIcon) {
    //     item.updateSource({ img: typeIcon });
    //   }
    // }
  }
}

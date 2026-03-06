import { FoundryApi } from "../../api/foundry-api.mjs";
import { PreCreateItemHookHandle } from "../../hooks/pre-create-item.mjs";

export function configureSetor0Item() {
  CONFIG.Item.documentClass = Setor0Item;
}

class Setor0Item extends FoundryApi.Item {
  static getDefaultArtwork(itemData) {
    const iconPath = PreCreateItemHookHandle.DEFAULT_ICONS[itemData?.type] ?? null
    return iconPath ? { img: iconPath } : super.getDefaultArtwork(itemData)
  }
}
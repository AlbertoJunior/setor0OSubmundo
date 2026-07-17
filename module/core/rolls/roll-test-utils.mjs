import { MacroUtils } from "../macro/macro-utils.mjs";
import { createCustomRollableMacro } from "../../core/macro/commands/custom-rollable.mjs";
import { FolderUtils } from "../../utils/folder-utils.mjs";

export class RollTestUtils {
  static async createMacroByRollTestData(rollTestData, params = {}) {
    const { img, parentName, actor, type } = params
    const safeParentName = parentName ? `${parentName}: ` : '';

    const name = `${safeParentName}${rollTestData.name}`;
    const command = createCustomRollableMacro(rollTestData);
    const flags = {
      sourceId: rollTestData.id
    };

    let folderId = null;
    if (actor) {
      folderId = await FolderUtils.getCharacterMacroFolderId(actor, type);
    }

    await MacroUtils.createMacro({ name, command, img, flags, folder: folderId, toHotbar: true });
  }
}
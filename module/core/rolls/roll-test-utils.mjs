import { MacroUtils } from "../macro/macro-utils.mjs";
import { createCustomRollableMacro } from "../../core/macro/commands/custom-rollable.mjs";

export class RollTestUtils {
  static async createMacroByRollTestData(rollTestData, params = {}) {
    const { img, parentName } = params
    const safeParentName = parentName ? `${parentName}: ` : '';

    const name = `${safeParentName}${rollTestData.name}`;
    const command = createCustomRollableMacro(rollTestData);
    const flags = {
      sourceId: rollTestData.id
    };
    await MacroUtils.createMacro({ name, command, img, flags });
  }
}
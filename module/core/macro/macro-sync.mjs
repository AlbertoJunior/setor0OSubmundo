import { FoundryApi } from "../../api/foundry-api.mjs";
import { SYSTEM_ID, SYSTEM_FLAGS } from "../../constants.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FolderUtils } from "../../utils/folder-utils.mjs";
import { MacroUtils } from "./macro-utils.mjs";

export class MacroSync {
  static async verifyDefaultMacroCompendium() {
    const packId = `${SYSTEM_ID}.macros`;
    const pack = game.packs.get(packId);
    if (!pack) {
      console.error(`Compêndio ${packId} não encontrado.`);
      return;
    }

    const missingMacros = await this.verifyMissingMacros(pack);
    if (missingMacros.length === 0) {
      return;
    }

    const roles = new Set(
      missingMacros.map(macro => FlagsUtils.getSystemFlag(macro, SYSTEM_FLAGS.ROLE)?.toUpperCase()).filter(Boolean)
    );
    const folders = {};

    const wasLocked = pack.locked;
    if (wasLocked) {
      await pack.configure({ locked: false });
    }

    for (const role of roles) {
      const folder = await FolderUtils.getOrCreateMacroFolder(role);
      folders[role] = folder;
      await pack.importFolder(folder);
    }

    for (const macroItem of missingMacros) {
      try {
        const role = FlagsUtils.getSystemFlag(macroItem, SYSTEM_FLAGS.ROLE)?.toUpperCase();
        const folder = folders[role];

        const macroDoc = await FoundryApi.Macro.create({
          ...macroItem,
          folder: folder
        });

        await pack.importDocument(macroDoc);
        await macroDoc.delete();
      } catch (e) {
        console.error(`Erro ao importar macro '${macroItem.name}':`, e);
      }
    }

    if (wasLocked) {
      await pack.configure({ locked: true });
    }

    console.log(`-> ${missingMacros.length} macros adicionadas no compêndio: ${packId}`);
  }

  static async verifyMissingMacros(pack) {
    const compendiumMacros = await pack.getDocuments();
    const defaultMacros = MacroUtils.getDefaultMacroUsers();
    const gmMacros = MacroUtils.getDefaultGmMacro();

    const allMacros = [...defaultMacros, ...gmMacros];

    return allMacros.filter(macroA => !compendiumMacros.some(macroB => MacroUtils.isTheSameMacro(macroA, macroB)));
  }
}

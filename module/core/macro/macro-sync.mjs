import { COLORS, SYSTEM_ID } from "../../constants.mjs";
import { MacroUtils } from "./macro-utils.mjs";

export class MacroSync {
    static async verifyDefaultMacroCompendium() {
        const packId = `${SYSTEM_ID}.macros`;
        const pack = game.packs.get(packId);
        if (!pack) {
            console.error(`Compêndio ${packId} não encontrado.`);
            return;
        }

        const compendiumMacros = await pack.getDocuments();
        const defaultMacros = MacroUtils.getDefaultMacroUsers();
        const gmMacros = MacroUtils.getDefaultGmMacro();

        const allMacros = [...defaultMacros, ...gmMacros];

        const missing = allMacros.filter(macroA => !compendiumMacros.some(macroB => MacroUtils.isTheSameMacro(macroA, macroB)));
        if (missing.length === 0) {
            return;
        }

        const roles = new Set(missing.map(macro => macro.flags[SYSTEM_ID]?.role.toUpperCase()));
        const folders = {};

        const wasLocked = pack.locked;
        if (wasLocked) {
            await pack.configure({ locked: false });
        }

        for (const role of roles) {
            const folder = await this.#getOrCreateMacroFolder(role);
            folders[role] = folder;
            await pack.importFolder(folder);
        }

        for (const item of missing) {
            try {
                const role = item.flags[SYSTEM_ID]?.role.toUpperCase();
                const folder = folders[role];

                const macroDoc = await Macro.create({
                    ...item,
                    folder: folder
                });

                await pack.importDocument(macroDoc);
                await macroDoc.delete();
            } catch (e) {
                console.error(`Erro ao importar macro '${item.name}':`, e);
            }
        }

        if (wasLocked) {
            await pack.configure({ locked: true });
        }

        console.log(`-> ${missing.length} macros adicionadas no compêndio: ${packId}`);
    }

    static async #getOrCreateMacroFolder(folderName) {
        let folder = game.folders.find(f => f.name === folderName && f.type === "Macro");
        if (!folder) {
            const folderColor = this.#getFolderColor(folderName);
            folder = await Folder.create({
                name: folderName,
                type: "Macro",
                color: folderColor
            });
        }
        return folder;
    }

    static #getFolderColor(role) {
        const upperRole = role.toUpperCase();

        switch (upperRole) {
            case "GM":
                return COLORS.BASE.red;
            case "USER":
                return COLORS.BASE.blue;
            default:
                return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
        }
    }
}

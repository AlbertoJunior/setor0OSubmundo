import { FoundryApi } from "../../api/foundry-api.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { MacroUtils } from "./macro-utils.mjs";

export class MacroInstaller {
    static async installDefaultMacrosOnUser() {
        await this.installList(MacroUtils.getDefaultMacroUsers());
    }

    static async installDefaultMacrosOnGm() {
        await this.installList(MacroUtils.getDefaultGmMacro());
    }

    static async installList(list) {
        for (const macro of list) {
            await this.installMacroOnce(macro.name, FlagsUtils.getMacroFlag(macro, SystemFlags.MACRO.SOURCE_ID));
        }
    }

    static async installMacroOnce(macroName, sourceId) {
        const user = game.user;
        const installedMacros = FlagsUtils.getItemFlag(user, SystemFlags.MACRO.INSTALLED) || [];
        const macroKey = `${macroName}_${sourceId}`;

        if (installedMacros.includes(macroKey)) {
            return;
        }

        const packId = `${SYSTEM_ID}.macros`;
        const pack = game.packs.get(packId);
        if (!pack) {
            console.error(`Compêndio ${packId} não encontrado.`);
            return;
        }

        const macros = await pack.getDocuments();
        const macro = macros.find(m => m.name === macroName && FlagsUtils.getMacroFlag(m, SystemFlags.MACRO.SOURCE_ID) && sourceId);
        if (!macro) {
            console.warn(`Macro "${macroName}" não encontrada no compêndio ${packId}.`);
            return;
        }

        let worldMacro = game.macros.find(macroB => MacroUtils.isTheSameMacro(macro, macroB));
        if (!worldMacro) {
            worldMacro = await FoundryApi.Macro.create(macro.toObject());
        }

        await user.assignHotbarMacro(worldMacro);
        NotificationsUtils.info(`Macro "${macroName}" adicionada à sua hotbar.`);

        await FlagsUtils.setItemFlag(user, 'macroInstalled', [...installedMacros, macroKey]);
    }
}
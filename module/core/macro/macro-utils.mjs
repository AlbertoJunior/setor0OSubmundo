import { getObject, normalizeString, localize } from "../../utils/utils.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";
import { RollManeuver } from "../actor/roll-maneuver.mjs";
import { shortcutCustomRoll } from "../../base/sheet/actor/player/methods/shortcut-methods.mjs";
import { rollByItemAndRollId } from "../../base/sheet/equipment/methods/equipment-item-roll-methods.mjs";
import { SYSTEM_ID } from "../../constants.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType } from "../../enums/equipment-enums.mjs";
import { DefaultActions } from "../../utils/default-actions.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { ActorEquipmentUtils } from "../actor/actor-equipment-utils.mjs";
import { openBagMacroData } from "./default/open-bag.mjs";
import { openShortcutMacroData } from "./default/open-shortcut.mjs";
import { rollOverloadMacroData } from "./default/roll-overload.mjs";
import { openRollMacroData } from "./default/open-roll.mjs";
import { ActorRollDialog } from "../../creators/dialog/actor-roll-dialog.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { CompendiumExport } from "../pack/compendium-export.mjs";
import { CompendiumSync } from "../pack/compendium-sync.mjs";
import { SystemFlags } from "../../enums/flags-enums.mjs";
import { cleanMacroHotbarUserMacroData } from "./gm/clean-macro-hotbar.mjs";
import { resetUserFlagsMacroData } from "./gm/reset-user-flags.mjs";
import { exportCompendiunsMacroData } from "./gm/export-compendium-json.mjs";

export class MacroUtils {
  static MacroMethods = {
    rollDialog: async (actor) => {
      ActorRollDialog.open(actor);
    },
    overload: async (actor) => {
      await DefaultActions.processOverloadRoll(actor);
    },
    customs: {
      rollable: async (params) => {
        const { actor, id } = params;
        if (!actor || !id) {
          console.log("-> Elementos inválidos")
          return;
        }

        if (!actor?.sheet.canRollOrEdit) {
          NotificationsUtils.warning(localize("S0.Aviso.Erro.Sem_Permissao"));
          return
        }

        const item = ActorEquipmentUtils.getEquipments(actor).find(item => {
          const tests = getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS) || [];
          return tests.some(test => test.id === id);
        });

        if (item) {
          if (getObject(item, EquipmentCharacteristicType.EQUIPPED) || false) {
            await rollByItemAndRollId(item, id);
          } else {
            NotificationsUtils.info(`O Item [${item.name}] precisa estar equipado`);
          }
          return;
        }

        const maneuver = actor.items.get(id);
        if (maneuver && maneuver.type === ItemType.MANEUVER) {
          await RollManeuver.roll(actor, maneuver);
          return;
        }

        const actorTestShortcut = getObject(actor, CharacteristicType.SHORTCUTS).find(test => test.id == id);
        if (actorTestShortcut) {
          await shortcutCustomRoll(actor, id);
          return;
        }

        NotificationsUtils.warning(localize("S0.Aviso.Erro.Executar_Teste"));
      }
    },
    exportCompendium: async () => {
      await CompendiumExport.exportCompendiumsToJson();
    },
    clearFolders: async () => {
      await CompendiumSync.clear();
    }
  };

  static getDefaultMacroUsers() {
    return [
      openRollMacroData,
      rollOverloadMacroData,
      openBagMacroData,
      openShortcutMacroData,
    ];
  }

  static getDefaultGmMacro() {
    return [
      cleanMacroHotbarUserMacroData,
      resetUserFlagsMacroData,
      // exportCompendiunsMacroData, TODO verificar se vai ser usado
    ];
  }

  static async createMacro(params = {}) {
    const { name, command, img, toHotbar = false, flags, folder } = params;

    const normalizedName = normalizeString(name);
    const normalizedCommand = normalizeString(command);
    let macro = game.macros.find(m => normalizeString(m.name) === normalizedName && normalizeString(m.command) === normalizedCommand);
    if (!macro) {
      macro = await FoundryApi.Macro.create({
        flags: {
          [SYSTEM_ID]: {
            ...flags
          }
        },
        name,
        type: "script",
        command,
        img,
        folder: folder,
      });

      if (toHotbar) {
        await game.user.assignHotbarMacro(macro);
        const slot = Object.values(game.user.hotbar).length;
        NotificationsUtils.info(`Macro "${name}" adicionada ao espaço [${slot}].`);
      } else {
        NotificationsUtils.info(`Macro "${name}" criada.`);
      }
    } else {
      NotificationsUtils.info(`Você já possui essa Macro.`);
    }

    return macro;
  }

  static isTheSameMacro(macroA, macroB) {
    const sourceIdA = FlagsUtils.getSystemFlag(macroA, SystemFlags.SOURCE.ID);
    const sourceIdB = FlagsUtils.getSystemFlag(macroB, SystemFlags.SOURCE.ID);

    const sameName = normalizeString(macroA.name) === normalizeString(macroB.name);
    const sameCommand = normalizeString(macroA.command) === normalizeString(macroB.command);
    const sameSourceId = sourceIdA === sourceIdB;

    return sameName && sameCommand && sameSourceId;
  }
}
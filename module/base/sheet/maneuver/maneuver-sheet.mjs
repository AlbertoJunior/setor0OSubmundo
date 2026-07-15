import { SYSTEM_ID, TEMPLATES_PATH } from "../../../constants.mjs";
import { RollTestUtils } from "../../../core/rolls/roll-test-utils.mjs";
import { SocketUtils } from "../../../core/socket/socket-utils.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { loadAndRegisterTemplates } from "../../../setup/templates.mjs";
import { menuHandleMethods } from "../../menu-default-methods.mjs";
import { SystemFlags } from "../../../enums/flags-enums.mjs";
import { AttributeRepository } from "../../../repository/attribute-repository.mjs";
import { AbilityRepository } from "../../../repository/ability-repository.mjs";
import { ItemType } from "../../../enums/item-type-enums.mjs";
import { ManeuverUpdater } from "../../updater/maneuver-updater.mjs";
import { OwnershipUtils } from "../../../utils/ownership-utils.mjs";
import { MacroTypesEnum } from "../../../enums/macro-enums.mjs";

export async function maneuverTemplatesRegister() {
  const templates = [
    { path: "items/maneuvers/maneuver-sheet" }
  ];

  return await loadAndRegisterTemplates(templates);
}

export async function registerManeuver() {
  await FoundryApi.Items.registerSheet(SYSTEM_ID, ManeuverSheet, {
    types: [ItemType.MANEUVER],
    makeDefault: true
  });
}

export class ManeuverSheet extends FoundryApi.ItemSheet {
  static SHEET_CONFIG = {
    templates: [
      { name: 'maneuver', template: `${TEMPLATES_PATH}/items/maneuvers/maneuver-sheet.hbs` }
    ],
    width: 400,
    resizable: true,
    classes: ['S0-maneuver-sheet'],
    actions: [
      ...SocketUtils.shareDocumentActions,
      {
        id: "createMacro",
        enabled: () => true,
        icon: "fas fa-code",
        label: "Criar_Macro",
        action: async function () {
          await RollTestUtils.createMacroByRollTestData(this.document, {
            img: this.document.img,
            actor: this.document.actor,
            type: MacroTypesEnum.MANOBRA
          });
        }
      }
    ]
  };

  get mapEvents() {
    return {
      menu: menuHandleMethods
    };
  }

  get thisDocument() {
    return this.item;
  }

  get isEditable() {
    return FlagsUtils.getItemFlag(this.item, 'editable', false);
  }

  get isDisabled() {
    return !this.isEditable;
  }

  get canEdit() {
    if (this.options.editable === false) return false;
    return game.user.isGM
      || OwnershipUtils.canEdit(this.item)
      || this.item.getFlag(SYSTEM_ID, SystemFlags.MANAGER.CAN_EDIT);
  }

  getData() {
    const data = super.getData();
    data.canEdit = this.canEdit;
    data.system = this.item.system;

    data.attributes = AttributeRepository.getItems();
    data.abilities = AbilityRepository.getItems();

    return data;
  }

  async updateDocument(document, keyToUpdate, value) {
    await ManeuverUpdater.updateManeuver(document, keyToUpdate, value);
  }
}
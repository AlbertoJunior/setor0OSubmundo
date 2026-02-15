import { SYSTEM_ID, REGISTERED_TEMPLATES, TEMPLATES_PATH, SYSTEM_CLASS_CSS } from "../../../constants.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { HtmlJsUtils } from "../../../utils/html-js-utils.mjs";
import { loadAndRegisterTemplates } from "../../../utils/templates.mjs";
import { menuHandleMethods } from "../../menu-default-methods.mjs";
import { handlerEquipmentCharacteristicsEvents } from "./methods/equipment-characteristics-methods.mjs";
import { handlerEquipmentItemRollEvents } from "./methods/equipment-item-roll-methods.mjs";
import { handlerEquipmentMenuRollEvents } from "./methods/equipment-menu-roll-methods.mjs";
import { handlerSuperEquipmentEvents } from "./methods/superequipment-methods.mjs";
import { EquipmentUpdater } from "../../updater/equipment-updater.mjs";

export async function equipmentTemplatesRegister() {
  const templates = [
    { path: "items/sheet/armor" },
    { path: "items/sheet/acessory" },
    { path: "items/sheet/melee" },
    { path: "items/sheet/projectile" },
    { path: "items/sheet/substance" },
    { path: "items/sheet/vehicle" },
    { path: "items/others/equipment-bag-item", call: 'equipamentBagItem' },
    { path: "items/others/equipment-equipped-item", call: 'equipamentEquippedItem' },
    { path: "items/others/common-equipment", call: "itemCommon" },
    { path: "items/others/common-weapon", call: "itemCommonWeapon" },
    { path: "items/others/common-resistance", call: "itemCommonResistance" },
    { path: "items/others/common-description", call: "itemCommonDescription" },
    { path: "items/others/rollable-tests", call: "itemRollableTests" },
    { path: "items/others/superequipment", call: "itemSuperEquipment" },
  ];

  return await loadAndRegisterTemplates(templates);
}

export async function registerEquipment() {
  await FoundryApi.Items.unregisterSheet("core", FoundryApi.ItemSheet);
  await FoundryApi.Items.registerSheet(SYSTEM_ID, EquipmentSheet, {
    types: ["Melee", "Projectile", "Armor", "Vehicle", "Substance", "Acessory"],
    makeDefault: true
  });
}

class EquipmentSheet extends FoundryApi.ItemSheet {
  static DEFAULT_OPTIONS = {
    classes: ['S0-sheet-item'],
    position: {
      width: 340,
    },
    window: {
      resizable: true,
    }
  };

  static PARTS = {
    acessory: {
      template: `${TEMPLATES_PATH}/items/sheet/acessory.hbs`,
    },
    armor: {
      template: `${TEMPLATES_PATH}/items/sheet/armor.hbs`,
    },
    melee: {
      template: `${TEMPLATES_PATH}/items/sheet/melee.hbs`,
    },
    projectile: {
      template: `${TEMPLATES_PATH}/items/sheet/projectile.hbs`,
    },
    substance: {
      template: `${TEMPLATES_PATH}/items/sheet/substance.hbs`,
    },
    vehicle: {
      template: `${TEMPLATES_PATH}/items/sheet/vehicle.hbs`,
    },
  };

  constructor(...args) {
    super(...args);
    this.isExpandedTests = false;
    this.defaultHeight = undefined;
    this.newHeight = undefined;
  }

  //#region APPLICATION V1
  /* Only run on Application V1 */
  static get defaultOptions() {
    return FoundryApi.mergeObject(super.defaultOptions, {
      template: `${TEMPLATES_PATH}/items/default.hbs`,
      width: this.DEFAULT_OPTIONS.position.width,
    });
  }

  get template() {
    const type = this.item.type.toLowerCase();
    const path = `${TEMPLATES_PATH}/items/sheet/${type}.hbs`;

    if (REGISTERED_TEMPLATES.has(path)) {
      return path;
    }

    return `${TEMPLATES_PATH}/items/default.hbs`
  }
  //#endregion

  //#region APPLICATION V2
  /* Only run on Application V2 */
  _operateMultiParts(document, parts) {
    return parts.filter(part => part == document.type.toLocaleLowerCase());
  }
  //#endregion

  get mapEvents() {
    return {
      menu: menuHandleMethods,
      item_roll: handlerEquipmentItemRollEvents,
      menu_roll: handlerEquipmentMenuRollEvents,
      characteristic: handlerEquipmentCharacteristicsEvents,
      superequipment: handlerSuperEquipmentEvents,
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

  getData() {
    const data = super.getData();
    data.canEdit = game.user.isGM || this.item.getFlag(SYSTEM_ID, 'canEdit');
    return data;
  }

  async updateDocument(document, keyToUpdate, value) {
    await EquipmentUpdater.updateEquipment(document, keyToUpdate, value);
  }

  postRenderConfiguration(html) {
    super.postRenderConfiguration(html);
    this.#presetSheetExpandContainer(html);
  }

  #presetSheetExpandContainer(html) {
    const rollableTestsList = html.querySelector('#rollable-tests-list');
    if (rollableTestsList) {
      rollableTestsList.classList.toggle('S0-expanded', this.isExpandedTests);
    }

    const chevron = html.querySelector('.fa-chevron-down');
    if (this.isExpandedTests && chevron) {
      HtmlJsUtils.flipClasses(chevron, 'fa-chevron-up', 'fa-chevron-down');
    }

    requestAnimationFrame(() => {
      const appElement = html.closest(`.${SYSTEM_CLASS_CSS}`);
      const content = appElement?.querySelector('.window-content') || appElement;
      if (!content) return;

      if (!this.defaultHeight) {
        this.defaultHeight = appElement?.offsetHeight;
      }

      if (this.isExpandedTests) {
        content.style.height = `${Math.max(this.defaultHeight, this.newHeight)}px`
      }
    });
  }
}
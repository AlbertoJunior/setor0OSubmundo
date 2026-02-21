import { SYSTEM_ID, TEMPLATES_PATH, SYSTEM_CLASS_CSS } from "../../../constants.mjs";
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
  await FoundryApi.Items.registerSheet(SYSTEM_ID, EquipmentSheet, {
    types: ["Melee", "Projectile", "Armor", "Vehicle", "Substance", "Acessory"],
    makeDefault: true
  });
}

class EquipmentSheet extends FoundryApi.ItemSheet {
  static SHEET_CONFIG = {
    templates: [
      { name: 'acessory', template: `${TEMPLATES_PATH}/items/sheet/acessory.hbs` },
      { name: 'armor', template: `${TEMPLATES_PATH}/items/sheet/armor.hbs` },
      { name: 'melee', template: `${TEMPLATES_PATH}/items/sheet/melee.hbs` },
      { name: 'projectile', template: `${TEMPLATES_PATH}/items/sheet/projectile.hbs` },
      { name: 'substance', template: `${TEMPLATES_PATH}/items/sheet/substance.hbs` },
      { name: 'vehicle', template: `${TEMPLATES_PATH}/items/sheet/vehicle.hbs` },
      { name: 'default', template: `${TEMPLATES_PATH}/items/default.hbs` }
    ],
    width: 340,
    resizable: false,
    classes: []
  };

  constructor(...args) {
    super(...args);
    this.isExpandedTests = false;
    this.defaultHeight = undefined;
    this.newHeight = undefined;
  }

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
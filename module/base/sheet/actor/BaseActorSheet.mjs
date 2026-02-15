import { getObject, selectCharacteristic } from "../../../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../../core/actor/actor-equipment-utils.mjs";
import { BaseActorCharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType } from "../../../enums/equipment-enums.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { HtmlJsUtils } from "../../../utils/html-js-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { ActorUpdater } from "../../updater/actor-updater.mjs";

export class Setor0BaseActorSheet extends FoundryApi.ActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['actor'],
    window: {
      resizable: false,
      controls: []
    }
  };

  constructor(...args) {
    super(...args);
    this.currentPage = 1;
  }

  get thisDocument() {
    return this.actor;
  }

  get isEditable() {
    return FlagsUtils.getActorFlag(this.actor, "editable") && this.canRollOrEdit;
  }

  get canRollOrEdit() {
    return game.user.isGM || this.actor.isOwner;
  }

  get isDisabled() {
    return !(this.isEditable && this.canRollOrEdit);
  }

  getData() {
    const data = super.getData();
    if (data.options) {
      data.options.sheetConfig = Setor0BaseActorSheet.DEFAULT_OPTIONS.sheetConfig;
    }
    data.editable = this.isEditable;
    data.canRoll = this.canRollOrEdit;
    data.canEdit = this.canRollOrEdit;
    data.uuid = this.actor.uuid;
    return data;
  }

  configureSheet(html) {
    super.configureSheet(html);
    this._setupAutoTabs(html);
  }

  async updateDocument(document, keyToUpdate, value) {
    await ActorUpdater.verifyAndUpdateActor(document, keyToUpdate, value);
  }

  static presetStatusVitality(html, actor) {
    let letalDamage = getObject(actor, BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) || 0;
    let superFicialDamage = getObject(actor, BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE) || 0;

    const vitalityContainer = html.querySelector('#vitalidade');
    if (!vitalityContainer) return;

    vitalityContainer.querySelectorAll('.S0-characteristic-temp').forEach((item) => {
      if (superFicialDamage > 0) {
        item.classList.add('S0-superficial');
        superFicialDamage--;
      } else if (letalDamage > 0) {
        item.classList.add('S0-letal');
        letalDamage--;
      }
    });
  }

  static presetStatusProtect(html, actor) {
    const armor = ActorEquipmentUtils.getEquippedArmorItem(actor);
    if (!armor) {
      return;
    }

    const value = getObject(armor, EquipmentCharacteristicType.ACTUAL_RESISTANCE) || 0;
    const protectContainer = html.querySelector('#protect');
    if (protectContainer) {
      const characteristics = protectContainer.querySelectorAll('.S0-characteristic');
      const target = characteristics[value - 1];
      if (target) selectCharacteristic(target);
    }
  }

  static setupTabs(html, currentPage) {
    const group = "menu-tabs";
    const contentSelector = `.S0-nav-content`;

    HtmlJsUtils.setupTabs(html, group, contentSelector, currentPage - 1, (tab, index) => {
      if (index !== -1) {
        currentPage = index + 1;
      }
    });
  }

  _setupAutoTabs(html) {
    const group = "menu-tabs";
    const contentSelector = `.S0-nav-content`;

    HtmlJsUtils.setupTabs(html, group, contentSelector, this.currentPage - 1, (tab, index) => {
      if (index !== -1) {
        this.currentPage = index + 1;
      }
    });
  }
}
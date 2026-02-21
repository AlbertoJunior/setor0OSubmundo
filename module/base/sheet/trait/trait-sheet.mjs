import { SYSTEM_ID, TEMPLATES_PATH } from "../../../constants.mjs";
import { FlagsUtils } from "../../../utils/flags-utils.mjs";
import { FoundryApi } from "../../../api/foundry-api.mjs";
import { loadAndRegisterTemplates } from "../../../utils/templates.mjs";
import { menuHandleMethods } from "../../menu-default-methods.mjs";
import { handlerTraitCharacteristicsEvents } from "./methods/trait-effects-methods.mjs";
import { localize } from "../../../utils/utils.mjs";

export async function traitTemplatesRegister() {
  const templates = [
    { path: "traits/trait-sheet" }
  ];

  return await loadAndRegisterTemplates(templates);
}

export async function registerTrait() {
  await FoundryApi.Items.registerSheet(SYSTEM_ID, TraitSheet, {
    types: ["Trait"],
    makeDefault: true
  });
}

export class TraitSheet extends FoundryApi.ItemSheet {
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
    trait: {
      template: `${TEMPLATES_PATH}/traits/trait-sheet.hbs`,
    },
  };

  //#region APPLICATION V1
  /* Only run on Application V1 */
  static get defaultOptions() {
    return FoundryApi.mergeObject(super.defaultOptions, {
      template: `${TEMPLATES_PATH}/traits/trait-sheet.hbs`,
      width: this.DEFAULT_OPTIONS.position.width,
    });
  }

  get template() {
    return `${TEMPLATES_PATH}/traits/trait-sheet.hbs`;
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
      characteristic: handlerTraitCharacteristicsEvents,
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
    data.system = this.item.system;

    data.traitTypes = {
      'good': localize('Traco.Bom'),
      'bad': localize('Traco.Ruim')
    };

    data.morphologies = {
      '': localize('Todas'),
      'Androide': localize('Androide'),
      'Ciborgue': localize('Ciborgue'),
      'Sintético': localize('Sintetico'),
    };

    return data;
  }
}

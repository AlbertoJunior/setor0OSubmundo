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
  static SHEET_CONFIG = {
    templates: [
      { name: 'trait', template: `${TEMPLATES_PATH}/traits/trait-sheet.hbs` }
    ],
    width: 340,
    resizable: true,
    classes: ['S0-trait-sheet']
  };

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

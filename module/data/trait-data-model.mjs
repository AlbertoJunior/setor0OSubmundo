import { SYSTEM_ID, TEMPLATES_PATH } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { TODO } from "../utils/utils.mjs";

const { NumberField, StringField, BooleanField } = foundry.data.fields;

class TraitDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      xp: new NumberField({ required: true, initial: 0, min: 0, label: "S0.Custo" }),
      description: new StringField({ required: true, label: "S0.Descricao" }),
      requirement: new StringField({ label: "S0.Requisito" }),
      type: new StringField({ required: true, initial: 'good', label: "S0.Tipo" }),
      haveParticularity: new BooleanField({ required: true, initial: false, label: "S0.Particularidade" }),
    };
  }

  static get defaultOptions() {
    TODO('isso está no lugar errado, deveria estar no TraitSheet');
    return FoundryApi.mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet", "item", "trait"],
      template: `${TEMPLATES_PATH}/traits/trait-sheet.hbs`,
      width: 600,
      height: 850
    });
  }
}

export async function createTraitDataModels() {
  CONFIG.Item.dataModels = {
    Trait: TraitDataModel
  };
}
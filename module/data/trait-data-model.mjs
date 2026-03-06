import { StandardEffectChangeField } from "../data/field/effect-fields.mjs";

const { NumberField, StringField, BooleanField, ArrayField } = foundry.data.fields;

class TraitDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      xp: new NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "S0.Custo" }),
      description: new StringField({ required: false, nullable: true, initial: null, label: "S0.Descricao" }),
      requirement: new StringField({ required: false, nullable: true, initial: null, label: "S0.Requisito" }),
      morph: new StringField({ required: false, nullable: true, initial: null, label: "S0.Morfologia" }),
      type: new StringField({ required: true, nullable: false, initial: 'good', label: "S0.Tipo" }),
      haveParticularity: new BooleanField({ required: true, nullable: false, initial: false, label: "S0.Particularidade" }),
      effects: new ArrayField(new StandardEffectChangeField()),
    };
  }
}

export async function createTraitDataModels() {
  Object.assign(CONFIG.Item.dataModels, {
    Trait: TraitDataModel
  });
}
const { NumberField, StringField, BooleanField, ArrayField, SchemaField } = foundry.data.fields;

export class TraitEffectField extends SchemaField {
  constructor({ key, value, typeOfValue, mode } = {}) {
    super({
      key: new StringField({ required: false, nullable: true, initial: key }),
      value: new NumberField({ required: false, integer: true, initial: value }),
      typeOfValue: new NumberField({ required: false, integer: true, initial: typeOfValue }),
      mode: new NumberField({ required: false, integer: true, initial: mode })
    }, { initial: null, nullable: true });

    this.key = key;
    this.value = value;
    this.typeOfValue = typeOfValue;
    this.mode = mode;
  }

  static toJson(data = {}) {
    const instance = new TraitEffectField(data);
    return instance.toObject(instance);
  }
}

class TraitDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      xp: new NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "S0.Custo" }),
      description: new StringField({ required: false, nullable: true, label: "S0.Descricao" }),
      requirement: new StringField({ required: false, nullable: true, label: "S0.Requisito" }),
      morph: new StringField({ required: false, nullable: true, initial: null, label: "S0.Morfologia" }),
      type: new StringField({ required: true, nullable: false, initial: 'good', label: "S0.Tipo" }),
      haveParticularity: new BooleanField({ required: true, nullable: false, initial: false, label: "S0.Particularidade" }),
      effects: new ArrayField(new TraitEffectField()),
    };
  }
}

export async function createTraitDataModels() {
  CONFIG.Item.dataModels = {
    Trait: TraitDataModel
  };
}
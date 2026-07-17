const { NumberField, SchemaField, StringField } = foundry.data.fields;

export class NpcSkill extends SchemaField {
  constructor(params = {}) {
    super({
      nome: new StringField({ required: true, label: "S0.Habilidade" }),
      valor: new NumberField({ integer: true, min: 0, initial: 0, max: 6, label: "S0.Valor" })
    });

    this.nome = params.nome || '';
    this.valor = params.valor || 0;
  }

  static toJson(skill, value) {
    const object = new NpcSkill({
      nome: skill,
      valor: value,
    });
    return object.toObject(object);
  }
}
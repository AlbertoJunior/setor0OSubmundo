const { NumberField, StringField, SchemaField } = foundry.data.fields;

export class ChangeField extends SchemaField {
  static getBaseChangeSchema({ key = null, value = 0, mode = CONST.ACTIVE_EFFECT_MODES.ADD } = {}) {
    return {
      key: new StringField({ required: false, nullable: true, initial: key }),
      value: new NumberField({ required: false, integer: true, initial: value }),
      mode: new NumberField({ required: false, integer: true, initial: mode })
    };
  }

  constructor({ key, value, mode } = {}) {
    super(ChangeField.getBaseChangeSchema({ key, value, mode }), { initial: null, nullable: true });
    this.key = key;
    this.value = value;
    this.mode = mode;
  }

  static toJson(data = {}) {
    const instance = new ChangeField(data);
    return instance.toObject(instance);
  }
}
import { ActiveEffectsTypes } from "../../enums/active-effects-enums.mjs";
import { EffectChangeValueType } from "../../enums/enhancement-enums.mjs";

const { NumberField, StringField, SchemaField, ArrayField } = foundry.data.fields;

export class StandardEffectChangeField extends SchemaField {
  constructor({ key = null, value = 0, mode = CONST.ACTIVE_EFFECT_MODES.ADD, typeOfValue = EffectChangeValueType.FIXED, otherValue = undefined } = {}) {
    super({
      key: new StringField({ required: false, nullable: true, initial: key }),
      value: new NumberField({ required: false, integer: true, initial: value }),
      mode: new NumberField({ required: false, integer: true, initial: mode }),
      typeOfValue: new NumberField({ required: true, integer: true, initial: typeOfValue }),
      otherValue: new StringField({ required: false, initial: otherValue }),
    }, { initial: null, nullable: true });

    this.key = key;
    this.value = value;
    this.mode = mode;
    this.typeOfValue = typeOfValue;
    this.otherValue = otherValue;
  }

  static toJson(data = {}) {
    const instance = new StandardEffectChangeField(data);
    return instance.toObject(instance);
  }
}

export class StandardEffectField extends SchemaField {
  constructor({ id, name, description, type, changes } = {}) {
    super({
      id: new StringField({ required: true, initial: '' }),
      name: new StringField({ required: false, initial: '' }),
      description: new StringField({ required: false, initial: '' }),
      type: new StringField({ required: false, initial: ActiveEffectsTypes.BUFF }),
      changes: new ArrayField(new StandardEffectChangeField()),
    }, { initial: null, nullable: true });

    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.changes = changes;
  }

  static toJson(data = {}) {
    const instance = new StandardEffectField(data);
    return instance.toObject(instance);
  }
}

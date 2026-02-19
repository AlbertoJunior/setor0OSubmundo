import { RollTestField } from "./roll-test-field.mjs";
import { EffectChangeValueType } from "../enums/enhancement-enums.mjs";
import { ChangeField } from "./change-field.mjs";

const { SchemaField, StringField, NumberField, ArrayField } = foundry.data.fields;

export class EnhancementEffectField extends SchemaField {
  constructor(id, name, level, overload, duration, requirement, effectChanges = [], possibleTests = [], description) {
    super({
      id: new StringField({ required: true, initial: '' }),
      name: new StringField({ required: true, initial: '' }),
      level: new NumberField({ required: true, integer: true, initial: 1, min: 1, max: 5 }),
      overload: new NumberField({ required: true, integer: true, initial: 0 }),
      duration: new StringField({ required: true, initial: '' }),
      description: new StringField({ required: false, initial: null, nullable: true }),
      requirement: new ArrayField(new StringField()),
      effectChanges: new ArrayField(new EnhancementEffectDataChange()),
      possible_tests: new ArrayField(new RollTestField()),
    });

    this.id = id;
    this.name = name;
    this.level = level;
    this.overload = overload;
    this.duration = duration;
    this.requirement = requirement;
    this.effectChanges = effectChanges;
    this.possible_tests = possibleTests;
    this.description = description;
  }

  static toJson(id, name, level, overload, duration, requirement, effectChanges = [], possibleTests = [], description) {
    const object = new EnhancementEffectField(id, name, level, overload, duration, requirement, effectChanges, possibleTests, description);
    return object.toObject(object);
  }
}

class EnhancementEffectDataChange extends SchemaField {
  constructor(key, value = 0) {
    super({
      ...ChangeField.getBaseChangeSchema({ key, value }),
      typeOfValue: new NumberField({ integer: true, required: true, initial: EffectChangeValueType.FIXED }),
      otherValue: new StringField({ required: false, initial: undefined }),
    });
  }
}
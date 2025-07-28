import { randomId } from "../utils/utils.mjs";

const { SchemaField, NumberField, StringField, BooleanField } = foundry.data.fields;

export class RollTestField extends SchemaField {
    constructor() {
        super({
            id: new StringField({ required: true, blank: false, initial: '', label: "S0.Id" }),
            name: new StringField({ required: true, blank: false, initial: '', label: "S0.Nome" }),
            primary_attribute: new StringField({ required: true, blank: false, initial: '', label: "S0.Atributo" }),
            secondary_attribute: new StringField({ required: true, blank: false, initial: '', label: "S0.Atributo" }),
            special_primary: new StringField({ required: false, blank: true, nullable: true, initial: '', label: "S0.Caracteristica" }),
            special_secondary: new StringField({ required: false, blank: true, nullable: true, initial: '', label: "S0.Caracteristica" }),
            ability: new StringField({ required: false, blank: true, nullable: true, initial: '', label: "S0.Habilidade" }),
            bonus: new NumberField({ required: false, initial: 0, label: "S0.Bonus" }),
            automatic: new NumberField({ required: false, initial: 0, label: "S0.Automatico" }),
            difficulty: new NumberField({ required: false, initial: 6, maxValue: 10, minValue: 5, label: "S0.Dificuldade" }),
            critic: new NumberField({ required: false, initial: 10, maxValue: 10, minValue: 5, label: "S0.Critico" }),
            specialist: new BooleanField({ required: false, initial: false, label: "S0.Especialista" }),
        });
    }

    static toJson(params) {
        const {
            id, name,
            primary_attribute, secondary_attribute,
            special_primary, special_secondary,
            ability, bonus = 0, automatic = 0, specialist = false,
            difficulty = 6, critic = 10,
        } = params;

        const object = new RollTestField();
        object.id = id || randomId();
        object.name = name;
        object.primary_attribute = primary_attribute;
        object.secondary_attribute = secondary_attribute;
        object.special_primary = special_primary;
        object.special_secondary = special_secondary;
        object.ability = ability;
        object.bonus = bonus;
        object.automatic = automatic;
        object.difficulty = difficulty;
        object.critic = critic;
        object.specialist = specialist;
        return object.toObject(object);
    }
}
import { EnhancementEffectField } from "./enhancement-field.mjs";

const { NumberField, SchemaField, StringField } = foundry.data.fields;

export class ActorAbilities extends SchemaField {
    constructor() {
        super({
            armas_brancas: new ActorAbilityField("S0.Armas_Brancas"),
            armas_de_projecao: new ActorAbilityField("S0.Armas_de_Projecao"),
            atletismo: new ActorAbilityField("S0.Atletismo"),
            briga: new ActorAbilityField("S0.Briga"),
            engenharia: new ActorAbilityField("S0.Engenharia"),
            expressao: new ActorAbilityField("S0.Expressao"),
            furtividade: new ActorAbilityField("S0.Furtividade"),
            hacking: new ActorAbilityField("S0.Hacking"),
            investigacao: new ActorAbilityField("S0.Investigacao"),
            medicina: new ActorAbilityField("S0.Medicina"),
            manha: new ActorAbilityField("S0.Manha"),
            performance: new ActorAbilityField("S0.Performance"),
            pilotagem: new ActorAbilityField("S0.Pilotagem"),
            quimica: new ActorAbilityField("S0.Quimica"),
        });
    }
}

class ActorAbilityField extends NumberField {
    constructor(label) {
        super({ integer: true, min: 0, initial: 0, max: 6, label: label });
    }
}

export class ActorAttributes extends SchemaField {
    constructor(params = {}) {
        const initial = (params && typeof params.initial === 'number') ? params.initial : 1;
        super({
            forca: new ActorAttributeField("S0.Forca", initial),
            destreza: new ActorAttributeField("S0.Destreza", initial),
            vigor: new ActorAttributeField("S0.Vigor", initial),
            percepcao: new ActorAttributeField("S0.Percepcao", initial),
            carisma: new ActorAttributeField("S0.Carisma", initial),
            inteligencia: new ActorAttributeField("S0.Inteligencia", initial),
        });
    }
}

class ActorAttributeField extends NumberField {
    constructor(label, initial = 1) {
        super({ nullable: false, integer: true, min: 0, initial: initial, max: 6, label: label });
    }
}

export class ActorCharacteristicField extends NumberField {
    constructor(label, initial = 0, max = 5) {
        super({ nullable: false, integer: true, min: 0, initial: initial, max: max, label: label });
    }
}

export class ActorVirtues extends SchemaField {
    constructor() {
        super({
            consciencia: new ActorVirtueField("S0.Consciencia"),
            perseveranca: new ActorVirtueField("S0.Perseveranca"),
            quietude: new ActorVirtueField("S0.Quietude")
        });
    }
}

class ActorVirtueField extends SchemaField {
    constructor(label) {
        super({
            level: new NumberField({ integer: true, min: 0, initial: 1, max: 5, label: label }),
            used: new NumberField({ integer: true, min: 0, initial: 0, max: 5 })
        });
    }
}

export class ActorEnhancementField extends SchemaField {
    constructor(id, name) {
        super({
            id: new StringField({ required: true }),
            name: new StringField({ required: true }),
            levels: new SchemaField({
                nv1: new EnhancementEffectField(),
                nv2: new EnhancementEffectField(),
                nv3: new EnhancementEffectField(),
                nv4: new EnhancementEffectField(),
                nv5: new EnhancementEffectField(),
            })
        });

        this.id = id;
        this.name = name;
    }

    static toJson(id, name) {
        const object = new ActorEnhancementField(id, name);
        return object.toObject(object);
    }
}
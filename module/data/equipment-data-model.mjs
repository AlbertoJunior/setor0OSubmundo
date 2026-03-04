import { DamageType, EquipmentHand, EquipmentHidding, EquipmentType, MeleeSize, SubstanceType } from "../enums/equipment-enums.mjs";
import { SuperEquipmentField } from "../data/field/equipment-field.mjs";
import { StandardEffectField } from "../data/field/effect-fields.mjs";
import { RollTestField } from "../data/field/roll-test-field.mjs";
import { ActiveEffectsMigration } from "../migration/migrations/migrate-active-effects.mjs";

const { StringField, NumberField, BooleanField, ArrayField } = foundry.data.fields;

class BaseEquipmentDataModel extends foundry.abstract.TypeDataModel {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  static defineSchema() {
    return {
      description: new StringField({ required: true, label: "S0.Descricao" }),
    };
  }
}

class SubstanceDataModel extends BaseEquipmentDataModel {
  static migrateData(source) {
    super.migrateData(source);
    ActiveEffectsMigration.migrateDataModel(source);
    return source;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const data = this;
    if (data.substance_type != SubstanceType.DRUG) {
      data.effects = [];
    }
  }

  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.SUBSTANCE, label: "S0.Tipo" }),
      substance_type: new NumberField({ integer: true, initial: SubstanceType.DRUG, label: "S0.Itens.Tipo_Substancia" }),
      quantity: new NumberField({ integer: true, initial: 1, minValue: 0, label: "S0.Quantidade" }),
      range: new NumberField({ integer: true, initial: 0, minValue: 0, label: "S0.Alcance" }),
      damage: new NumberField({ integer: true, initial: 0, label: "S0.Dano" }),
      effects: new ArrayField(new StandardEffectField()),
    };
  }
}

class EquipmentDataModel extends BaseEquipmentDataModel {
  get canBeSuper() {
    return true;
  }

  static defineSchema() {
    return {
      ...super.defineSchema(),
      resistance: new NumberField({ integer: true, initial: 1, label: "S0.Resistencia" }),
      actual_resistance: new NumberField({ integer: true, initial: 1, label: "S0.Resistencia_Atual" }),
      super_equipment: new SuperEquipmentField(),
      equipped: new BooleanField({ initial: false, label: "S0.Equipado" }),
    };
  }
}

class ArmorDataModel extends EquipmentDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.ARMOR, label: "S0.Tipo" }),
    };
  }
}

class RollableEquipmentDataModel extends EquipmentDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      default_test: new StringField({ initial: "", required: false, blank: true, label: "S0.Teste_Padrao" }),
      possible_tests: new ArrayField(new RollTestField()),
    };
  }
}

class AcessoryDataModel extends RollableEquipmentDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.ACESSORY, label: "S0.Tipo" }),
    };
  }
}

class VehicleDataModel extends RollableEquipmentDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.VEHICLE, label: "S0.Tipo" }),
      vehicle_type: new NumberField({ integer: true, initial: 0, label: "S0.Tipo" }),
      acceleration: new NumberField({ integer: true, initial: 0, label: "S0.Aceleracao" }),
      speed: new NumberField({ integer: true, initial: 0, label: "S0.Velocidade" })
    };
  }
}

class WeaponDataModel extends RollableEquipmentDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      hand: new NumberField({ integer: true, initial: EquipmentHand.ONE_HAND, label: "S0.Maos" }),
      damage: new NumberField({ integer: true, initial: 0, label: "S0.Dano" }),
      true_damage: new NumberField({ integer: true, initial: 0, label: "S0.Dano_Automatico" }),
      damage_type: new NumberField({ integer: true, initial: DamageType.LETAL, label: "S0.Tipo_Dano" }),
      occultability: new NumberField({ integer: true, initial: EquipmentHidding.POCKET, label: "S0.Ocultabilidade" })
    };
  }
}

class MeleeDataModel extends WeaponDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.MELEE, label: "S0.Tipo" }),
      size: new NumberField({ integer: true, initial: MeleeSize.SMALL, label: "S0.Tamanho" }),
    };
  }
}

class ProjectileDataModel extends WeaponDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new NumberField({ integer: true, initial: EquipmentType.PROJECTILE, label: "S0.Tipo" }),
      capacity: new NumberField({ integer: true, initial: 1, label: "S0.Capacidade" }),
      cadence: new NumberField({ integer: true, initial: 1, label: "S0.Cadencia" }),
      range: new NumberField({ integer: true, initial: 1, label: "S0.Itens.Alcance" }),
      max_range: new NumberField({ integer: true, initial: 2, label: "S0.Itens.Alcance_Maximo" }),
      special: new BooleanField({ initial: false, label: "S0.Especial" })
    };
  }
}

export async function createEquipmentDataModels() {
  CONFIG.Item.dataModels = {
    Melee: MeleeDataModel,
    Projectile: ProjectileDataModel,
    Armor: ArmorDataModel,
    Vehicle: VehicleDataModel,
    Substance: SubstanceDataModel,
    Acessory: AcessoryDataModel,
  };
}
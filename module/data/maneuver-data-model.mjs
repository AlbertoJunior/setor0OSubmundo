import { CharacteristicType } from "../enums/characteristic-enums.mjs";
import { ItemType } from "../enums/item-type-enums.mjs";

const { NumberField, StringField, BooleanField } = foundry.data.fields;

export class ManeuverDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      primary_attribute: new StringField({ required: true, nullable: true, initial: CharacteristicType.ATTRIBUTES.STRENGTH.id, label: "S0.Atributos.Atributo_Primario" }),
      secondary_attribute: new StringField({ required: true, nullable: true, initial: CharacteristicType.ATTRIBUTES.DEXTERITY.id, label: "S0.Atributos.Atributo_Secundario" }),
      skill: new StringField({ required: true, nullable: false, initial: CharacteristicType.SKILLS.MELEE.id, label: "S0.Habilidade" }),
      difficulty: new NumberField({ required: true, nullable: false, initial: 6, min: 5, max: 10, label: "S0.Dificuldade" }),
      critic: new NumberField({ required: true, nullable: false, initial: 10, min: 7, max: 10, label: "S0.Critico" }),
      specialist: new BooleanField({ required: true, nullable: false, initial: false, label: "S0.Especialista" }),
      description: new StringField({ required: false, nullable: true, initial: null, label: "S0.Descricao" }),
      pm: new NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "S0.Manobra.Custo_PM" }),
      experience: new NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "S0.Manobra.Custo_XP" }),
      damage: new NumberField({ required: true, nullable: false, initial: 0, label: "S0.Dano" }),
      automatic_damage: new NumberField({ integer: true, initial: 0, label: "S0.Dano_Automatico" }),
      useDamageWeapon: new BooleanField({ required: true, nullable: false, initial: false, label: "S0.Manobra.Usa_Dano_Arma" }),
      isReadOnly: new BooleanField({ required: true, nullable: false, initial: false, label: "S0.Generico.Somente_Leitura" }),
    };
  }
}

export async function createManeuverDataModels() {
  Object.assign(CONFIG.Item.dataModels, {
    [ItemType.MANEUVER]: ManeuverDataModel
  });
}

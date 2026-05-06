import { FoundryApi } from "../api/foundry-api.mjs";

const { NumberField, StringField, ArrayField, BooleanField } = foundry.data.fields;

export class SystemActiveEffectModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      originId: new StringField({ required: false, nullable: true, initial: null }),
      originType: new NumberField({ required: false, nullable: true, initial: null, integer: true }),
      originTypeLabel: new StringField({ required: false, nullable: true, initial: null }),
      type: new StringField({ required: false, nullable: true, initial: null }),
      alwaysShowOnToken: new BooleanField({ required: false, initial: false }),
      removeEffects: new ArrayField(
        new StringField({ required: false, nullable: true, initial: null }),
        { required: false, initial: [] }
      ),
      combatId: new StringField({ required: false, nullable: true, initial: null }),
      isPassive: new BooleanField({ required: false, initial: false }),
      canRemove: new BooleanField({ required: false, initial: true })
    };
  }
}

export async function createActiveEffectDataModels() {
  const isV13OrHigher = game?.release?.generation >= 13 || FoundryApi.Utils.isNewerVersion(game.version, "13");
  if (isV13OrHigher) {
    if (!CONFIG.ActiveEffect.dataModels) {
      CONFIG.ActiveEffect.dataModels = {};
    }
    // No Foundry V13+, a classe de ActiveEffect pode ter subtypes, sendo "base" o tipo genérico.
    CONFIG.ActiveEffect.dataModels.base = SystemActiveEffectModel;
  }
}

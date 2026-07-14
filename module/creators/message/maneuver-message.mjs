import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { localize, toKeyLang, getObject } from "../../utils/utils.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";
import { ManeuverUtils } from "../../utils/maneuver-utils.mjs";
import { ItemType } from "../../enums/item-type-enums.mjs";

export class ManeuverMessageCreator {
  static async mountContent(item) {
    const primaryAttr = getObject(item, ManeuverType.PRIMARY_ATTRIBUTE);
    const secondaryAttr = getObject(item, ManeuverType.SECONDARY_ATTRIBUTE);
    const skill = getObject(item, ManeuverType.SKILL);
    const requiredWeaponType = ManeuverUtils.getRequiredWeaponType(skill);

    let formattedWeaponRequirement = '';
    if (requiredWeaponType === ItemType.MELEE) {
      formattedWeaponRequirement = localize("Itens.Tipos.Corpo_a_Corpo");
    } else if (requiredWeaponType === ItemType.PROJECTILE) {
      formattedWeaponRequirement = localize("Itens.Tipos.Arma_Projecao");
    }

    const useDamageWeapon = getObject(item, ManeuverType.USE_DAMAGE_WEAPON) ?? false;
    const formattedUseDamageWeapon = useDamageWeapon ? localize('Sim') : localize('Nao');

    const data = {
      name: item.name,
      formattedPrimaryAttribute: primaryAttr ? localize(`Atributos.${toKeyLang(primaryAttr)}`) : '',
      formattedSecondaryAttribute: secondaryAttr ? localize(`Atributos.${toKeyLang(secondaryAttr)}`) : '',
      formattedSkill: skill ? localize(toKeyLang(skill)) : '',
      formattedWeaponRequirement,
      difficulty: getObject(item, ManeuverType.DIFFICULTY) || 6,
      critic: getObject(item, ManeuverType.CRITIC) || 10,
      pm: getObject(item, ManeuverType.PM) || 0,
      experience: getObject(item, ManeuverType.EXPERIENCE) || 0,
      damage: getObject(item, ManeuverType.DAMAGE) || 0,
      automatic_damage: getObject(item, ManeuverType.AUTOMATIC_DAMAGE) || 0,
      formattedUseDamageWeapon,
      description: getObject(item, ManeuverType.DESCRIPTION) || '',
      itemUuid: item.uuid
    };
    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/messages/maneuvers/maneuver.hbs`, data);
  }
}

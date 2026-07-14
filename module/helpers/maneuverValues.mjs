import { getObject } from "../utils/utils.mjs";
import { ManeuverType } from "../enums/maneuver-enums.mjs";

const map = {
  'primary_attribute': (item) => getObject(item, ManeuverType.PRIMARY_ATTRIBUTE),
  'secondary_attribute': (item) => getObject(item, ManeuverType.SECONDARY_ATTRIBUTE),
  'skill': (item) => getObject(item, ManeuverType.SKILL),
  'specialist': (item) => getObject(item, ManeuverType.SPECIALIST) || false,
  'difficulty': (item) => getObject(item, ManeuverType.DIFFICULTY) || 6,
  'critic': (item) => getObject(item, ManeuverType.CRITIC) || 10,
  'pm': (item) => getObject(item, ManeuverType.PM) || 0,
  'experience': (item) => getObject(item, ManeuverType.EXPERIENCE) || 0,
  'damage': (item) => getObject(item, ManeuverType.DAMAGE) || 0,
  'automatic_damage': (item) => getObject(item, ManeuverType.AUTOMATIC_DAMAGE) || 0,
  'useDamageWeapon': (item) => getObject(item, ManeuverType.USE_DAMAGE_WEAPON) ?? false,
  'description': (item) => getObject(item, ManeuverType.DESCRIPTION) || '',
  'isReadOnly': (item) => getObject(item, ManeuverType.IS_READ_ONLY) || false,
};

export default function maneuverValues(item, value, ...params) {
  if (!map[value]) {
    console.error(`Invalid maneuver value requested in helper: ${value}`);
    return null;
  }

  return map[value](item, ...params);
}

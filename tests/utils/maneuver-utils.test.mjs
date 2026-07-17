import { describe, it, expect } from 'vitest';
import { ManeuverUtils } from '../../module/utils/maneuver-utils.mjs';
import { CharacteristicType } from '../../module/enums/characteristic-enums.mjs';
import { ItemType } from '../../module/enums/item-type-enums.mjs';

describe('ManeuverUtils', () => {
  it('getRequiredWeaponType deve mapear melee e projectile', () => {
    expect(ManeuverUtils.getRequiredWeaponType(CharacteristicType.SKILLS.MELEE.id)).toBe(ItemType.MELEE);
    expect(ManeuverUtils.getRequiredWeaponType(CharacteristicType.SKILLS.PROJECTILE.id)).toBe(ItemType.PROJECTILE);
    expect(ManeuverUtils.getRequiredWeaponType('unknown')).toBe(null);
  });
});

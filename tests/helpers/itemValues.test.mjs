import { describe, it, expect, vi } from 'vitest';
import itemValues from '../../module/helpers/itemValues.mjs';
import { EquipmentUtils } from '../../module/core/equipment/equipment-utils.mjs';
import { ActiveEffectsUtils } from '../../module/core/effect/active-effects-utils.mjs';
import * as Utils from '../../module/utils/utils.mjs';

vi.mock('../../module/core/equipment/equipment-utils.mjs');
vi.mock('../../module/core/effect/active-effects-utils.mjs');
vi.mock('../../module/utils/utils.mjs');

describe('Helper: itemValues', () => {
  it('should delegate method calls to EquipmentUtils', () => {
    EquipmentUtils.canRoll.mockReturnValue(true);
    
    expect(itemValues({}, 'canRoll', {})).toBe(true);
    expect(EquipmentUtils.canRoll).toHaveBeenCalled();
  });

  it('should delegate method calls to ActiveEffectsUtils', () => {
    ActiveEffectsUtils.isBuff.mockReturnValue(true);
    
    expect(itemValues({}, 'effect_is_buff', {})).toBe(true);
    expect(ActiveEffectsUtils.isBuff).toHaveBeenCalled();
  });

  it('should use getObject to fetch properties safely', () => {
    Utils.getObject.mockReturnValue('A description');
    
    expect(itemValues({}, 'description', {})).toBe('A description');
    expect(Utils.getObject).toHaveBeenCalled();
  });

  it('should provide correct fallback values for missing properties', () => {
    Utils.getObject.mockReturnValue(undefined);
    
    expect(itemValues({}, 'damage', {})).toBe(0);
    expect(itemValues({}, 'special', {})).toBe(false);
  });
});

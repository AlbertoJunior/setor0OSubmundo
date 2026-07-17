import { describe, it, expect, vi } from 'vitest';
import maneuverValues from '../../module/helpers/maneuverValues.mjs';
import * as Utils from '../../module/utils/utils.mjs';

vi.mock('../../module/utils/utils.mjs');

describe('Helper: maneuverValues', () => {
  it('should map primary_attribute correctly', () => {
    Utils.getObject.mockReturnValue('S0.Agility');
    expect(maneuverValues({}, 'primary_attribute')).toBe('S0.Agility');
  });

  it('should return fallback values if getObject returns undefined', () => {
    Utils.getObject.mockReturnValue(undefined);
    
    // Test fallbacks according to the map
    expect(maneuverValues({}, 'difficulty')).toBe(6);
    expect(maneuverValues({}, 'critic')).toBe(10);
    expect(maneuverValues({}, 'pm')).toBe(0);
    expect(maneuverValues({}, 'useDamageWeapon')).toBe(false);
  });

  it('should return null and warn for invalid maneuver value', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(maneuverValues({}, 'invalid_maneuver')).toBe(null);
    expect(errorSpy).toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });
});

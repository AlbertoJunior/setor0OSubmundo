import { describe, it, expect, vi } from 'vitest';
import traitValues from '../../module/helpers/traitValues.mjs';
import { TraitUtils } from '../../module/core/trait/trait-utils.mjs';

vi.mock('../../module/core/trait/trait-utils.mjs', () => ({
  TraitUtils: {
    getXp: vi.fn(),
    getDescription: vi.fn(),
    getEffectsWithLocalizedKey: vi.fn(),
  }
}));

describe('Helper: traitValues', () => {
  it('should call TraitUtils for known values', () => {
    TraitUtils.getXp.mockReturnValue(10);
    TraitUtils.getDescription.mockReturnValue('Some description');
    TraitUtils.getEffectsWithLocalizedKey.mockReturnValue(['effect1']);

    const mockItem = { name: 'trait' };

    expect(traitValues(mockItem, 'xp', {})).toBe(10);
    expect(TraitUtils.getXp).toHaveBeenCalledWith(mockItem);

    expect(traitValues(mockItem, 'description', {})).toBe('Some description');
    expect(TraitUtils.getDescription).toHaveBeenCalledWith(mockItem);

    expect(traitValues(mockItem, 'effects', {})).toEqual(['effect1']);
    expect(TraitUtils.getEffectsWithLocalizedKey).toHaveBeenCalledWith(mockItem);
  });

  it('should return undefined for unknown mappings', () => {
    expect(traitValues({}, 'unknown_mapping', {})).toBeUndefined();
  });
});

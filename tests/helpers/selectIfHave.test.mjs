import { describe, it, expect } from 'vitest';
import selectIfHave from '../../module/helpers/selectIfHave.mjs';

describe('Helper: selectIfHave', () => {
  it('should return "S0-selected" if level is greater than or equal to index', () => {
    expect(selectIfHave(5, 3)).toBe('S0-selected');
    expect(selectIfHave(2, 2)).toBe('S0-selected');
  });

  it('should return empty string if level is less than index', () => {
    expect(selectIfHave(2, 5)).toBe('');
  });

  it('should return empty string if arguments are not integers', () => {
    expect(selectIfHave('5', 3)).toBe('');
    expect(selectIfHave(5, '3')).toBe('');
    expect(selectIfHave(null, undefined)).toBe('');
  });
});

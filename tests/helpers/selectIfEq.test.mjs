import { describe, it, expect } from 'vitest';
import selectIfEq from '../../module/helpers/selectIfEq.mjs';

describe('Helper: selectIfEq', () => {
  it('should return "selected" if item is equal to eq', () => {
    expect(selectIfEq('foo', 'foo')).toBe('selected');
    expect(selectIfEq(5, 5)).toBe('selected');
  });

  it('should return empty string if item is not equal to eq', () => {
    expect(selectIfEq('foo', 'bar')).toBe('');
    expect(selectIfEq(5, 10)).toBe('');
  });

  it('should return empty string if item is falsy/undefined', () => {
    expect(selectIfEq(null, 'foo')).toBe('');
    expect(selectIfEq(undefined, undefined)).toBe('');
    expect(selectIfEq('', '')).toBe('');
  });
});

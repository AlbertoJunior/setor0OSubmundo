import { describe, it, expect } from 'vitest';
import operator from '../../module/helpers/operators.mjs';

describe('operators.mjs', () => {
  // Mocking the Handlebars context that is always the last argument and gets popped by the function
  const hbContext = {};

  it('should correctly evaluate "eq" (equal)', () => {
    expect(operator('eq', 5, 5, hbContext)).toBe(true);
    expect(operator('eq', 5, 10, hbContext)).toBe(false);
    expect(operator('eq', 'a', 'a', 'a', hbContext)).toBe(true);
    expect(operator('eq', 'a', 'a', 'b', hbContext)).toBe(false);
  });

  it('should correctly evaluate "not"', () => {
    expect(operator('not', true, hbContext)).toBe(false);
    expect(operator('not', false, hbContext)).toBe(true);
    expect(operator('not', null, hbContext)).toBe(true);
  });

  it('should correctly evaluate "lt" (less than)', () => {
    expect(operator('lt', 5, 10, hbContext)).toBe(true);
    expect(operator('lt', 10, 5, hbContext)).toBe(false);
    expect(operator('lt', 5, 5, hbContext)).toBe(false);
  });

  it('should correctly evaluate "lte" (less than or equal)', () => {
    expect(operator('lte', 5, 10, hbContext)).toBe(true);
    expect(operator('lte', 10, 5, hbContext)).toBe(false);
    expect(operator('lte', 5, 5, hbContext)).toBe(true);
  });

  it('should correctly evaluate "gt" (greater than)', () => {
    expect(operator('gt', 10, 5, hbContext)).toBe(true);
    expect(operator('gt', 5, 10, hbContext)).toBe(false);
    expect(operator('gt', 5, 5, hbContext)).toBe(false);
  });

  it('should correctly evaluate "gte" (greater than or equal)', () => {
    expect(operator('gte', 10, 5, hbContext)).toBe(true);
    expect(operator('gte', 5, 10, hbContext)).toBe(false);
    expect(operator('gte', 5, 5, hbContext)).toBe(true);
  });

  it('should correctly evaluate "isNull" and "isNotNull"', () => {
    expect(operator('isNull', null, hbContext)).toBe(true);
    expect(operator('isNull', undefined, hbContext)).toBe(true);
    expect(operator('isNull', 0, hbContext)).toBe(false);
    
    expect(operator('isNotNull', null, hbContext)).toBe(false);
    expect(operator('isNotNull', 0, hbContext)).toBe(true);
  });

  it('should correctly evaluate "isEmpty" and "isNotEmpty"', () => {
    expect(operator('isEmpty', [], hbContext)).toBe(true);
    expect(operator('isEmpty', [1], hbContext)).toBe(false);
    
    expect(operator('isNotEmpty', [1], hbContext)).toBe(true);
    expect(operator('isNotEmpty', [], hbContext)).toBe(false);
  });

  it('should correctly evaluate "and"', () => {
    expect(operator('and', true, true, true, hbContext)).toBe(true);
    expect(operator('and', true, false, true, hbContext)).toBe(false);
  });

  it('should correctly evaluate "or"', () => {
    expect(operator('or', false, false, true, hbContext)).toBe(true);
    expect(operator('or', false, false, false, hbContext)).toBe(false);
  });

  it('should correctly evaluate "orValue"', () => {
    expect(operator('orValue', 'a', 'b', hbContext)).toBe('a');
    expect(operator('orValue', null, 'b', hbContext)).toBe('b');
    expect(operator('orValue', undefined, 'b', hbContext)).toBe('b');
  });

  it('should correctly evaluate "ternary"', () => {
    expect(operator('ternary', true, 'yes', 'no', hbContext)).toBe('yes');
    expect(operator('ternary', false, 'yes', 'no', hbContext)).toBe('no');
  });

  it('should correctly evaluate "includes"', () => {
    expect(operator('includes', [1, 2, 3], 2, hbContext)).toBe(true);
    expect(operator('includes', [1, 2, 3], 4, hbContext)).toBe(false);
  });
});

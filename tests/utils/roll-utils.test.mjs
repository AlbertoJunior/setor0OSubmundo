import { describe, it, expect } from 'vitest';
import { RollUtils } from '../../module/utils/roll-utils.mjs';

describe('RollUtils', () => {
  it('isOverloadRoll deve verificar flags e options', () => {
    expect(RollUtils.isOverloadRoll({ options: { isOverload: true } })).toBe(true);
    expect(RollUtils.isOverloadRoll({ flags: { setor0OSubmundo: { isOverload: true } } })).toBe(true);
    expect(RollUtils.isOverloadRoll({ options: { isOverload: false } })).toBe(false);
    expect(RollUtils.isOverloadRoll({})).toBe(false);
  });
});

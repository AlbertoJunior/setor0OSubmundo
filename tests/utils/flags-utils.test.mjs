import { describe, it, expect, vi } from 'vitest';
import { FlagsUtils } from '../../module/utils/flags-utils.mjs';
import { SYSTEM_ID } from '../../module/constants.mjs';

describe('FlagsUtils', () => {
  it('getActorFlag', () => {
    const actor = { getFlag: vi.fn().mockReturnValue('value1') };
    expect(FlagsUtils.getActorFlag(actor, 'flag1')).toBe('value1');
    expect(actor.getFlag).toHaveBeenCalledWith(SYSTEM_ID, 'flag1');
    
    actor.getFlag.mockReturnValue(null);
    expect(FlagsUtils.getActorFlag(actor, 'flag1', 'default')).toBe('default');
  });

  it('setItemFlag', async () => {
    const item = { setFlag: vi.fn().mockResolvedValue(true) };
    await FlagsUtils.setItemFlag(item, 'flag1', 'value1');
    expect(item.setFlag).toHaveBeenCalledWith(SYSTEM_ID, 'flag1', 'value1');
  });

  it('getItemFlag', () => {
    const item1 = { getFlag: vi.fn().mockReturnValue('val') };
    expect(FlagsUtils.getItemFlag(item1, 'test')).toBe('val');

    const item2 = { flags: { [SYSTEM_ID]: { test: 'val2' } } };
    expect(FlagsUtils.getItemFlag(item2, 'test')).toBe('val2');

    expect(FlagsUtils.getItemFlag(item2, 'notFound', 'def')).toBe('def');
  });

  it('getSystemFlag', () => {
    const item = { flags: { [SYSTEM_ID]: { test: 'sysVal' } } };
    expect(FlagsUtils.getSystemFlag(item, 'test')).toBe('sysVal');
  });
});

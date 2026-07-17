import { describe, it, expect, vi } from 'vitest';
import { EnhancementInfoParser } from '../../../module/core/enhancement/enhancement-info.mjs';
import { EnhancementDuration, EnhancementOverload } from '../../../module/enums/enhancement-enums.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  localize: vi.fn(k => `LOC_${k}`),
  labelError: vi.fn(() => 'Error')
}));

describe('EnhancementInfoParser', () => {
  it('durationValueToString', () => {
    expect(EnhancementInfoParser.durationValueToString(EnhancementDuration.PASSIVE)).toBe('LOC_Passivo');
    expect(EnhancementInfoParser.durationValueToString(999)).toBe('Error');
  });

  it('overloadValueToString', () => {
    expect(EnhancementInfoParser.overloadValueToString(EnhancementOverload.NONE)).toBe('LOC_Nenhum');
    expect(EnhancementInfoParser.overloadValueToString(EnhancementOverload.ONE_TESTED)).toBe('1');
    expect(EnhancementInfoParser.overloadValueToString(EnhancementOverload.ONE_FIXED)).toBe('1 LOC_Automatico');
    expect(EnhancementInfoParser.overloadValueToString(999)).toBe('Error');
  });
});

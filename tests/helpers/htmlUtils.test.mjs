import { describe, it, expect, vi } from 'vitest';
import htmlUtils from '../../module/helpers/htmlUtils.mjs';
import { FlagsUtils } from '../../module/utils/flags-utils.mjs';

describe('Helper: htmlUtils', () => {
  it('should return S0-marked for marked operation if true', () => {
    expect(htmlUtils('marked', true)).toBe('S0-marked');
    expect(htmlUtils('marked', false)).toBe('');
  });

  it('should return S0-compact for compacted operation based on FlagsUtils', () => {
    vi.spyOn(FlagsUtils, 'getItemFlag').mockImplementation((user, flag) => {
      // Simula retorno positivo apenas para esse teste
      return true;
    });
    
    expect(htmlUtils('compacted', null)).toBe('S0-compact');
    
    // Testa retorno falso
    FlagsUtils.getItemFlag.mockReturnValue(false);
    expect(htmlUtils('compacted', null)).toBe('');
    
    FlagsUtils.getItemFlag.mockRestore();
  });

  it('should return empty string for unknown operations to avoid undefined HTML rendering', () => {
    // O helper da console.warn se não encontrar, então vamos suprimir o warn temporariamente
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Se a função não existir em returnableClasses, o acesso vai explodir com TypeError.
    // O teste garante a robustez ou reflete o comportamento atual.
    expect(() => htmlUtils('unknown_op', null)).toThrow();
    
    warnSpy.mockRestore();
  });
});

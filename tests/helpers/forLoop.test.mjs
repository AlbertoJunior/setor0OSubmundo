import { describe, it, expect, vi } from 'vitest';
import forLoop from '../../module/helpers/forLoop.mjs';

describe('Helper: forLoop', () => {
  it('should iterate correctly and call options.fn with proper indexes', () => {
    const options = {
      fn: vi.fn(({ index, indexPlus, indexMinus }) => `${index}-`)
    };

    const result = forLoop(0, 3, options);
    
    // Deve chamar 3 vezes: 0, 1 e 2
    expect(options.fn).toHaveBeenCalledTimes(3);
    
    // Verifica a injeção correta da primeira chamada
    expect(options.fn).toHaveBeenNthCalledWith(1, { index: 0, indexPlus: 1, indexMinus: -1 });
    // Verifica a injeção da última chamada
    expect(options.fn).toHaveBeenNthCalledWith(3, { index: 2, indexPlus: 3, indexMinus: 1 });
    
    expect(result).toBe('0-1-2-');
  });

  it('should return empty string if start >= end', () => {
    const options = { fn: vi.fn() };
    const result = forLoop(3, 3, options);
    
    expect(options.fn).not.toHaveBeenCalled();
    expect(result).toBe('');
  });
});

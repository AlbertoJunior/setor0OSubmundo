import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollOverload } from '../../../module/core/rolls/overload-roll.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  getObject: vi.fn()
}));

describe('RollOverload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular sucessos corretamente sem o bônus de bestCore (núcleo < 4)', async () => {
    const mockActor = {};
    utils.getObject.mockReturnValue(3);
    
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: {},
      values: [8, 1, 10] // diff é 8. 8 => +1, 1 => -1, 10 => +1. Total = 1 sucesso
    });

    const result = await RollOverload.roll(mockActor, 1);
    
    expect(result.core).toBe(3);
    expect(result.success).toBe(1);
    expect(result.missed).toBe(0); // misses (1) - sucessos (1) = 0
  });

  it('deve ignorar a primeira falha (1) se o ator possuir bestCore (núcleo >= 4)', async () => {
    const mockActor = {};
    utils.getObject.mockReturnValue(4);
    
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: {},
      values: [1, 1, 9] // diff é 8. primeiro 1 ignorado, segundo 1 => -1, 9 => +1. Total = 0 sucessos
    });

    const result = await RollOverload.roll(mockActor, 2);
    
    expect(result.core).toBe(4);
    expect(result.success).toBe(0);
    expect(result.missed).toBe(2); // misses (2) - sucessos (0) = 2
  });

  it('não deve resultar em falhas perdidas (missed) negativas', async () => {
    const mockActor = {};
    utils.getObject.mockReturnValue(5); // >= 4 tem bestCore
    
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: {},
      values: [10, 10, 8] // 3 sucessos
    });

    const result = await RollOverload.roll(mockActor, 1); // só precisa de 1
    
    expect(result.core).toBe(5);
    expect(result.success).toBe(3);
    expect(result.missed).toBe(0); // Math.max(1 - 3, 0) = 0
  });
});

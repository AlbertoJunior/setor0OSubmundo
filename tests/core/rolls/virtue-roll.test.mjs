import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollVirtue } from '../../../module/core/rolls/virtue-roll.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';

describe('RollVirtue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('roll', () => {
    it('deve calcular a quantidade de dados corretamente baseada nas virtudes e modificadores', async () => {
      const mockActor = {};
      
      vi.spyOn(ActorUtils, 'getVirtueValue').mockImplementation((actor, virtue) => {
        if (virtue === 'virtueA') return 2;
        if (virtue === 'virtueB') return 3;
        return 0;
      });

      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: { options: {} },
        values: [5, 8]
      });

      const params = {
        virtue1: 'virtueA',
        virtue2: 'virtueB',
        bonus: 2,
        penalty: 1,
        automatic: 1,
        difficulty: 7
      };

      const result = await RollVirtue.roll(mockActor, params);
      
      // diceAmount = 2 (virtue1) + 3 (virtue2) + 2 (bonus) - 1 (penalty) = 6
      expect(CoreRollMethods.rollDice).toHaveBeenCalledWith(6);
      
      // Verifica injecão de options
      expect(result.roll.roll.options).toEqual({
        difficulty: 7,
        automatic: 1,
        bonus: 2,
        penalty: 1
      });

      expect(result.virtues.virtue1.value).toBe(2);
      expect(result.virtues.virtue2.value).toBe(3);
    });

    it('deve tratar valores em falta com os defaults', async () => {
      const mockActor = {};
      vi.spyOn(ActorUtils, 'getVirtueValue').mockReturnValue(1);
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: { options: {} }
      });

      const params = { virtue1: 'v1', virtue2: 'v2' };
      const result = await RollVirtue.roll(mockActor, params);
      
      // default: bonus 0, penalty 0, automatic 0, difficulty 6
      // diceAmount = 1 + 1 + 0 - 0 = 2
      expect(CoreRollMethods.rollDice).toHaveBeenCalledWith(2);
      expect(result.roll.roll.options.difficulty).toBe(6);
    });
  });
});

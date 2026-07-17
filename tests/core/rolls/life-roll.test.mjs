import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollLife } from '../../../module/core/rolls/life-roll.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  getObject: vi.fn()
}));

describe('RollLife', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('roll (calculando sucesso/falha baseando-se no valor de Vida <= dado)', () => {
    it('deve passar no teste quando Dificuldade (Vida) for 1 e o valor do dado for 1', async () => {
      const mockActor = {};
      utils.getObject.mockReturnValue(1); // Vida = 1
      
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [1] // 1 <= 1, deve retornar sucesso
      });

      const result = await RollLife.roll(mockActor, 1);
      
      expect(result.life).toBe(1);
      expect(result.success).toBe(1);
      expect(result.missed).toBe(0);
    });

    it('deve falhar no teste quando Dificuldade (Vida) for 1 e o valor do dado for 2', async () => {
      const mockActor = {};
      utils.getObject.mockReturnValue(1); // Vida = 1
      
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [2] // 2 > 1, não é sucesso
      });

      const result = await RollLife.roll(mockActor, 1);
      
      expect(result.life).toBe(1);
      expect(result.success).toBe(0);
      expect(result.missed).toBe(1); // Requeria 1, teve 0 sucesso = 1 falha (miss)
    });

    it('deve passar no teste quando a Vida for alta (ex: 8) e o dado for menor ou igual (ex: 6)', async () => {
      const mockActor = {};
      utils.getObject.mockReturnValue(8);
      
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [6] // 6 <= 8, sucesso!
      });

      const result = await RollLife.roll(mockActor, 1);
      
      expect(result.success).toBe(1);
      expect(result.missed).toBe(0);
    });

    it('deve lidar com múltiplas exigências de testes (amount > 1) e calcular missed corretamente', async () => {
      const mockActor = {};
      utils.getObject.mockReturnValue(5); // Vida = 5
      
      // Embora Life role 1 dado por vez conforme o método ( CoreRollMethods.rollDice(1) ), 
      // o amount define a exigência para calcular 'missed'.
      // Vamos simular que o roll retorne 1 valor que falhe (dado > Vida)
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [10] // 10 > 5, falhou
      });

      // Exigindo amount = 3
      const result = await RollLife.roll(mockActor, 3);
      
      expect(result.success).toBe(0);
      expect(result.missed).toBe(3); // amount(3) - success(0) = 3 missed
    });
  });
});

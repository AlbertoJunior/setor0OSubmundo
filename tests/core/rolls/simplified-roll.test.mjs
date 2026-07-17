import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollSimplified } from '../../../module/core/rolls/simplified-roll.mjs';
import { AbilityRepository } from '../../../module/repository/ability-repository.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { EquipmentUtils } from '../../../module/core/equipment/equipment-utils.mjs';
import { NpcUtils } from '../../../module/core/npc/npc-utils.mjs';
import { EquipmentCharacteristicType } from '../../../module/enums/equipment-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  getObject: vi.fn(),
  labelError: vi.fn().mockReturnValue('ErrorLabel')
}));

describe('RollSimplified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rollByAmount', () => {
    it('deve repassar value para CoreRollMethods sem modificadores', async () => {
      const mockActor = {};
      vi.spyOn(CoreRollMethods, 'rollDiceAmountWithOverload').mockResolvedValue('mockResult');

      const result = await RollSimplified.rollByAmount(mockActor, { value: 6 });
      
      // isHalf, bonus, penalty falsos, valor 6 continua 6
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 6);
      expect(result).toBe('mockResult');
    });
  });

  describe('roll', () => {
    it('deve calcular isHalf, bonus e penalty', async () => {
      const mockActor = {};
      vi.spyOn(AbilityRepository, 'getItem').mockReturnValue({ label: 'Habilidade Mock' });
      vi.spyOn(CoreRollMethods, 'rollDiceAmountWithOverload').mockResolvedValue('mockRollData');

      const params = {
        skillName: 'skill1',
        value: 10,
        isHalf: 'on', // isHalf cai no Math.floor(value / 2) = 5
        bonus: 2,
        penalty: 1,
        specialist: 'on',
        difficulty: 7,
        critic: 10,
        automatic: 1
      };

      const result = await RollSimplified.roll(mockActor, params);
      
      // adjusted = 5. finalValue = 5 + 2 - 1 = 6.
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 6);
      expect(result.resultRoll).toBe('mockRollData');
      expect(result.abilityInfo.label).toBe('Habilidade Mock');
      expect(result.modifiers.isHalf).toBe(true);
      expect(result.modifiers.specialist).toBe(true);
    });
  });

  describe('rollByEquipment', () => {
    it('deve extrair dano de arma e rolar junto dos testes', async () => {
      const mockActor = {};
      const mockItem = { name: 'Espada' };
      
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(true);
      vi.spyOn(EquipmentUtils, 'getItemRollInformation').mockReturnValue('weaponInfo');
      utils.getObject.mockImplementation((item, characteristicType) => {
        if (characteristicType === EquipmentCharacteristicType.DAMAGE) return 3;
        if (characteristicType === EquipmentCharacteristicType.TRUE_DAMAGE) return 1;
        return 0;
      });
      vi.spyOn(NpcUtils, 'calculatePenalty').mockReturnValue(2);
      
      // Mock do próprio método roll
      const rollSpy = vi.spyOn(RollSimplified, 'roll').mockResolvedValue({ 
        resultRoll: 'ok' 
      });

      const equipInfoRoll = {
        item: mockItem,
        rollTest: { name: 'Ataque', specialist: false, bonus: 1, automatic: 0, difficulty: 6, critic: 10 },
        value: 8,
        skillName: 'melee',
        isHalf: false
      };

      const result = await RollSimplified.rollByEquipment(mockActor, equipInfoRoll);
      
      // Bonus deve ser 1 (rollTest) + 3 (item damage) = 4
      // Automatic deve ser 0 + 1 (true damage) = 1
      expect(rollSpy).toHaveBeenCalledWith(mockActor, expect.objectContaining({
        value: 8,
        penalty: 2, // Retornado de calculatePenalty
        bonus: 4,
        automatic: 1,
        weapon: 'weaponInfo'
      }));

      expect(result.name).toBe('Espada: Ataque');
      expect(result.resultRoll).toBe('ok');
    });
  });
});

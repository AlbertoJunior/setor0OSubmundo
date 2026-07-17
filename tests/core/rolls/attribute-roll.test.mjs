import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollAttribute } from '../../../module/core/rolls/attribute-roll.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { EquipmentUtils } from '../../../module/core/equipment/equipment-utils.mjs';

describe('RollAttribute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('roll', () => {
    it('deve calcular dados corretamente sem weapon nem half', async () => {
      const mockActor = {};
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(1);
      vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(5); // Soma de atributos e habilidade
      vi.spyOn(ActorUtils, 'getAttributeValue').mockReturnValue(2);
      vi.spyOn(ActorUtils, 'getAbilityValue').mockReturnValue(1);
      vi.spyOn(CoreRollMethods, 'rollDiceAmountWithOverload').mockResolvedValue('mockRolls');

      const params = {
        attr1: 'forca',
        attr2: 'agilidade',
        ability: 'atletismo',
        specialist: true,
        bonus: 2
      };

      const result = await RollAttribute.roll(mockActor, params);
      
      // diceAmount = 5
      // plusBonus = 5 + 2 = 7
      // minusPenalty = 7 - 1 = 6
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 6);
      
      expect(result.roll).toBe('mockRolls');
      expect(result.modifiers.specialist).toBe(true);
      expect(result.modifiers.bonus).toBe(2);
      expect(result.attrs.attr1.label).toBe('forca');
    });

    it('deve aplicar isHalf e bônus de weapon', async () => {
      const mockActor = {};
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(0);
      vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(7); 
      vi.spyOn(ActorUtils, 'getAttributeValue').mockReturnValue(3);
      vi.spyOn(ActorUtils, 'getAbilityValue').mockReturnValue(1);
      vi.spyOn(CoreRollMethods, 'rollDiceAmountWithOverload').mockResolvedValue('mockRolls');

      const params = {
        attr1: 'a1', attr2: 'a2', ability: 'h1',
        isHalf: true, // 7 / 2 = Math.floor = 3
        weapon: { damage: 3 } // diceAmountWithWeapon = 3 + 3 = 6
      };

      await RollAttribute.roll(mockActor, params);
      
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 6);
    });

    it('NÃO deve somar dano da arma se os dados originais (após penalidade) chegarem a 0', async () => {
      const mockActor = {};
      // Se a penalidade for tão alta que os dados (com bonus) cheguem a 0 ou menos,
      // a regra dita que a arma não deve somar dano do nada.
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(10);
      vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(5); 

      const params = {
        bonus: 2, // 5 + 2 = 7. Penalidade = 10. (7 - 10 = 0).
        weapon: { damage: 50 } // Não deve ser somado!
      };

      await RollAttribute.roll(mockActor, params);
      
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 0);
    });

    it('deve realizar Math.floor perfeitamente em isHalf e tratar inputs String numéricas (bonus, automatic)', async () => {
      const mockActor = {};
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(2);
      vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(9); // impar

      const params = {
        isHalf: true, // floor(9 / 2) = 4
        bonus: "3", // Number("3") = 3. 4 + 3 = 7.
        automatic: "1" // Number("1") = 1.
      };

      // 7 - 2(penalty) = 5
      const result = await RollAttribute.roll(mockActor, params);
      
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 5);
      expect(result.modifiers.bonus).toBe(3); // Deve ter sido convertido para Number
      expect(result.modifiers.automatic).toBe(1); // Deve ter sido convertido para Number
    });

    it('deve calcular dano da arma corrompida (sem damage) como 0', async () => {
      const mockActor = {};
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(0);
      vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(4); 

      const params = {
        weapon: { damage: "not-a-number" } // Number("not-a-number") = NaN || 0 -> 0
      };

      await RollAttribute.roll(mockActor, params);
      
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 4);
    });
  });

  describe('métodos utilitários baseados em rollable', () => {
    it('rollByRollableTests', async () => {
      const rollSpy = vi.spyOn(RollAttribute, 'roll').mockResolvedValue('ok');
      const rollable = { primary_attribute: 'a1', secondary_attribute: 'a2', ability: 'h1', specialist: true, automatic: 1, bonus: 0 };
      
      await RollAttribute.rollByRollableTests({}, rollable);
      
      expect(rollSpy).toHaveBeenCalledWith({}, expect.objectContaining({
        attr1: 'a1', attr2: 'a2', ability: 'h1', specialist: true
      }));
    });

    it('rollByRollableTestsWithEquipment', async () => {
      const rollSpy = vi.spyOn(RollAttribute, 'roll').mockResolvedValue('ok');
      vi.spyOn(EquipmentUtils, 'getItemRollInformation').mockReturnValue('equipInfo');
      
      const rollable = { primary_attribute: 'a1', secondary_attribute: 'a2' };
      
      await RollAttribute.rollByRollableTestsWithEquipment({}, rollable, {}, true);
      
      expect(rollSpy).toHaveBeenCalledWith({}, expect.objectContaining({
        attr1: 'a1',
        isHalf: true,
        weapon: 'equipInfo'
      }));
    });
  });
});

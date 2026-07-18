import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomRoll } from '../../../module/core/rolls/custom-roll.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { EnhancementRepository } from '../../../module/repository/enhancement-repository.mjs';
import { CharacteristicType } from '../../../module/enums/characteristic-enums.mjs';

// Usaremos spyOn em métodos isolados ao invés de mockar o arquivo de utils que possui dependências circulares.
vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getObject: vi.fn(),
    localize: vi.fn((key) => `localized_${key}`),
    toKeyLang: vi.fn((key) => `keyLang_${key}`)
  };
});

describe('CustomRoll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mountData', () => {
    it('deve extrair aprimoramentos do ator', () => {
      vi.spyOn(ActorUtils, 'getAllEnhancements').mockReturnValue([{ id: 'enhancement1' }]);
      const data = CustomRoll.mountData({});
      const arr = Array.from(data.enhancements);
      expect(arr[0].id).toBe('enhancement1');
    });
  });

  describe('calculateDiceAmount', () => {
    it('deve somar primário, secundário e se tiver terciário tirar a média dos dois primeiros e somar', () => {
      const p1 = { value: 6 };
      const p2 = { value: 4 };
      // Sem terciário: 6 + 4 = 10
      expect(CustomRoll.calculateDiceAmount(p1, p2)).toBe(10);

      const p3 = { value: 2 };
      // Com terciário: Math.floor((6+4)/2) + 2 = 5 + 2 = 7
      expect(CustomRoll.calculateDiceAmount(p1, p2, p3)).toBe(7);
    });
  });

  describe('discoverAndRoll', () => {
    it('deve operar todos os dados e chamar a rolagem', async () => {
      const mockActor = {};
      
      // Mock operateAllPossibilities to avoid complex internal mocking for this integration test
      vi.spyOn(CustomRoll, 'operateAllPossibilities')
        .mockReturnValueOnce({ label: 'Prim', value: 4 })
        .mockReturnValueOnce({ label: 'Sec', value: 2 })
        .mockReturnValueOnce({ label: 'Ter', value: 1 });
        
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(1);
      vi.spyOn(CoreRollMethods, 'rollDiceAmountWithOverload').mockResolvedValue('mockRolls');

      const params = {
        primary: 'p', secondary: 's', tertiary: 't',
        bonus: 2, specialist: true, half: true
      };

      const result = await CustomRoll.discoverAndRoll(mockActor, params);
      
      // Dice Math: Primary(4) + Secondary(2) = 6. Tertiary = 1.
      // Math.floor(6/2) + 1 = 4.
      // half is true => Math.floor(4/2) = 2.
      // Final = 2 - penalty(1) + bonus(2) = 3.
      expect(CoreRollMethods.rollDiceAmountWithOverload).toHaveBeenCalledWith(mockActor, 3);
      
      expect(result.roll).toBe('mockRolls');
      expect(result.attrs.attr1.label).toBe('Prim');
    });
  });

  describe('operateAllPossibilities', () => {
    it('deve retornar zero se a característica for zero', () => {
      const res = CustomRoll.operateAllPossibilities({}, {}, 'zero', null);
      expect(res.value).toBe(0);
      expect(res.label).toBe('Zero');
    });

    it('deve achar valor em collection (ex: Attributes)', () => {
      const params = {
        attributes: new Set(['forca'])
      };
      vi.spyOn(ActorUtils, 'getAttributeValue').mockReturnValue(3);

      const res = CustomRoll.operateAllPossibilities({}, params, 'forca', null);
      
      expect(res.value).toBe(3);
      expect(res.label).toBe('localized_keyLang_forca');
    });

    it('deve achar valor de Enhancement se characteristic for aprimoramento', () => {
      const params = {
        attributes: new Set(), skills: new Set(), virtues: new Set(), repertory: new Set(), others: new Set(),
        enhancements: [{ id: 'spec1' }]
      };
      
      vi.spyOn(EnhancementRepository, 'getEnhancementById').mockReturnValue({ name: 'Nome Aprimoramento' });
      vi.spyOn(ActorUtils, 'getEnhancementLevel').mockReturnValue(2);

      const res = CustomRoll.operateAllPossibilities({}, params, CharacteristicType.ENHANCEMENT.id, 'spec1');
      
      expect(res.value).toBe(2);
      expect(res.label).toBe('Nome Aprimoramento');
    });
  });
});

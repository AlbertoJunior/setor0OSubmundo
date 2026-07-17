import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NpcUtils } from '../../../module/core/npc/npc-utils.mjs';
import { NpcQualityRepository } from '../../../module/repository/npc-quality-repository.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CharacteristicType, NpcCharacteristicType } from '../../../module/enums/characteristic-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getObject: vi.fn()
  }
});

describe('NpcUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStamina', () => {
    it('deve subtrair 5 do vitality.total, limitando a zero', () => {
      utils.getObject.mockReturnValue(8);
      expect(NpcUtils.getStamina({})).toBe(3); // 8 - 5 = 3
      
      utils.getObject.mockReturnValue(3);
      expect(NpcUtils.getStamina({})).toBe(0); // 3 - 5 = -2 -> 0
    });
  });

  describe('getPm', () => {
    it('deve calcular PM baseado na Qualidade e no nível de atletismo', () => {
      // PM base é 1.
      // Quality Modifier (EXCEPTIONAL) = 4
      // Atletismo (valor 4 / 2) = 2
      // Total = 1 + 4 + 2 = 7

      utils.getObject.mockImplementation((actor, charType) => {
        if (charType === NpcCharacteristicType.QUALITY) return NpcQualityRepository.TYPES.EXCEPTIONAL.id;
        
        if (charType === NpcCharacteristicType.SKILLS) {
          const idName = NpcCharacteristicType.SKILLS.SKILL_NAME.id;
          const idValue = NpcCharacteristicType.SKILLS.VALUE.id;
          return {
            primary: { [idName]: CharacteristicType.SKILLS.ATHLETICS.id, [idValue]: 4 },
            secondary: { [idName]: CharacteristicType.SKILLS.BRAWL.id, [idValue]: 5 } 
          };
        }
        
        // When getObject is called for the 'foundedSkill', it requests skillValue
        if (charType === NpcCharacteristicType.SKILLS.VALUE.id) {
          if (!actor) return null;
          return actor[NpcCharacteristicType.SKILLS.VALUE.id];
        }
        
        return null;
      });

      expect(NpcUtils.getPm({})).toBe(7);
    });
  });

  describe('calculatePenalty', () => {
    it('deve calcular penalidade geral e amortecer com stamina', () => {
      vi.spyOn(ActorUtils, 'calculatePenalty').mockReturnValue(4); // Penalty base 4
      vi.spyOn(NpcUtils, 'getStamina').mockReturnValue(2);         // Stamina 2
      // Final: Math.max(4 - 2, 0) = 2
      
      expect(NpcUtils.calculatePenalty({})).toBe(2);
    });
  });

  describe('Booleanos de Capacidades (canBeSpecialist, canHalfTest, canBeOverloaded)', () => {
    // Quality values:
    // WORST: -4, BAD: -2, NORMAL: 0, GOOD: 2, EXCEPTIONAL: 4
    it('canBeSpecialist deve ser verdadeiro para bônus da qualidade > 2 (EXCEPTIONAL)', () => {
      utils.getObject.mockReturnValue(NpcQualityRepository.TYPES.EXCEPTIONAL.id);
      expect(NpcUtils.canBeSpecialist({})).toBe(true);
      
      utils.getObject.mockReturnValue(NpcQualityRepository.TYPES.GOOD.id);
      expect(NpcUtils.canBeSpecialist({})).toBe(false); // <= 2
    });

    it('canHalfTest deve ser verdadeiro para bônus >= 0 (NORMAL pra cima)', () => {
      utils.getObject.mockReturnValue(NpcQualityRepository.TYPES.NORMAL.id);
      expect(NpcUtils.canHalfTest({})).toBe(true);
      
      utils.getObject.mockReturnValue(NpcQualityRepository.TYPES.BAD.id);
      expect(NpcUtils.canHalfTest({})).toBe(false);
    });

    it('canBeOverloaded deve ser verdadeiro para bônus >= 2 (GOOD pra cima)', () => {
      utils.getObject.mockReturnValue(NpcQualityRepository.TYPES.GOOD.id);
      expect(NpcUtils.canBeOverloaded({})).toBe(true);
    });
  });

  describe('calculateInitiative', () => {
    it('deve somar o modificador da Qualidade com o bonus de initiative do ator', () => {
      utils.getObject.mockImplementation((actor, charType) => {
        if (charType === NpcCharacteristicType.QUALITY) return NpcQualityRepository.TYPES.GOOD.id; // mapped = 2
        return 3; // Bonus initiative
      });

      // 2 + 3 = 5
      expect(NpcUtils.calculateInitiative({})).toBe(5);
    });
  });
});

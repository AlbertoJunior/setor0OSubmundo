import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NpcConversor } from '../../../module/core/npc/npc-conversor.mjs';
import { NpcQualityRepository } from '../../../module/repository/npc-quality-repository.mjs';
import { CharacteristicType, NpcCharacteristicType } from '../../../module/enums/characteristic-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  getObject: vi.fn()
}));

describe('NpcConversor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('actorToNpc', () => {
    it('deve converter um Ator completo para o formato NPC, calculando skills e qualidades', () => {
      const mockActor = {
        id: 'actorId',
        uuid: 'actorUuid',
        isOwner: true,
        name: 'NPC Convertido',
        img: 'img.png',
        itemTypes: {},
        effects: [],
        items: [],
        sheet: { canRollOrEdit: true }
      };

      utils.getObject.mockImplementation((actor, charType) => {
        if (charType === CharacteristicType.SKILLS) {
          return {
            'briga': 4,
            'atletismo': 2,
            'medicina': 0,
            'investigacao': 1,
            'intimidacao': 3
          }; // Top 4: briga(4), intimidacao(3), atletismo(2), investigacao(1)
        }
        if (charType === CharacteristicType.ATTRIBUTES) {
          return { forca: 5, destreza: 5 }; // Media alta, lowAttributes = false
        }
        if (charType === CharacteristicType.CORE) {
          return 2; // haveCoreLevel2
        }
        return `mocked_${charType.id || charType}`; // Fallback pra coisas tipo MORPHOLOGY, VITALITY
      });

      const converted = NpcConversor.actorToNpc(mockActor);

      expect(converted.actor.name).toBe('NPC Convertido');
      expect(converted.canRoll).toBe(true);
      expect(converted.canEdit).toBe(false); // Conversões de NPC congelam o edit
      
      // Teste das Qualidades:
      // - isSpecialist = sim (briga == 4) +1
      // - haveCore = sim +1
      // - haveCoreLevel2 = sim +2
      // - total = 4 => EXCEPTIONAL
      expect(converted.actor.system[NpcCharacteristicType.QUALITY.id]).toBe(NpcQualityRepository.TYPES.EXCEPTIONAL.id);
      
      // Teste das Skills Finais:
      // Top original: [briga: 4, intimidacao: 3, atletismo: 2, investigacao: 1]
      // Qualidade EXCEPTIONAL dita ideal_values = [11, 9, 7, 5]
      // A lógica calcula o delta original vs MAX_VARIATION e boosta.
      // Primária(briga=4): delta = Math.max(4-3, -1) = 1. Boosted = 11 + 1 = 12. Final 12.
      const skillsFinal = converted.actor.system[NpcCharacteristicType.SKILLS.id];
      const idValue = NpcCharacteristicType.SKILLS.VALUE.id;
      const idName = NpcCharacteristicType.SKILLS.SKILL_NAME.id;
      
      const primarySkill = skillsFinal[NpcCharacteristicType.SKILLS.PRIMARY.id];
      expect(primarySkill[idValue]).toBe(12);
      expect(primarySkill[idName]).toBe('briga');
      
      const secondarySkill = skillsFinal[NpcCharacteristicType.SKILLS.SECONDARY.id];
      expect(secondarySkill[idValue]).toBe(9);
      expect(secondarySkill[idName]).toBe('intimidacao');
    });

    it('deve gerar qualidade PESSIMO (WORST) caso atributos e skills sejam baixos', () => {
      const mockActor = { sheet: {} };
      utils.getObject.mockImplementation((actor, charType) => {
        if (charType === CharacteristicType.SKILLS) {
          return { 'medicina': 1 }; // Newbie
        }
        if (charType === CharacteristicType.ATTRIBUTES) {
          return { forca: 1, destreza: 1 }; // Média = 1 (< 3)
        }
        if (charType === CharacteristicType.CORE) {
          return 0; 
        }
        return null;
      });

      const converted = NpcConversor.actorToNpc(mockActor);
      // lowAttributes = -2, newbie = -1. Total -3 (<= -2) -> WORST
      expect(converted.actor.system[NpcCharacteristicType.QUALITY.id]).toBe(NpcQualityRepository.TYPES.WORST.id);
    });
  });
});

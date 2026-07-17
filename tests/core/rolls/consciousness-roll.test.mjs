import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollConsciousness } from '../../../module/core/rolls/consciousness-roll.mjs';
import { RollUtils } from '../../../module/utils/roll-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { RollConsciousnessMessageCreator } from '../../../module/creators/message/consciousness-roll.mjs';
import { ChatCreator } from '../../../module/utils/chat-creator.mjs';

describe('RollConsciousness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('operateMessage', () => {
    it('deve retornar null se não houver rolagem padrão', async () => {
      vi.spyOn(RollUtils, 'isOverloadRoll').mockReturnValue(true); 
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const mockMessage = { rolls: [{}] };
      
      const result = await RollConsciousness.operateMessage(mockMessage);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('-> Nenhuma rolagem encontrada');
    });

    it('deve extrair valores antigos, rolar novamente a mesma quantidade de dados e calcular sucessos acumulados', async () => {
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      
      const mockDefaultRoll = { options: { difficulty: 7, automatic: 1 } };
      
      vi.spyOn(RollUtils, 'isOverloadRoll').mockReturnValue(false);
      vi.spyOn(CoreRollMethods, 'getValuesOnRoll').mockReturnValue([5, 8, 9]); // 3 valores. Sucessos base: 2 (8 e 9, >= diff 7)
      
      // Consciência rola de novo a mesma quantidade de dados
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: { options: {} },
        values: [10, 4, 2] // 3 novos valores. Sucessos: 1 (10)
      });

      vi.spyOn(RollConsciousnessMessageCreator, 'mountContent').mockResolvedValue('<div>Consciousness</div>');
      vi.spyOn(ChatCreator, 'sendToChatTypeRoll').mockResolvedValue();

      const mockMessage = { 
        speaker: { actor: 'mockActor' }, 
        rolls: [mockDefaultRoll] 
      };

      const result = await RollConsciousness.operateMessage(mockMessage);
      
      expect(CoreRollMethods.rollDice).toHaveBeenCalledWith(3); // Base tinha length 3
      
      expect(result.values).toEqual([5, 8, 9]); // Roll Antigo
      expect(result.newValues).toEqual([10, 4, 2]); // Roll Novo
      expect(result.difficulty).toBe(7);
      expect(result.automatic).toBe(1);
      
      // Verifica os cálculos de sucessos somados
      expect(result.successes).toEqual({
        first: 2,
        second: 1,
        automatic: 1,
        total: 4 // 2 + 1 + 1 = 4
      });
    });
  });
});

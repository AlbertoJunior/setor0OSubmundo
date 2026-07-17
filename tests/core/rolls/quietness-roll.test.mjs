import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollQuietness } from '../../../module/core/rolls/quietness-roll.mjs';
import { RollUtils } from '../../../module/utils/roll-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { RollQuietnessMessageCreator } from '../../../module/creators/message/quietness-roll.mjs';
import { ChatCreator } from '../../../module/utils/chat-creator.mjs';

describe('RollQuietness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('operateMessage', () => {
    it('deve retornar null se não houver rolagem de sobrecarga', async () => {
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      vi.spyOn(RollUtils, 'isOverloadRoll').mockReturnValue(false); 
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const mockMessage = { speaker: { actor: 'mockActor' }, rolls: [{}] };
      
      const result = await RollQuietness.operateMessage(mockMessage);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('-> Nenhum dado de Sobrecarga rolado');
    });

    it('deve retornar null se não houver rolagem padrão', async () => {
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      vi.spyOn(RollUtils, 'isOverloadRoll').mockReturnValue(true); 
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const mockMessage = { speaker: { actor: 'mockActor' }, rolls: [{}] };
      
      const result = await RollQuietness.operateMessage(mockMessage);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('-> Nenhuma rolagem encontrada'); // Na verdade o array empty da defaultRoll tem length 0
    });

    it('deve processar uma mensagem válida extraindo rolagens de sobrecarga e padrão', async () => {
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      vi.spyOn(ActorUtils, 'havePerseverance').mockReturnValue(true);
      
      const mockDefaultRoll = { options: { difficulty: 7, automatic: 1 } };
      const mockOverloadRoll = { options: {} };
      
      vi.spyOn(RollUtils, 'isOverloadRoll').mockImplementation((roll) => roll === mockOverloadRoll);
      vi.spyOn(CoreRollMethods, 'getValuesOnRoll').mockImplementation((roll) => {
        return roll === mockDefaultRoll ? [5, 8] : [10]; // Overload = [10]
      });

      vi.spyOn(RollQuietnessMessageCreator, 'mountContent').mockResolvedValue('<div>Quietness</div>');
      vi.spyOn(ChatCreator, 'sendToChatTypeRoll').mockResolvedValue();

      const mockMessage = { 
        speaker: { actor: 'mockActor' }, 
        rolls: [mockDefaultRoll, mockOverloadRoll] 
      };

      const result = await RollQuietness.operateMessage(mockMessage);
      
      expect(result.values).toEqual([5, 8]);
      expect(result.removedValues).toEqual([10]); // valores de sobrecarga que foram 'removidos' ao virar quietness
      expect(result.canUseQuietness).toBe(false); // Quietness não pode trigar quietness de novo
      expect(result.canUsePerseverance).toBe(true);
      expect(result.difficulty).toBe(7);
      expect(result.automatic).toBe(1);
    });
  });
});

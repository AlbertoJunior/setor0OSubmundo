import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollPerseverance } from '../../../module/core/rolls/perseverance-roll.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { RollUtils } from '../../../module/utils/roll-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { RollPerseveranceMessageCreator } from '../../../module/creators/message/perseverance-roll.mjs';
import { ChatCreator } from '../../../module/utils/chat-creator.mjs';

describe('RollPerseverance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rerrollValues', () => {
    it('deve remover os dois menores valores e adicionar dois novos resultados de rolagens', async () => {
      // Valores iniciais: 5, 2, 8, 1
      // Menores: 1, 2
      // Sobram: 5, 8
      // Rolagem nova retorna: 6, 10
      // Resultado final: 5, 8, 6, 10
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [6, 10]
      });

      const result = await RollPerseverance.rerrollValues([5, 2, 8, 1]);
      
      expect(CoreRollMethods.rollDice).toHaveBeenCalledWith(2);
      expect(result.removedValues).toEqual([1, 2]);
      expect(result.oldVaues).toEqual([5, 2, 8, 1]); // Erro de tipografia na property original mantido
      expect(result.values).toEqual([5, 8, 6, 10]);
    });

    it('deve lidar com menos de dois valores corretamente', async () => {
      // Apenas 1 valor. Menor será ele mesmo. Remove ele.
      // Sobra: vazio. Rola Math.min(2, 1) = 1 dado extra.
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: {},
        values: [9]
      });

      const result = await RollPerseverance.rerrollValues([3]);
      
      expect(CoreRollMethods.rollDice).toHaveBeenCalledWith(1);
      expect(result.removedValues).toEqual([3]);
      expect(result.oldVaues).toEqual([3]);
      expect(result.values).toEqual([9]); 
    });
  });

  describe('operateMessage', () => {
    it('deve interromper se não existirem rolagens padrão', async () => {
      vi.spyOn(RollUtils, 'isOverloadRoll').mockReturnValue(true); // Tudo é overload
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      const mockMessage = { speaker: { actor: 'mockActor' }, rolls: [{}] };
      
      const result = await RollPerseverance.operateMessage(mockMessage);
      
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('-> Nenhuma rolagem encontrada');
    });

    it('deve processar uma mensagem válida extraindo rolagens', async () => {
      vi.spyOn(ActorUtils, 'getActor').mockReturnValue({});
      
      const mockDefaultRoll = { options: { difficulty: 7, automatic: 1 } };
      const mockOverloadRoll = {};
      
      vi.spyOn(RollUtils, 'isOverloadRoll').mockImplementation((roll) => roll === mockOverloadRoll);
      vi.spyOn(CoreRollMethods, 'getValuesOnRoll').mockImplementation((roll) => {
        return roll === mockDefaultRoll ? [5, 2, 8, 1] : [10]; // Overload = [10]
      });

      // O reroll remove [1, 2] e trás [9, 9] (sobra [5, 8, 9, 9])
      vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
        roll: { options: {} },
        values: [9, 9]
      });

      vi.spyOn(RollPerseveranceMessageCreator, 'mountContent').mockResolvedValue('<div>Content</div>');
      vi.spyOn(ChatCreator, 'sendToChatTypeRoll').mockResolvedValue();

      const mockMessage = { 
        speaker: { actor: 'mockActor' }, 
        rolls: [mockDefaultRoll, mockOverloadRoll] 
      };

      const result = await RollPerseverance.operateMessage(mockMessage);
      
      expect(result.values).toEqual([5, 8, 9, 9]);
      expect(result.overloadValues).toEqual([10]);
      expect(result.canUseQuietness).toBe(true);
      expect(result.difficulty).toBe(7);
      expect(result.automatic).toBe(1);
    });
  });
});

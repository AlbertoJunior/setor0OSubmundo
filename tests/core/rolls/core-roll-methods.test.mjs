import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';

describe('CoreRollMethods', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateDiceAmount', () => {
    it('deve subtrair a quantidade de sobrecarga da quantidade de dados', () => {
      expect(CoreRollMethods.calculateDiceAmount(2, 5)).toBe(3);
    });

    it('não deve retornar um número negativo', () => {
      expect(CoreRollMethods.calculateDiceAmount(5, 2)).toBe(0);
    });
  });

  describe('calculateOverloadDiceAmount', () => {
    it('deve retornar o valor de sobrecarga se for menor que a quantidade de dados', () => {
      vi.spyOn(ActorUtils, 'getOverload').mockReturnValue(2);
      expect(CoreRollMethods.calculateOverloadDiceAmount({}, 5)).toBe(2);
    });

    it('deve retornar a quantidade de dados se a sobrecarga for maior', () => {
      vi.spyOn(ActorUtils, 'getOverload').mockReturnValue(5);
      expect(CoreRollMethods.calculateOverloadDiceAmount({}, 2)).toBe(2);
    });
  });

  describe('getValuesOnRoll', () => {
    it('deve extrair os resultados dos dados do objeto Roll', () => {
      const mockRoll = {
        dice: [
          { results: [{ result: 5 }, { result: 8 }] },
          { results: [{ result: 2 }] }
        ]
      };
      const values = CoreRollMethods.getValuesOnRoll(mockRoll);
      expect(values).toEqual([5, 8, 2]);
    });
  });

  describe('rollDice', () => {
    it('deve rolar dados corretamente se a quantidade for maior que 0', async () => {
      const evaluateMock = vi.fn().mockResolvedValue(true);
      const rollInstance = {
        evaluate: evaluateMock,
        dice: [{ results: [{ result: 10 }] }]
      };
      globalThis.Roll = vi.fn().mockImplementation(function() { return rollInstance; });

      const result = await CoreRollMethods.rollDice(1);
      
      expect(globalThis.Roll).toHaveBeenCalledWith('1d10');
      expect(evaluateMock).toHaveBeenCalled();
      expect(result.roll).toBe(rollInstance);
      expect(result.values).toEqual([10]);
    });

    it('deve retornar undefined para roll se a quantidade for 0 ou menor', async () => {
      const result = await CoreRollMethods.rollDice(0);
      expect(result.roll).toBeUndefined();
      expect(result.values).toEqual([]);
    });
  });

  describe('rollDiceAmountWithOverload', () => {
    it('deve rolar dados normais e de sobrecarga', async () => {
      vi.spyOn(ActorUtils, 'getOverload').mockReturnValue(2);
      
      const evaluateMock = vi.fn().mockResolvedValue(true);
      const rollOverloadInstance = {
        evaluate: evaluateMock,
        dice: [{ results: [{ result: 5 }, { result: 6 }] }]
      };
      const rollDefaultInstance = {
        evaluate: evaluateMock,
        dice: [{ results: [{ result: 8 }] }]
      };
      
      globalThis.Roll = vi.fn()
        .mockImplementationOnce(function() { return rollOverloadInstance; })
        .mockImplementationOnce(function() { return rollDefaultInstance; });

      const result = await CoreRollMethods.rollDiceAmountWithOverload({}, 3);

      expect(result.overload.roll).toBe(rollOverloadInstance);
      expect(result.overload.values).toEqual([5, 6]);
      expect(result.default.roll).toBe(rollDefaultInstance);
      expect(result.default.values).toEqual([8]);
    });
  });

  describe('calculateSuccess', () => {
    it('deve calcular sucessos e falhas de sobrecarga corretamente', () => {
      // dicesOverload: 5 (falha na dificuldade 6), 10 (+3, critico). Soma = 3, crit=true
      // dicesDefault: 8 (sucesso), 1 (-1 porque não é especialista), 6 (sucesso). Soma = 1
      const result = CoreRollMethods.calculateSuccess(
        [5, 10], 
        [8, 1, 6], 
        false, // specialist
        6,     // difficulty
        10,    // criticDifficulty
        1      // automatic
      );

      // Resultado final sem automático: 3 + 1 = 4
      // Resultado com automático (já que foi > 0): 4 + 1 = 5
      expect(result).toEqual({
        result: 5,
        criticalOverload: true,
        failureOverload: false
      });
    });

    it('deve lidar com especialista corretamente ignorando o primeiro resultado 1', () => {
      const result = CoreRollMethods.calculateSuccess(
        [],
        [6, 1], // 6 é sucesso, primeiro 1 é ignorado
        true, // specialist
        6, // diff
        10, // criticDiff
        0 // auto
      );
      expect(result.result).toBe(1);
    });

    it('especialista deve descontar o segundo resultado 1', () => {
      const result = CoreRollMethods.calculateSuccess(
        [],
        [6, 1, 1], // 6 é sucesso, primeiro 1 ignorado, segundo 1 desconta sucesso
        true, // specialist
        6, // diff
        10, // criticDiff
        0 // auto
      );
      expect(result.result).toBe(0); // 1 sucesso - 1 falha = 0
    });

    it('deve aplicar falha de sobrecarga e não conceder sucesso automático se o total for <= 0', () => {
      const result = CoreRollMethods.calculateSuccess(
        [1, 1], // 1 subtrai 3 e marca falha. Soma = -6
        [], 
        false, 6, 10, 1 // automatic 1
      );
      
      // Quando resultado final <= 0 o automático não é adicionado
      expect(result).toEqual({
        result: -6,
        criticalOverload: false,
        failureOverload: true
      });
    });

    it('deve contar acertos críticos corretamente para Default e converter a cada par de críticos', () => {
      // 10 = crítico, 10 = crítico, 8 = normal, 9 = crítico (já que criticDiff=9).
      // Total de sucessos base: 4
      // Críticos totais: 3. Como é ímpar, ele diminui 1 e usa 2 para o par.
      // 2 / 2 = 1 sucesso bônus extra.
      // Total = 4 base + 1 bônus = 5.
      const result = CoreRollMethods.calculateSuccess(
        [],
        [10, 10, 8, 9], 
        false,
        6, // diff
        9, // criticDiff
        0
      );
      expect(result.result).toBe(5);
    });
  });
  describe('Cenários Complexos de Rolagem (Integração)', () => {
    it('deve resultar em Sucesso Explosivo (valores do usuário)', () => {
      // Overload: [10, 9, 9, 1] => 10(+3, crit), 9(+1), 9(+1), 1(-3, fail). Soma = 2.
      // Default: [8, 7, 6, 6, 5, 5, 1, 1], diff 7, critDiff 9, specialist true.
      // 8(+1), 7(+1), 6(0), 6(0), 5(0), 5(0), 1(ignorada), 1(-1). Soma = 1.
      // Total = 3. Automatic = 0. Resultado = 3.
      // criticalOverload: true (teve 10 no overload e resultado > 0)
      // failureOverload: false (teve 1 no overload, mas o resultado final foi positivo)
      const result = CoreRollMethods.calculateSuccess(
        [10, 9, 9, 1],
        [8, 7, 6, 6, 5, 5, 1, 1],
        true, // specialist
        7, // diff
        9, // criticDiff
        0 // auto
      );
      expect(result).toEqual({
        result: 3,
        criticalOverload: true,
        failureOverload: false
      });
    });

    it('deve resultar em Falha Caótica', () => {
      // Falha Caótica: O resultado final é negativo ou zero, e houve falha de sobrecarga (resultado 1).
      // Overload: [1, 2] => 1(-3, fail), 2(0). Soma = -3.
      // Default: [1, 1, 2] => 1(-1), 1(-1), 2(0), diff 7, specialist false. Soma = -2.
      // Total = -5.
      const result = CoreRollMethods.calculateSuccess(
        [1, 2],
        [1, 1, 2],
        false, 7, 10, 0
      );
      expect(result).toEqual({
        result: -5,
        criticalOverload: false,
        failureOverload: true
      });
    });

    it('deve resultar em Sucesso simples', () => {
      // Sucesso: Resultado positivo, sem crítico de sobrecarga.
      // Overload: [8] => 8(+1), diff 7. Soma = 1.
      // Default: [8, 8] => 8(+1), 8(+1), diff 7. Soma = 2.
      // Total = 3.
      const result = CoreRollMethods.calculateSuccess(
        [8],
        [8, 8],
        false, 7, 10, 0
      );
      expect(result).toEqual({
        result: 3,
        criticalOverload: false,
        failureOverload: false
      });
    });

    it('deve resultar em Falha simples', () => {
      // Falha: Resultado <= 0, mas sem rolagem 1 na sobrecarga.
      // Overload: [5] => 5(0), diff 7. Soma = 0.
      // Default: [5] => 5(0), diff 7. Soma = 0.
      // Total = 0.
      const result = CoreRollMethods.calculateSuccess(
        [5],
        [5],
        false, 7, 10, 0
      );
      expect(result).toEqual({
        result: 0,
        criticalOverload: false,
        failureOverload: false
      });
    });

    it('deve resultar em Falha Crítica', () => {
      // Falha Crítica: Resultado negativo acumulado pelos dados normais, sem falha na sobrecarga.
      // Overload: [5] => 5(0). Soma = 0.
      // Default: [1, 1, 1] => 1(-1), 1(-1), 1(-1), diff 7, specialist false. Soma = -3.
      // Total = -3.
      const result = CoreRollMethods.calculateSuccess(
        [5],
        [1, 1, 1],
        false, 7, 10, 0
      );
      expect(result).toEqual({
        result: -3,
        criticalOverload: false,
        failureOverload: false
      });
    });
  });
});

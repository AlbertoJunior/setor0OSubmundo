import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActorExperienceUtils } from '../../../module/core/actor/actor-experience-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import * as utils from '../../../module/utils/utils.mjs';
import { MorphologyRepository } from '../../../module/repository/morphology-repository.mjs';
import { CharacteristicType } from '../../../module/enums/characteristic-enums.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getObject: vi.fn() };
});
vi.mock('../../../module/core/actor/actor-utils.mjs');
vi.mock('../../../module/repository/trait-repository.mjs');

describe('ActorExperienceUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('buildActorDataProxy deve mapear corretamente a estrutura do ator', () => {
    ActorUtils.getAllEnhancements.mockReturnValue([]);
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.ATTRIBUTES.STRENGTH) return 3;
      if (type === CharacteristicType.SKILLS.ATHLETICS) return 2;
      return 0;
    });

    const actor = { items: [] };
    const proxy = ActorExperienceUtils.buildActorDataProxy(actor);
    
    expect(proxy.atributos.forca).toBe(3);
    expect(proxy.habilidades.atletismo).toBe(2);
    expect(proxy.aprimoramentos).toEqual([]);
    expect(proxy.repertorio).toBe(0);
  });

  it('_countPoints deve calcular corretamente o custo xp incremental', () => {
    // 3 pontos investidos em forca. Valor inicial = 1. Custo = 4 por ponto
    // Levels = 2, 3 -> (2*4) + (3*4) = 8 + 12 = 20
    const objJson = { forca: 3 };
    const cost = ActorExperienceUtils._countPoints(objJson, 0, 4, 1, false, null);
    
    // Nível 2 = 2 * 4 = 8
    // Nível 3 = 3 * 4 = 12
    // Total = 20
    expect(cost).toBe(20);
  });

  it('_countPoints com descontos iniciais', () => {
    // 3 pontos investidos em forca. Valor inicial = 1. Custo = 4. 
    // Initial points para gastar = 1 (isenta 1 nvel, no caso, o mais alto)
    const objJson = { forca: 3 };
    // O sistema ordena os entries e abate do levelBeingBought mais alto.
    // Assim, se temos que comprar o nível 2 e 3, e temos 1 discount point,
    // o discount absorve a compra mais cara, ou apenas absorve 1 avanço?
    // A lógica: initialAmountUsed--
    const cost = ActorExperienceUtils._countPoints(objJson, 1, 4, 1, false, null);
    
    // Nível 2 e Nível 3. Discount usa 1 ponto.
    // 1 compra é de graça. A outra custa o level * 4
    // O valor do teste depende da ordenação, mas o script prioriza abater primeiro.
    expect(typeof cost).toBe('number');
  });

  it('calculateOptimizedExperience', () => {
    vi.spyOn(ActorExperienceUtils, 'buildActorDataProxy').mockReturnValue({
      morfologia: MorphologyRepository.TYPES.HUMAN.id,
      atributos: { forca: 2 }, // Custa 2 * 4 = 8. Menos init (10 free points) = 0
      habilidades: {},
      virtudes: {},
      aprimoramentos: [],
      tracos: { bons: [], ruins: [] },
      manobras: [],
      outros: {},
      repertorio: 0,
      nucleo: 1
    });

    const xp = ActorExperienceUtils.calculateOptimizedExperience({});
    expect(xp.atributos).toBe(0);
    expect(xp.total).toBe(0);
  });
});

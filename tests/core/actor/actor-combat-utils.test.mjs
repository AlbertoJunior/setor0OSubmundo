import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActorCombatUtils } from '../../../module/core/actor/actor-combat-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import * as utils from '../../../module/utils/utils.mjs';
import { CharacteristicType } from '../../../module/enums/characteristic-enums.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getObject: vi.fn() };
});

describe('ActorCombatUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ActorUtils, 'calculateDices').mockReturnValue(5);
  });

  it('calculateOffensiveProjectileDices', () => {
    utils.getObject.mockReturnValue(3); // Bonus
    const res = ActorCombatUtils.calculateOffensiveProjectileDices({});
    expect(res).toBe(8); // 5 (dices) + 3 (bonus)
    expect(utils.getObject).toHaveBeenCalledWith(expect.anything(), CharacteristicType.BONUS.OFENSIVE_PROJECTILE);
    expect(ActorUtils.calculateDices).toHaveBeenCalledWith(expect.anything(), CharacteristicType.ATTRIBUTES.DEXTERITY.id, CharacteristicType.ATTRIBUTES.PERCEPTION.id, CharacteristicType.SKILLS.PROJECTILE.id);
  });

  it('calculateOffensiveMeleeDices', () => {
    utils.getObject.mockReturnValue(2); // Bonus
    const res = ActorCombatUtils.calculateOffensiveMeleeDices({});
    expect(res).toBe(7); // 5 (dices) + 2 (bonus)
    expect(utils.getObject).toHaveBeenCalledWith(expect.anything(), CharacteristicType.BONUS.OFENSIVE_MELEE);
  });

  it('calculateOffensiveBrawlDices', () => {
    utils.getObject.mockReturnValue(0); // Bonus
    const res = ActorCombatUtils.calculateOffensiveBrawlDices({});
    expect(res).toBe(5); // 5 (dices) + 0 (bonus)
    expect(utils.getObject).toHaveBeenCalledWith(expect.anything(), CharacteristicType.BONUS.OFENSIVE_MELEE);
  });

  it('calculateDefensiveDodgeDices (Defesa com Fator Fracionário)', () => {
    // getBonus = Math.floor(safeDices * bonusFactor) + bonusFlat
    // factor = 0.5, flat = 1, safeDices = 5
    // 5 * 0.5 = 2.5 -> Math.floor = 2. + flat(1) = 3
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.BONUS.DEFENSIVE_FACTOR) return 0.5;
      if (type === CharacteristicType.BONUS.DEFENSIVE) return 1;
      return 0;
    });

    const res = ActorCombatUtils.calculateDefensiveDodgeDices({});
    expect(res).toBe(8); // 5 (dices) + 3 (bonus)
  });

  it('calculateDefensiveDodgeDices (Defesa com Fator Zero)', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.BONUS.DEFENSIVE_FACTOR) return 0;
      if (type === CharacteristicType.BONUS.DEFENSIVE) return 2;
      return 0;
    });

    const res = ActorCombatUtils.calculateDefensiveDodgeDices({});
    expect(res).toBe(7); // 5 (dices) + 2 (flat bonus)
  });

  it('calculateDefensiveHalfDodgeDices (Defesa Dividida / Half Dodge)', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.BONUS.DEFENSIVE_FACTOR) return 0.5;
      if (type === CharacteristicType.BONUS.DEFENSIVE) return 0;
      return 0;
    });
    // O bonus é calculado SOBRE safeDices = 5, então o bonus = Math.floor(5 * 0.5) = 2.
    // O dado dividido = Math.floor(5 / 2) = 2.
    // Total = 2 + 2 = 4
    const res = ActorCombatUtils.calculateDefensiveHalfDodgeDices({});
    expect(res).toBe(4);
  });

  it('calculateDefensiveBlockMeleeDices & Half Block Melee', () => {
    utils.getObject.mockReturnValue(0);
    const res = ActorCombatUtils.calculateDefensiveBlockMeleeDices({});
    expect(res).toBe(5); // apenas os dices base

    const halfRes = ActorCombatUtils.calculateDefensiveHalfBlockMeleeDices({});
    expect(halfRes).toBe(2); // Math.floor(5/2)
  });

  it('calculateDefensiveBlockBrawlDices & Half Block Brawl', () => {
    utils.getObject.mockReturnValue(0);
    const res = ActorCombatUtils.calculateDefensiveBlockBrawlDices({});
    expect(res).toBe(5);

    const halfRes = ActorCombatUtils.calculateDefensiveHalfBlockBrawlDices({});
    expect(halfRes).toBe(2);
  });
});

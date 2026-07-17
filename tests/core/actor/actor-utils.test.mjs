import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import * as utils from '../../../module/utils/utils.mjs';
import { BaseActorCharacteristicType, CharacteristicType } from '../../../module/enums/characteristic-enums.mjs';
import { MorphologyRepository } from '../../../module/repository/morphology-repository.mjs';
import { FlagsUtils } from '../../../module/utils/flags-utils.mjs';
import { ActiveEffectsUtils } from '../../../module/core/effect/active-effects-utils.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getObject: vi.fn(), localize: vi.fn(k => `LOCALIZED_${k}`) };
});
vi.mock('../../../module/utils/flags-utils.mjs');
vi.mock('../../../module/core/effect/active-effects-utils.mjs');

describe('ActorUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isSynthetic', () => {
    utils.getObject.mockReturnValue(MorphologyRepository.TYPES.SYNTHETIC.id);
    expect(ActorUtils.isSynthetic({})).toBe(true);

    utils.getObject.mockReturnValue(MorphologyRepository.TYPES.HUMAN.id);
    expect(ActorUtils.isSynthetic({})).toBe(false);
  });

  it('getAttributeValue', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.ATTRIBUTES) return { str: 2 };
      if (type === CharacteristicType.BONUS.ATTRIBUTES) return { str: 1 };
      return {};
    });
    expect(ActorUtils.getAttributeValue({}, 'str')).toBe(3);
  });

  it('getAbilityValue', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.SKILLS) return { athletics: 3 };
      if (type === CharacteristicType.BONUS.SKILL) return { athletics: -1 };
      return {};
    });
    expect(ActorUtils.getAbilityValue({}, 'athletics')).toBe(2);
  });

  it('calculatePenalty', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.ATTRIBUTES.STAMINA) return 2;
      if (type === BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) return 5;
      if (type === CharacteristicType.BONUS.DAMAGE_PENALTY) return 1; // +1 penalty
      if (type === CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT) return 0;
      if (type === BaseActorCharacteristicType.MORPHOLOGY) return MorphologyRepository.TYPES.HUMAN.id;
      return 0;
    });

    // letal = 5, stamina = 2, synthetic = 0, bonus = 1
    // 5 - 2 + 1 = 4. 
    // Max 4. Total = 4.
    expect(ActorUtils.calculatePenalty({})).toBe(4);

    // If stamina is 5 => 5 - 5 + 1 = 1
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.ATTRIBUTES.STAMINA) return 5;
      if (type === BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) return 5;
      if (type === CharacteristicType.BONUS.DAMAGE_PENALTY) return 1;
      if (type === BaseActorCharacteristicType.MORPHOLOGY) return MorphologyRepository.TYPES.HUMAN.id;
      return 0;
    });
    expect(ActorUtils.calculatePenalty({})).toBe(1);

    // Extreme Edge Case (Limite Máximo e Flat)
    // letal = 10, stamina = 0, synthetic = 0, bonus = 5.
    // 10 - 0 + 5 = 15 => Math.min(15, 4) => 4
    // + flatPenalty de 2 = 6
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.ATTRIBUTES.STAMINA) return 0;
      if (type === BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE) return 10;
      if (type === CharacteristicType.BONUS.DAMAGE_PENALTY) return 5;
      if (type === CharacteristicType.BONUS.DAMAGE_PENALTY_FLAT) return 2;
      if (type === BaseActorCharacteristicType.MORPHOLOGY) return MorphologyRepository.TYPES.HUMAN.id;
      return 0;
    });
    expect(ActorUtils.calculatePenalty({})).toBe(6);
  });

  it('calculateDices', () => {
    vi.spyOn(ActorUtils, 'getAttributeValue').mockImplementation((a, attr) => attr === 'a1' ? 4 : 2);
    vi.spyOn(ActorUtils, 'getAbilityValue').mockReturnValue(3);

    // a1=4, a2=2 => 6 / 2 = 3. 3 + abil(3) = 6
    expect(ActorUtils.calculateDices({}, 'a1', 'a2', 'abil')).toBe(6);
  });

  it('calculateMovimentPoints', () => {
    vi.spyOn(ActorUtils, 'getAttributeValue').mockReturnValue(4); // dex
    vi.spyOn(ActorUtils, 'getAbilityValue').mockReturnValue(2); // athletics
    utils.getObject.mockReturnValue(1); // bonusPM = 1

    // base 1 + ath 2 + bonus 1 + dex/2 (2) = 6
    expect(ActorUtils.calculateMovimentPoints({})).toBe(6);
  });

  it('getActualMovimentPoints', () => {
    vi.spyOn(ActorUtils, 'calculateMovimentPoints').mockReturnValue(9);
    FlagsUtils.getActorFlag.mockReturnValue(4);
    expect(ActorUtils.getActualMovimentPoints({})).toBe(5);
  });

  it('calculateTotalLanguages (Robust Test)', () => {
    // Streetwise 0 = 1, 1 = 2, 2 = 3, 3 = 5
    utils.getObject.mockReturnValueOnce(0);
    expect(ActorUtils.calculateTotalLanguages({})).toBe(1);

    utils.getObject.mockReturnValueOnce(1);
    expect(ActorUtils.calculateTotalLanguages({})).toBe(2);

    utils.getObject.mockReturnValueOnce(2);
    expect(ActorUtils.calculateTotalLanguages({})).toBe(3); // 1 + (2 - 1) * 2 = 3

    utils.getObject.mockReturnValueOnce(4);
    expect(ActorUtils.calculateTotalLanguages({})).toBe(7); // 1 + (4 - 1) * 2 = 7
  });

  it('calculateTotalExperience', () => {
    utils.getObject.mockImplementation((actor, type) => {
      if (type === CharacteristicType.EXPERIENCE.CURRENT) return 15;
      if (type === CharacteristicType.EXPERIENCE.USED) return 30;
      return 0;
    });
    expect(ActorUtils.calculateTotalExperience({})).toBe(45);
  });

  it('getOverloadLimit (Robust Limites)', () => {
    // Normal com debuff que deixaria negativo (deve barrar no zero)
    // Limite Padrão é 5
    utils.getObject.mockReturnValueOnce(-15);
    expect(ActorUtils.getOverloadLimit({})).toBe(0);

    // Buffado (5 + 5 = 10)
    utils.getObject.mockReturnValueOnce(5);
    expect(ActorUtils.getOverloadLimit({})).toBe(10);
  });

  it('getEffectsSorted (Robust Test de Ordenação)', () => {
    const LOCALIZED_APRIMORAMENTO = 'LOCALIZED_Aprimoramento.Nome';
    
    // Simula a injeção do originId para controle (ActiveEffectsUtils foi mockado)
    ActiveEffectsUtils.getOriginId.mockImplementation(effect => {
      if (effect.origin === 'dead-origin') return 'dead';
      return effect.id;
    });

    const effectDead = { id: 'e1', name: 'Z Morto', origin: 'dead-origin' };
    const effectEnhA = { id: 'e2', name: 'B Força', origin: `item-${LOCALIZED_APRIMORAMENTO}` };
    const effectEnhB = { id: 'e3', name: 'A Agilidade', origin: `item-${LOCALIZED_APRIMORAMENTO}` };
    const effectOtherA = { id: 'e4', name: 'D Sangrando', origin: 'item-x' };
    const effectOtherB = { id: 'e5', name: 'C Atordoado', origin: 'item-y' };

    // Lista embaralhada
    const actor = {
      effects: {
        contents: [effectOtherA, effectEnhB, effectDead, effectOtherB, effectEnhA]
      }
    };

    const sorted = ActorUtils.getEffectsSorted(actor);

    // Ordem esperada:
    // 1º Dead (Dead tem precedência absoluta)
    // 2º Enhancements por ordem alfabética: 'A Agilidade', 'B Força'
    // 3º Others por origin/alfabética: 'item-x'/'item-y' e depois nome
    expect(sorted[0].id).toBe('e1'); // Z Morto
    expect(sorted[1].id).toBe('e3'); // A Agilidade
    expect(sorted[2].id).toBe('e2'); // B Força
    expect(sorted[3].id).toBe('e4'); // D Sangrando (origin vem antes ou compara nome dependendo da ordem alfabetica de origin)
    expect(sorted[4].id).toBe('e5'); // C Atordoado
  });
});

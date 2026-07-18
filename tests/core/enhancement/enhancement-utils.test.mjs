import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancementUtils } from '../../../module/core/enhancement/enhancement-utils.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { CombatUtils } from '../../../module/core/combat/combat-utils.mjs';
import { EnhancementRepository } from '../../../module/repository/enhancement-repository.mjs';
import { ActiveEffectsUtils } from '../../../module/core/effect/active-effects-utils.mjs';
import { EffectChangeValueType, EnhancementDuration } from '../../../module/enums/enhancement-enums.mjs';
import { COLORS } from '../../../module/constants.mjs';

vi.mock('../../../module/core/actor/actor-utils.mjs');
vi.mock('../../../module/core/combat/combat-utils.mjs');
vi.mock('../../../module/repository/enhancement-repository.mjs');
vi.mock('../../../module/core/effect/active-effects-utils.mjs');

describe('EnhancementUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifyAndSetEffectChanges (Stress Test Fórmulas Dinâmicas)', () => {
    // Simulando nível de aprimoramento 5 para testar arredondamento (Math.floor(5/2) = 2)
    ActorUtils.getEnhancementLevel.mockReturnValue(5);

    const activeEffectData = {};
    const effectChanges = [
      { key: 'fixed', typeOfValue: EffectChangeValueType.FIXED, value: 7 }, // value = 7
      { key: 'level', typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL }, // value = 5
      { key: 'half_level', typeOfValue: EffectChangeValueType.HALF_ENHANCEMENT_LEVEL }, // Math.floor(5/2) = 2
      { key: 'lvl_plus_fix', typeOfValue: EffectChangeValueType.ENHANCEMENT_LEVEL_PLUS_FIXED, value: 3 }, // 5 + 3 = 8
      { key: 'half_lvl_plus_fix', typeOfValue: EffectChangeValueType.HALF_ENHANCEMENT_LEVEL_PLUS_FIXED, value: 4 }, // 2 + 4 = 6
      { key: 'other', typeOfValue: EffectChangeValueType.OTHER_VALUE, value: 99, otherValue: 42 } // otherValue = 42 (para actor que agora passa como actor, mas neste mock o otherValue no utils usa a propria constante que passa o actor. Na verdade o código no utils envia "actor" como "otherValue".)
    ];

    // O 3º parâmetro do valueCalculators[OTHER_VALUE] recebe o que é passado na chamada,
    // que no código fonte é "actor". Então ele retorna o objeto actor. 
    // Vamos testar passando um actor mock com id 'actor-xyz'.
    const mockActor = { id: 'actor-xyz' };

    EnhancementUtils.verifyAndSetEffectChanges(mockActor, activeEffectData, effectChanges, {});

    expect(activeEffectData.changes.length).toBe(6);
    expect(activeEffectData.changes.find(c => c.key === 'fixed').value).toBe(7);
    expect(activeEffectData.changes.find(c => c.key === 'level').value).toBe(5);
    expect(activeEffectData.changes.find(c => c.key === 'half_level').value).toBe(2);
    expect(activeEffectData.changes.find(c => c.key === 'lvl_plus_fix').value).toBe(8);
    expect(activeEffectData.changes.find(c => c.key === 'half_lvl_plus_fix').value).toBe(6);

    // "OTHER_VALUE" devolve o `otherValue` que vem no próprio change.
    // otherValue foi configurado como 42.
    expect(activeEffectData.changes.find(c => c.key === 'other').value).toBe(42);
  });

  it('configureActiveEffect (Time/Scene - With Combat)', () => {
    const effectData = {};
    const effect = { duration: EnhancementDuration.TIME, id: 'eff1' };
    const enhancement = { id: 'enh1' };

    ActiveEffectsUtils.getFlags.mockReturnValue({ combatId: 'c1' });
    CombatUtils.currentCombat.mockReturnValue({ round: 2, turn: 1 });

    EnhancementRepository.getEnhancementById.mockReturnValue({ icon: 'icon.png' });
    EnhancementRepository.getEnhancementEffectById.mockReturnValue({ level: 1 });

    EnhancementUtils.configureActiveEffect(effectData, effect, enhancement);

    expect(effectData.duration.startRound).toBe(2);
    expect(effectData.duration.rounds).toBe(99);
    expect(effectData.img).toBe('icon.png');
    expect(effectData.tint).toBe(COLORS.ENHANCEMENT_LEVELS.level1);
  });

  it('configureActiveEffect (Use)', () => {
    const effectData = {};
    const effect = { duration: EnhancementDuration.USE, id: 'eff1' };
    const enhancement = { id: 'enh1' };

    EnhancementUtils.configureActiveEffect(effectData, effect, enhancement);

    expect(effectData.duration.rounds).toBe(1);
    expect(effectData.duration.startRound).toBe(0);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollInitiative } from '../../../module/core/rolls/initiative-roll.mjs';
import { ActorUtils } from '../../../module/core/actor/actor-utils.mjs';
import { NpcUtils } from '../../../module/core/npc/npc-utils.mjs';
import { CoreRollMethods } from '../../../module/core/rolls/core-roll-methods.mjs';
import { ActorType } from '../../../module/enums/characteristic-enums.mjs';

describe('RollInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular iniciativa para Player usando ActorUtils', async () => {
    const mockActor = { type: ActorType.PLAYER };
    vi.spyOn(ActorUtils, 'calculateInitiative').mockReturnValue(5);
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: { dice: [] },
      values: [8]
    });

    const result = await RollInitiative.roll(mockActor);
    
    expect(ActorUtils.calculateInitiative).toHaveBeenCalledWith(mockActor);
    expect(result.initiative).toBe(5);
    expect(result.value).toBe(8);
    expect(result.total).toBe(13);
  });

  it('deve calcular iniciativa para NPC usando NpcUtils', async () => {
    const mockActor = { type: ActorType.NPC };
    vi.spyOn(NpcUtils, 'calculateInitiative').mockReturnValue(4);
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: {},
      values: [2]
    });

    const result = await RollInitiative.roll(mockActor);
    
    expect(NpcUtils.calculateInitiative).toHaveBeenCalledWith(mockActor);
    expect(result.initiative).toBe(4);
    expect(result.value).toBe(2);
    expect(result.total).toBe(6);
  });

  it('deve retornar 0 de bônus de iniciativa para tipos desconhecidos', async () => {
    const mockActor = { type: 'unknown_type' };
    vi.spyOn(CoreRollMethods, 'rollDice').mockResolvedValue({
      roll: {},
      values: [10]
    });

    const result = await RollInitiative.roll(mockActor);
    
    expect(result.initiative).toBe(0);
    expect(result.value).toBe(10);
    expect(result.total).toBe(10);
  });
});

import { describe, it, expect, vi } from 'vitest';
import actorValues from '../../module/helpers/actorValues.mjs';
import { ActorUtils } from '../../module/core/actor/actor-utils.mjs';
import * as Utils from '../../module/utils/utils.mjs';

vi.mock('../../module/core/actor/actor-utils.mjs', () => {
  return {
    ActorUtils: {
      getVirtueLevel: vi.fn(),
      calculatePenalty: vi.fn()
    }
  };
});
vi.mock('../../module/utils/utils.mjs');

describe('Helper: actorValues', () => {
  it('should map raw_characteristic by accessing getObject and property', () => {
    Utils.getObject.mockReturnValue({ value: 10 });
    
    // actorValues recebe (actor, helperKey, param1, param2, hbContext)
    const result = actorValues({}, 'raw_characteristic', 'some.path', 'value', {});
    expect(result).toBe(10);
  });

  it('should map virtue_level calling ActorUtils', () => {
    ActorUtils.getVirtueLevel.mockReturnValue(5);
    
    const result = actorValues({}, 'virtue_level', 'S0.Consciousness', {});
    expect(result).toBe(5);
    expect(ActorUtils.getVirtueLevel).toHaveBeenCalledWith({}, 'S0.Consciousness');
  });

  it('should map penalty calling ActorUtils', () => {
    ActorUtils.calculatePenalty.mockReturnValue(-2);
    
    const result = actorValues({}, 'penalty', {});
    expect(result).toBe(-2);
  });
});

import { describe, it, expect, vi } from 'vitest';
import actorLists from '../../module/helpers/actorLists.mjs';
import { ActorEquipmentUtils } from '../../module/core/actor/actor-equipment-utils.mjs';
import { ActorUtils } from '../../module/core/actor/actor-utils.mjs';
import * as Utils from '../../module/utils/utils.mjs';

vi.mock('../../module/core/actor/actor-equipment-utils.mjs');
vi.mock('../../module/core/actor/actor-utils.mjs');
vi.mock('../../module/utils/utils.mjs');

describe('Helper: actorLists', () => {
  it('should map equipment_filtered correctly', () => {
    const mockActor = { sheet: { filterBag: 1 } };
    ActorEquipmentUtils.getFilteredUnequippedEquipment.mockReturnValue(['item1']);
    
    expect(actorLists(mockActor, 'equipment_filtered')).toEqual(['item1']);
    expect(ActorEquipmentUtils.getFilteredUnequippedEquipment).toHaveBeenCalledWith(mockActor, 1);
  });

  it('should map allies via ActorUtils', () => {
    ActorUtils.getAllies.mockReturnValue(['ally1']);
    expect(actorLists({}, 'allies')).toEqual(['ally1']);
  });

  it('should map bad_traits via getObject', () => {
    Utils.getObject.mockReturnValue(['trait1']);
    expect(actorLists({}, 'bad_traits')).toEqual(['trait1']);
  });

  it('should return empty array for unknown mapping', () => {
    expect(actorLists({}, 'unknown_list')).toEqual([]);
  });
});

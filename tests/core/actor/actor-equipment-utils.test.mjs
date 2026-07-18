import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActorEquipmentUtils } from '../../../module/core/actor/actor-equipment-utils.mjs';
import { EquipmentUpdater } from '../../../module/base/updater/equipment-updater.mjs';
import { EquipmentUtils } from '../../../module/core/equipment/equipment-utils.mjs';
import { ActiveEffectsUtils } from '../../../module/core/effect/active-effects-utils.mjs';
import * as utils from '../../../module/utils/utils.mjs';
import { EquipmentCharacteristicType } from '../../../module/enums/equipment-enums.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getObject: vi.fn() };
});
vi.mock('../../../module/base/updater/equipment-updater.mjs');
vi.mock('../../../module/core/equipment/equipment-utils.mjs');
vi.mock('../../../module/core/effect/active-effects-utils.mjs');

describe('ActorEquipmentUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getEquipments', () => {
    const actor = {
      itemTypes: {
        'Melee': [{ sort: 2, id: 'w2' }, { sort: 1, id: 'w1' }],
        'Armor': [{ sort: 3, id: 'a1' }],
        'not-allowed': [{ id: 'not' }]
      }
    };

    const equipments = ActorEquipmentUtils.getEquipments(actor);
    expect(equipments.length).toBe(3);
    // Sort deve ser respeitado
    expect(equipments[0].id).toBe('w1');
    expect(equipments[1].id).toBe('w2');
    expect(equipments[2].id).toBe('a1');
  });

  it('getEquippedItems', () => {
    vi.spyOn(ActorEquipmentUtils, 'getEquipments').mockReturnValue([{ id: 'i1' }, { id: 'i2' }]);
    utils.getObject.mockImplementation((item) => item.id === 'i1' ? true : false); // Apenas i1 está equipado

    const items = ActorEquipmentUtils.getEquippedItems({});
    expect(items.length).toBe(1);
    expect(items[0].id).toBe('i1');
  });

  it('equip', async () => {
    const actor = { effects: [] };
    const equipment = { id: 'eq1' };

    EquipmentUpdater.createChange.mockReturnValue({ key: 'equipped', value: true });
    utils.getObject.mockReturnValue(true); // Is Super Equipment
    EquipmentUtils.getSuperEquipmentNeedsActivate.mockReturnValue(false);

    await ActorEquipmentUtils.equip(actor, equipment);

    expect(EquipmentUpdater.createChange).toHaveBeenCalledWith(EquipmentCharacteristicType.EQUIPPED, true);
    expect(EquipmentUpdater.createChange).toHaveBeenCalledWith(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, true);
    expect(EquipmentUpdater.updateEquipmentData).toHaveBeenCalled();
  });

  it('unequip', async () => {
    const actor = { effects: [] };
    const equipment = { id: 'eq1' };

    EquipmentUpdater.createChange.mockReturnValue({ key: 'equipped', value: false });
    utils.getObject.mockReturnValue(true); // Is Super Equipment
    ActiveEffectsUtils.getActorEffect.mockReturnValue(true);

    await ActorEquipmentUtils.unequip(actor, equipment);

    expect(EquipmentUpdater.createChange).toHaveBeenCalledWith(EquipmentCharacteristicType.SUPER_EQUIPMENT.ACTIVE, false);
    expect(ActiveEffectsUtils.removeActorEffect).toHaveBeenCalledWith(actor, 'eq1');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollManeuver } from '../../../module/core/actor/roll-maneuver.mjs';
import { ActorEquipmentUtils } from '../../../module/core/actor/actor-equipment-utils.mjs';
import { ManeuverUtils } from '../../../module/utils/maneuver-utils.mjs';
import { CreateFormDialog } from '../../../module/creators/dialog/create-dialog.mjs';
import * as playerRollMethods from '../../../module/base/sheet/actor/player/methods/player-roll-methods.mjs';
import { NotificationsUtils } from '../../../module/creators/message/notifications.mjs';

vi.mock('../../../module/core/actor/actor-equipment-utils.mjs');
vi.mock('../../../module/utils/maneuver-utils.mjs');
vi.mock('../../../module/creators/dialog/create-dialog.mjs');
vi.mock('../../../module/creators/message/notifications.mjs');
describe('RollManeuver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve abortar rolagem caso a manobra precise de arma mas o ator nao tenha nenhuma equipada', async () => {
    const actor = {};
    const maneuver = { system: {} };
    
    ManeuverUtils.getRequiredWeaponType.mockReturnValue('melee');
    ActorEquipmentUtils.getEquippedItems.mockReturnValue([]);

    await RollManeuver.roll(actor, maneuver);

    expect(NotificationsUtils.warning).toHaveBeenCalled();
    expect(CreateFormDialog.open).not.toHaveBeenCalled();
  });

  it('deve abrir dialog caso tudo esteja certo', async () => {
    const actor = {};
    const maneuver = { system: {}, name: 'Manobra Especial' };
    
    ManeuverUtils.getRequiredWeaponType.mockReturnValue(null);

    await RollManeuver.roll(actor, maneuver);

    expect(CreateFormDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      'rolls/modifiers',
      expect.objectContaining({
        presetForm: expect.objectContaining({
          needsWeapon: false
        })
      })
    );
  });
});

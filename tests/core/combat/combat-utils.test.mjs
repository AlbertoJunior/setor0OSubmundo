import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CombatUtils } from '../../../module/core/combat/combat-utils.mjs';
import { TokenUtils } from '../../../module/core/token/token-utils.mjs';

vi.mock('../../../module/core/token/token-utils.mjs');


describe('CombatUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.game = {
      combat: {
        combatants: [],
        createEmbeddedDocuments: vi.fn()
      }
    };
    global.ui = {
      combat: {
        render: vi.fn()
      }
    };
  });

  it('refreshRender', () => {
    CombatUtils.refreshRender();
    expect(global.ui.combat.render).toHaveBeenCalled();
  });

  it('addOrUpdateActorOnCombat (adiciona novo)', async () => {
    const actor = { id: 'act1' };
    const token = { id: 'tok1', scene: { id: 'sc1' } };
    
    TokenUtils.getActorToken.mockReturnValue(token);

    await CombatUtils.addOrUpdateActorOnCombat(actor, 10, { hidden: true });

    expect(global.game.combat.createEmbeddedDocuments).toHaveBeenCalledWith('Combatant', [{
      tokenId: 'tok1',
      sceneId: 'sc1',
      actorId: 'act1',
      hidden: true,
      initiative: 10
    }]);
  });

  it('addOrUpdateActorOnCombat (atualiza existente)', async () => {
    const actor = { id: 'act1' };
    const token = { id: 'tok1', scene: { id: 'sc1' } };
    
    const existingCombatant = {
      actor: { id: 'act1' },
      update: vi.fn()
    };
    global.game.combat.combatants.push(existingCombatant);
    
    TokenUtils.getActorToken.mockReturnValue(token);

    await CombatUtils.addOrUpdateActorOnCombat(actor, 15);

    expect(existingCombatant.update).toHaveBeenCalledWith({ initiative: 15 });
    expect(global.game.combat.createEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('getTokenInformations', () => {
    TokenUtils.getTokenByCombatantTokenId.mockReturnValue({
      document: { id: 'td1', name: 'TokName', disposition: 1 }
    });

    const info = CombatUtils.getTokenInformations('ctId');
    expect(info).toEqual({ id: 'td1', name: 'TokName', disposition: 1 });
  });
});

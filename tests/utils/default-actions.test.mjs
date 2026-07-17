import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultActions } from '../../module/utils/default-actions.mjs';
import { ChatCreator } from '../../module/utils/chat-creator.mjs';
import { CombatUtils } from '../../module/core/combat/combat-utils.mjs';
import { RollInitiative } from '../../module/core/rolls/initiative-roll.mjs';
import { RollInitiativeMessageCreator } from '../../module/creators/message/initiative-roll.mjs';



vi.mock('../../module/utils/chat-creator.mjs');
vi.mock('../../module/core/combat/combat-utils.mjs');
vi.mock('../../module/core/rolls/initiative-roll.mjs');
vi.mock('../../module/creators/message/initiative-roll.mjs');

// Para brevidade, testaremos apenas processInitiativeRoll, pois os demais seguem o exato mesmo padrão.
describe('DefaultActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processInitiativeRoll publico', async () => {
    const actor = {};
    const resultRoll = { total: 10, roll: {} };
    
    RollInitiative.roll.mockResolvedValue(resultRoll);
    RollInitiativeMessageCreator.mountContent.mockResolvedValue('msgContent');
    ChatCreator.sendToChatTypeRoll.mockResolvedValue(true);
    CombatUtils.addOrUpdateActorOnCombat.mockResolvedValue();

    await DefaultActions.processInitiativeRoll(actor, { hidden: false });

    expect(RollInitiative.roll).toHaveBeenCalledWith(actor);
    expect(ChatCreator.sendToChatTypeRoll).toHaveBeenCalledWith(actor, 'msgContent', [{}], ChatCreator.MODE_PUBLIC);
    expect(CombatUtils.addOrUpdateActorOnCombat).toHaveBeenCalledWith(actor, 10, { hidden: false });
  });

  it('processInitiativeRoll privado', async () => {
    const actor = {};
    const resultRoll = { total: 15, roll: {} };
    
    RollInitiative.roll.mockResolvedValue(resultRoll);
    RollInitiativeMessageCreator.mountContent.mockResolvedValue('msgContent');
    ChatCreator.sendToChatTypeRoll.mockResolvedValue(true);

    await DefaultActions.processInitiativeRoll(actor, { hidden: true });

    // Se hidden for true, empty rolls list e MODE_PRIVATE_TO_GM
    expect(ChatCreator.sendToChatTypeRoll).toHaveBeenCalledWith(actor, 'msgContent', [], ChatCreator.MODE_PRIVATE_TO_GM);
  });
});

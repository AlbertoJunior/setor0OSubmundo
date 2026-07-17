import { describe, it, expect, vi, beforeEach } from 'vitest';
import gameFunc from '../../module/helpers/gameFunc.mjs';
import { FlagsUtils } from '../../module/utils/flags-utils.mjs';
import { ChatCreator } from '../../module/utils/chat-creator.mjs';

describe('Helper: gameFunc', () => {
  beforeEach(() => {
    // Restaura o estado do game.user do mock global
    game.user.isGM = false;
    game.user.isOwner = false;
  });

  it('should return isGm and isOwner correctly', () => {
    expect(gameFunc('isGm')).toBe(false);
    expect(gameFunc('isOwner')).toBe(false);

    game.user.isGM = true;
    game.user.isOwner = true;

    expect(gameFunc('isGm')).toBe(true);
    expect(gameFunc('isOwner')).toBe(true);
  });

  it('should check flags via FlagsUtils', () => {
    vi.spyOn(FlagsUtils, 'getItemFlag').mockReturnValue(true);
    
    expect(gameFunc('inDarkMode')).toBe(true);
    expect(gameFunc('isCompactedSheet')).toBe(true);
    
    FlagsUtils.getItemFlag.mockReturnValue(false);
    
    expect(gameFunc('inDarkMode')).toBe(false);
    expect(gameFunc('isCompactedSheet')).toBe(false);
    
    FlagsUtils.getItemFlag.mockRestore();
  });

  it('should return correct roll modes for players and gm', () => {
    const playersModes = gameFunc('players-roll-mode');
    const gmModes = gameFunc('gm-roll-mode');
    
    expect(Array.isArray(playersModes)).toBe(true);
    expect(Array.isArray(gmModes)).toBe(true);
    
    // Players não podem ter MODE_SELF (Rolagem_Pessoal) de acordo com o helper
    const hasSelfInPlayers = playersModes.some(m => m.value === ChatCreator.MODE_SELF);
    expect(hasSelfInPlayers).toBe(false);
    
    // GM mode deve ter apenas MODE_SELF
    const hasOnlySelfInGm = gmModes.every(m => m.value === ChatCreator.MODE_SELF);
    expect(hasOnlySelfInGm).toBe(true);
  });

  it('should return false for unknown functions', () => {
    expect(gameFunc('unknown_func')).toBe(false);
  });
});

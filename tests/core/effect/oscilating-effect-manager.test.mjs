import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OscillatingTintManager } from '../../../module/core/effect/oscilating-effect-manager.mjs';
import { TokenUtils } from '../../../module/core/token/token-utils.mjs';

vi.mock('../../../module/core/token/token-utils.mjs');


describe('OscillatingTintManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('startOscillationForToken', async () => {
    const actor = {
      effects: [
        { changes: [{ key: 'texture.tint', value: '#FF0000' }] },
        { changes: [{ key: 'texture.tint', value: '#00FF00' }] }
      ]
    };
    const token = { id: 't1', actor };
    
    TokenUtils.getTokenById.mockReturnValue(token);
    TokenUtils.updateDocument.mockResolvedValue();

    OscillatingTintManager.startOscillationForToken(token);
    
    // Avança o tempo
    await vi.advanceTimersByTimeAsync(5000);
    
    expect(TokenUtils.updateDocument).toHaveBeenCalledWith(token, { 'texture.tint': '#00FF00' });
    
    await vi.advanceTimersByTimeAsync(5000);
    expect(TokenUtils.updateDocument).toHaveBeenCalledWith(token, { 'texture.tint': '#FF0000' });
    
    OscillatingTintManager.stopOscillationForToken(token);
  });

  it('stopOscillationForToken (retorna tint original se houver apenas 1)', () => {
    const actor = {
      effects: [
        { changes: [{ key: 'texture.tint', value: '#FF0000' }] }
      ]
    };
    const token = { id: 't1', actor };

    OscillatingTintManager.stopOscillationForToken(token);
    expect(TokenUtils.updateDocument).toHaveBeenCalledWith(token, { 'texture.tint': '#FF0000' });
  });

  it('stopOscillationForToken (null se nao houver)', () => {
    const actor = { effects: [] };
    const token = { id: 't1', actor };

    OscillatingTintManager.stopOscillationForToken(token);
    expect(TokenUtils.updateDocument).toHaveBeenCalledWith(token, { 'texture.tint': null });
  });
});

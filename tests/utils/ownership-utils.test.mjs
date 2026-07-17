import { describe, it, expect, beforeEach } from 'vitest';
import { OwnershipUtils } from '../../module/utils/ownership-utils.mjs';

describe('OwnershipUtils', () => {
  beforeEach(() => {
    global.game = {
      user: { id: 'user1', isGM: false }
    };
  });

  it('isOwner', () => {
    expect(OwnershipUtils.isOwner({ isOwner: true })).toBe(true);
    expect(OwnershipUtils.isOwner({})).toBe(false);
  });

  it('isDefaultLimited e isDefaultObserver', () => {
    const itemLim = { ownership: { default: OwnershipUtils.LIMITED } };
    const itemObs = { ownership: { default: OwnershipUtils.OBSERVER } };
    
    expect(OwnershipUtils.isDefaultLimited(itemLim)).toBe(true);
    expect(OwnershipUtils.isDefaultObserver(itemObs)).toBe(true);
  });

  it('canEdit', () => {
    global.game.user.isGM = true;
    expect(OwnershipUtils.canEdit({})).toBe(true); // GM

    global.game.user.isGM = false;
    expect(OwnershipUtils.canEdit({ ownership: { user1: OwnershipUtils.OWNER } })).toBe(true);
    expect(OwnershipUtils.canEdit({ ownership: { user1: OwnershipUtils.LIMITED } })).toBe(false);
  });

  it('canRoll', () => {
    expect(OwnershipUtils.canRoll({ ownership: { user1: OwnershipUtils.OWNER } })).toBe(true);
    expect(OwnershipUtils.canRoll({ ownership: { user1: OwnershipUtils.LIMITED } })).toBe(true);
    expect(OwnershipUtils.canRoll({ ownership: { user1: OwnershipUtils.OBSERVER } })).toBe(false);
  });

  it('canDoSomething', () => {
    expect(OwnershipUtils.canDoSomething({ ownership: { default: OwnershipUtils.LIMITED } })).toBe(true);
    expect(OwnershipUtils.canDoSomething({ ownership: { user1: OwnershipUtils.OBSERVER } })).toBe(true);
    expect(OwnershipUtils.canDoSomething({ ownership: {} })).toBe(false);
  });
});

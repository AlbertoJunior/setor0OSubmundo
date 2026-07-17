import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FolderUtils } from '../../module/utils/folder-utils.mjs';
import { FoundryApi } from '../../module/api/foundry-api.mjs';
import { MacroRoleEnum } from '../../module/enums/macro-enums.mjs';

describe('FolderUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.game = {
      user: { id: 'user1' },
      folders: [
        { id: 'f1', name: 'ExistingMacroFolder', type: 'Macro' },
        { id: 'gm1', name: MacroRoleEnum.GM, type: 'Macro' },
        { id: 'pl1', name: MacroRoleEnum.PLAYERS, type: 'Macro' },
        { id: 'char1', name: 'ActorTest', type: 'Macro', folder: { id: 'pl1' }, flags: { setor0OSubmundo: { 'characterId': 'actor1' } } }
      ]
    };
    
    FoundryApi.Documents.Folder.create.mockImplementation(async (data) => {
      return { id: 'newFolder1', ...data };
    });
  });

  it('getOrCreateMacroFolder', async () => {
    // Already exists
    const f1 = await FolderUtils.getOrCreateMacroFolder('ExistingMacroFolder');
    expect(f1.id).toBe('f1');
    expect(FoundryApi.Documents.Folder.create).not.toHaveBeenCalled();

    // Needs to create
    const f2 = await FolderUtils.getOrCreateMacroFolder('NewFolder');
    expect(f2.id).toBe('newFolder1');
    expect(FoundryApi.Documents.Folder.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'NewFolder' }));
  });

  it('getGmFolderId e getPlayersFolderId', async () => {
    const gmId = await FolderUtils.getGmFolderId();
    expect(gmId).toBe('gm1');

    const pId = await FolderUtils.getPlayersFolderId();
    expect(pId).toBe('pl1');
  });

  it('getCharacterMacroFolderId', async () => {
    const actor = { id: 'actor1', name: 'ActorTest' };
    const charFolderId = await FolderUtils.getCharacterMacroFolderId(actor);
    expect(charFolderId).toBe('char1');

    const actor2 = { id: 'actor2', name: 'NewActor' };
    const charFolderId2 = await FolderUtils.getCharacterMacroFolderId(actor2);
    expect(charFolderId2).toBe('newFolder1');
    expect(FoundryApi.Documents.Folder.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'NewActor' }));
  });
});

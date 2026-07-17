import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RollTestUtils } from '../../../module/core/rolls/roll-test-utils.mjs';
import { MacroUtils } from '../../../module/core/macro/macro-utils.mjs';
import { FolderUtils } from '../../../module/utils/folder-utils.mjs';
import * as customRollableCommand from '../../../module/core/macro/commands/custom-rollable.mjs';

vi.mock('../../../module/utils/folder-utils.mjs', () => ({
  FolderUtils: {
    getCharacterMacroFolderId: vi.fn()
  }
}));

vi.mock('../../../module/core/macro/macro-utils.mjs', () => ({
  MacroUtils: {
    createMacro: vi.fn()
  }
}));

vi.mock('../../../module/core/macro/commands/custom-rollable.mjs', () => ({
  createCustomRollableMacro: vi.fn().mockReturnValue('MacroCommandScript')
}));

describe('RollTestUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMacroByRollTestData', () => {
    it('deve montar os parâmetros e criar a macro para um Ator', async () => {
      vi.spyOn(FolderUtils, 'getCharacterMacroFolderId').mockResolvedValue('folder-123');
      vi.spyOn(MacroUtils, 'createMacro').mockResolvedValue();

      const rollTestData = { name: 'Ataque Duplo', id: 'roll-321' };
      const params = {
        parentName: 'Guerreiro',
        actor: { name: 'Ator' },
        type: 'ATK',
        img: 'icon.png'
      };

      await RollTestUtils.createMacroByRollTestData(rollTestData, params);
      
      expect(FolderUtils.getCharacterMacroFolderId).toHaveBeenCalledWith(params.actor, 'ATK');
      expect(customRollableCommand.createCustomRollableMacro).toHaveBeenCalledWith(rollTestData);
      
      expect(MacroUtils.createMacro).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Guerreiro: Ataque Duplo',
        command: 'MacroCommandScript',
        img: 'icon.png',
        flags: { sourceId: 'roll-321' },
        folder: 'folder-123',
        toHotbar: true
      }));
    });

    it('deve criar a macro sem ator (folderId nulo) e sem parentName', async () => {
      vi.spyOn(MacroUtils, 'createMacro').mockResolvedValue();
      const folderSpy = vi.spyOn(FolderUtils, 'getCharacterMacroFolderId');

      const rollTestData = { name: 'Fuga', id: 'roll-444' };
      
      await RollTestUtils.createMacroByRollTestData(rollTestData);
      
      expect(folderSpy).not.toHaveBeenCalled();
      
      expect(MacroUtils.createMacro).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Fuga',
        folder: null,
      }));
    });
  });
});

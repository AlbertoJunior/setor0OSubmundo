import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TraitUtils } from '../../../module/core/trait/trait-utils.mjs';
import { CharacteristicType } from '../../../module/enums/characteristic-enums.mjs';
import { TraitCharacteristicType } from '../../../module/enums/trait-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', () => ({
  getObject: vi.fn(),
  localize: vi.fn(key => `loc_${key}`),
  gameLocalize: vi.fn(key => `gameLoc_${key}`),
  keyJsonToKeyLang: vi.fn(key => `keyLang_${key}`)
}));

describe('TraitUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Getters básicos', () => {
    it('deve extrair valores básicos do item via getObject', () => {
      utils.getObject.mockImplementation((item, charType) => {
        const id = charType.id || charType;
        return `mocked_${id}`;
      });

      const mockItem = {};
      expect(TraitUtils.getXp(mockItem)).toBe(`mocked_${TraitCharacteristicType.XP.id || TraitCharacteristicType.XP}`);
      expect(TraitUtils.getDescription(mockItem)).toBe(`mocked_${TraitCharacteristicType.DESCRIPTION.id || TraitCharacteristicType.DESCRIPTION}`);
      expect(TraitUtils.getRequirement(mockItem)).toBe(`mocked_${TraitCharacteristicType.REQUIREMENT.id || TraitCharacteristicType.REQUIREMENT}`);
      expect(TraitUtils.getMorph(mockItem)).toBe(`mocked_${TraitCharacteristicType.MORPH.id || TraitCharacteristicType.MORPH}`);
      expect(TraitUtils.getType(mockItem)).toBe(`mocked_${TraitCharacteristicType.TYPE.id || TraitCharacteristicType.TYPE}`);
      expect(TraitUtils.getHaveParticularity(mockItem)).toBe(`mocked_${TraitCharacteristicType.HAVE_PARTICULARITY.id || TraitCharacteristicType.HAVE_PARTICULARITY}`);
    });

    it('deve retornar array vazio para getEffects se for null', () => {
      utils.getObject.mockReturnValue(null);
      expect(TraitUtils.getEffects({})).toEqual([]);
    });
  });

  describe('getEffectsWithLocalizedKey', () => {
    it('deve traduzir nome da habilidade no bônus (SKILL)', () => {
      utils.getObject.mockReturnValue([
        { key: `${CharacteristicType.BONUS.SKILL.system}.athletics` }
      ]);

      const mockItem = {};
      const result = TraitUtils.getEffectsWithLocalizedKey(mockItem);
      
      expect(result[0].key).toBe(`${CharacteristicType.BONUS.SKILL.system}.athletics`);
      expect(result[0].localizedKey).toBe(`loc_${CharacteristicType.BONUS.SKILL.label || CharacteristicType.BONUS.SKILL.id} (gameLoc_keyLang_athletics)`);
    });

    it('deve traduzir nome da característica buscando na árvore de CharacteristicType.BONUS', () => {
      // Ex: Inserindo uma chave de subcategoria (Initiative) ou de Categoria direta
      // Simulando a chave do INITIATIVE
      utils.getObject.mockReturnValue([
        { key: CharacteristicType.BONUS.INITIATIVE.system }
      ]);

      const mockItem = {};
      const result = TraitUtils.getEffectsWithLocalizedKey(mockItem);
      
      // CharacteristicType.BONUS.INITIATIVE possui label 'Iniciativa' e system 'system.bonus.initiative'
      expect(result[0].localizedKey).toBe(`loc_${CharacteristicType.BONUS.INITIATIVE.label}`);
    });

    it('deve manter a key original na localizedKey se não achar match (fallback)', () => {
      utils.getObject.mockReturnValue([
        { key: `system.not.exist` }
      ]);

      const mockItem = {};
      const result = TraitUtils.getEffectsWithLocalizedKey(mockItem);
      expect(result[0].localizedKey).toBe('system.not.exist');
    });
  });
});

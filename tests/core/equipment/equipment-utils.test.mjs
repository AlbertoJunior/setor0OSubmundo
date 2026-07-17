import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentUtils } from '../../../module/core/equipment/equipment-utils.mjs';
import { EquipmentCharacteristicType, EquipmentType, SubstanceType } from '../../../module/enums/equipment-enums.mjs';
import { SuperEquipmentTraitRepository } from '../../../module/repository/superequipment-trait-repository.mjs';
import { ActiveEffectsUtils } from '../../../module/core/effect/active-effects-utils.mjs';
import { ActiveEffectsFlags } from '../../../module/enums/active-effects-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getObject: vi.fn(),
    localize: vi.fn(key => `loc_${key}`),
  };
});

describe('EquipmentUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Super Equipment', () => {
    it('getSuperEquipmentEffectsLimits deve calcular limite de efeitos baseado no nivel e defeitos', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL) return 2;
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) return [{ cost: 2 }];
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) return [{ cost: 1 }];
      });

      // Total Effects = 2
      // Total Bonus = Level(2) + TotalDefects(1) = 3
      // Format: "2/3"
      expect(EquipmentUtils.getSuperEquipmentEffectsLimits({})).toBe('2/3');
    });

    it('getSuperEquipmentDefectsLimits deve calcular limites de defeitos', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL) return 4;
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS) return [{}, {}]; // 2 defects
      });

      // Level 4 -> Math.max(4-2, 0) = 2 limite
      expect(EquipmentUtils.getSuperEquipmentDefectsLimits({})).toBe('2/2');
    });
  });

  describe('Boolean Checks (canEquip, canUse, isWeapon, etc)', () => {
    it('canEquip deve verificar presença da prop equipped', () => {
      utils.getObject.mockReturnValueOnce(true).mockReturnValueOnce(undefined);
      expect(EquipmentUtils.canEquip({})).toBe(true);
      expect(EquipmentUtils.canEquip({})).toBe(false);
    });

    it('canUse deve verificar se a quantidade é maior que 0', () => {
      utils.getObject.mockReturnValueOnce(1).mockReturnValueOnce(0);
      expect(EquipmentUtils.canUse({})).toBe(true);
      expect(EquipmentUtils.canUse({})).toBe(false);
    });

    it('isWeapon deve verificar obrigatoriedade de hand, damage, trueDamage e damageType', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (item.valid) return 'something';
        if (charType === EquipmentCharacteristicType.TRUE_DAMAGE) return null; // Missing 1
        return 'something';
      });

      expect(EquipmentUtils.isWeapon({ valid: true })).toBe(true);
      expect(EquipmentUtils.isWeapon({ valid: false })).toBe(false);
    });
  });

  describe('Substances', () => {
    it('substanceWithDamage deve ser true para ACID, POISON e GAS', () => {
      utils.getObject.mockReturnValueOnce(SubstanceType.GAS)
        .mockReturnValueOnce(SubstanceType.DRUG);
      
      expect(EquipmentUtils.substanceWithDamage({})).toBe(true);
      expect(EquipmentUtils.substanceWithDamage({})).toBe(false);
    });
  });

  describe('Active Effects Generation', () => {
    it('getSuperEquipmentActiveEffect deve compilar ActiveEffectData passivo/ativo', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) {
          return [{ id: 'trait.fake', particularity: { change: { key: 'system.hp', value: 10 } } }];
        }
        return [];
      });

      vi.spyOn(SuperEquipmentTraitRepository, 'getTraitsNeedActivate').mockReturnValue([]); // Nenhum precisa ativar -> isPassive = true
      vi.spyOn(ActiveEffectsUtils, 'createEffectData').mockImplementation((data) => data);

      const mockItem = { id: 'item1', name: 'Super Espada' };
      const effectData = EquipmentUtils.getSuperEquipmentActiveEffect(mockItem);

      expect(effectData.duration).toBeNull(); // isPassive true = null duration
      expect(effectData.changes[0].key).toBe('system.hp');
      expect(effectData.flags[ActiveEffectsFlags.ORIGIN_ID]).toBe('item1');
    });

    it('getSubstanceActiveEffects deve mapear todos os efeitos da substância', () => {
      utils.getObject.mockReturnValue([{
        description: 'Envenenado',
        changes: [{ key: 'system.str', value: -2 }],
        type: 'DEBUFF'
      }]);
      vi.spyOn(ActiveEffectsUtils, 'createEffectData').mockImplementation((data) => data);

      const mockItem = { id: 'sub1', name: 'Veneno Letal' };
      const effects = EquipmentUtils.getSubstanceActiveEffects(mockItem);

      expect(effects.length).toBe(1);
      expect(effects[0].name).toContain('Veneno Letal: Envenenado');
      expect(effects[0].changes[0].value).toBe(-2);
    });
  });

  describe('getItemRollInformation', () => {
    it('deve montar informacoes para armas', () => {
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(true);
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.TYPE) return EquipmentType.MELEE;
        if (charType === EquipmentCharacteristicType.DAMAGE) return 5;
        if (charType === EquipmentCharacteristicType.TRUE_DAMAGE) return 1;
        if (charType === EquipmentCharacteristicType.DAMAGE_TYPE) return 'LETAL';
      });

      const info = EquipmentUtils.getItemRollInformation({ name: 'Faca' });
      expect(info.damage).toBe(5);
      expect(info.true_damage).toBe(1);
      expect(info.changes.some(c => c.includes('Dano: 5'))).toBe(true);
    });
  });
});

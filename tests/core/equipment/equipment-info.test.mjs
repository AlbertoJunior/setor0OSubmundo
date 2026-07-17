import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentInfoParser } from '../../../module/core/equipment/equipment-info.mjs';
import { EquipmentType, EquipmentHidding, EquipmentHand, DamageType, VehicleType, MeleeSize, SubstanceType, EquipmentCharacteristicType } from '../../../module/enums/equipment-enums.mjs';
import { ActiveEffectsTypes } from '../../../module/enums/active-effects-enums.mjs';
import { ItemType } from '../../../module/enums/item-type-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    localize: vi.fn(key => `loc_${key}`),
    gameLocalize: vi.fn(key => `gameLoc_${key}`),
    localizeType: vi.fn(key => `locType_${key}`),
    labelError: vi.fn(() => 'ERROR_LABEL'),
    getObject: vi.fn(),
  };
});

describe('EquipmentInfoParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Parsers de Enumerators', () => {
    it('parseEquipmentType deve retornar gameLocalize ou labelError se invalido', () => {
      expect(EquipmentInfoParser.parseEquipmentType(EquipmentType.MELEE)).toBe(`gameLoc_TYPES.Item.${ItemType.MELEE}`);
      expect(EquipmentInfoParser.parseEquipmentType('invalid_type')).toBe('ERROR_LABEL');
    });

    it('parseHidding deve formatar a ocultabilidade', () => {
      expect(EquipmentInfoParser.parseHidding(EquipmentHidding.POCKET)).toBe('loc_Itens.Bolso');
      expect(EquipmentInfoParser.parseHidding(EquipmentHidding.JACKET)).toBe('loc_Itens.Jaqueta');
      expect(EquipmentInfoParser.parseHidding('invalid')).toBe('ERROR_LABEL');
    });

    it('parseHand deve formatar as maos usadas', () => {
      expect(EquipmentInfoParser.parseHand(EquipmentHand.ONE_HALF_HAND)).toBe('loc_Itens.Uma_Mao_Meia');
    });

    it('parseDamageType deve formatar tipo de dano', () => {
      expect(EquipmentInfoParser.parseDamageType(DamageType.FIRE)).toBe('loc_Itens.Fogo');
    });

    it('parseVehicle deve formatar tipo de veiculo', () => {
      expect(EquipmentInfoParser.parseVehicle(VehicleType.ECONOMY)).toBe('loc_Itens.Popular');
    });

    it('parseMeleeSize deve formatar tamanho de arma corpo-a-corpo', () => {
      expect(EquipmentInfoParser.parseMeleeSize(MeleeSize.MEDIUM)).toBe('loc_Itens.Media');
    });

    it('parseSubstance deve formatar tipo de substancia', () => {
      expect(EquipmentInfoParser.parseSubstance(SubstanceType.GAS)).toBe('loc_Itens.Gas');
    });

    it('parseSubstanceEffectType deve formatar tipo de efeito da substancia (BUFF/DEBUFF)', () => {
      expect(EquipmentInfoParser.parseSubstanceEffectType(ActiveEffectsTypes.BUFF)).toBe('loc_Itens.Melhoria');
      expect(EquipmentInfoParser.parseSubstanceEffectType(ActiveEffectsTypes.DEBUFF)).toBe('loc_Itens.Enfraquecimento');
    });
  });

  describe('Listas para Dropdowns (Getters)', () => {
    it('getActorEquipmentTypes deve mapear todos os validEquipmentTypes', () => {
      const types = EquipmentInfoParser.getActorEquipmentTypes();
      expect(types).toBeInstanceOf(Array);
      expect(types.length).toBeGreaterThan(0);
      expect(types[0]).toHaveProperty('id');
      expect(types[0]).toHaveProperty('label');
      expect(types[0]).toHaveProperty('type');
    });

    it('getDamageTypes deve retornar array com id e label', () => {
      const types = EquipmentInfoParser.getDamageTypes();
      expect(types.some(t => t.id === DamageType.FIRE)).toBe(true);
      expect(types[0].label).toBeDefined();
    });
  });

  describe('parseQuantity', () => {
    it('deve formatar quantidades usando notação k/M/B', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.QUANTITY) return item.quantity;
      });

      expect(EquipmentInfoParser.parseQuantity({ quantity: 500 })).toBe('500');
      expect(EquipmentInfoParser.parseQuantity({ quantity: 1500 })).toBe('1.5K');
      expect(EquipmentInfoParser.parseQuantity({ quantity: 2000000 })).toBe('2M');
      expect(EquipmentInfoParser.parseQuantity({ quantity: 1500000000 })).toBe('1.5B');
      expect(EquipmentInfoParser.parseQuantity({ quantity: 0 })).toBe(0);
      expect(EquipmentInfoParser.parseQuantity({})).toBe(0);
    });
  });
});

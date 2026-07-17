import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipamentDataParser } from '../../../module/core/equipment/equipament-data-parser.mjs';
import { EquipmentUtils } from '../../../module/core/equipment/equipment-utils.mjs';
import { EquipmentCharacteristicType, EquipmentType } from '../../../module/enums/equipment-enums.mjs';
import * as utils from '../../../module/utils/utils.mjs';

vi.mock('../../../module/utils/utils.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getObject: vi.fn(),
  };
});

describe('EquipamentDataParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('deve retornar estrutura basica', () => {
      utils.getObject.mockReturnValue(null);
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(false);
      vi.spyOn(EquipmentUtils, 'isSuperEquipment').mockReturnValue(false);

      const parsed = EquipamentDataParser.parse({ name: 'Item Simples', uuid: '123' });
      expect(parsed.name).toBe('Item Simples');
      expect(parsed.itemUuid).toBe('123');
      expect(parsed.description).toBeNull();
    });

    it('deve compilar informacoes unicas de MELEE e WEAPON se o item for uma arma branca', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.TYPE) return EquipmentType.MELEE;
        if (charType === EquipmentCharacteristicType.DAMAGE) return 3;
        if (charType === EquipmentCharacteristicType.SIZE) return 'MEDIUM';
        return null;
      });
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(true);

      const parsed = EquipamentDataParser.parse({ name: 'Machado' });
      expect(parsed.damageLabel).toBe(true);
      expect(parsed.damage).toBe(3);
      // O tamanho (MEDIUM) é uma propriedade do melee
      expect(parsed.sizeLabel).toBeDefined(); // Formatted string from EquipmentInfoParser
    });

    it('deve compilar informacoes de VEICULO', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.TYPE) return EquipmentType.VEHICLE;
        if (charType === EquipmentCharacteristicType.ACCELERATION) return 5;
        if (charType === EquipmentCharacteristicType.SPEED) return 100;
        return null;
      });
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(false);
      vi.spyOn(EquipmentUtils, 'isSuperEquipment').mockReturnValue(false);

      const parsed = EquipamentDataParser.parse({ name: 'Carro' });
      expect(parsed.isVehicle).toBe(true);
      expect(parsed.acceleration).toBe(5);
      expect(parsed.speed).toBe(100);
    });

    it('deve compilar informacoes de SUPER EQUIPAMENTO', () => {
      utils.getObject.mockImplementation((item, charType) => {
        if (charType === EquipmentCharacteristicType.TYPE) return EquipmentType.ACESSORY;
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.LEVEL) return 3;
        if (charType === EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS) return [{ cost: 1, name: 'Visão Noturna', particularity: { description: 'Permite ver no escuro' } }];
        return null;
      });
      vi.spyOn(EquipmentUtils, 'isWeapon').mockReturnValue(false);
      vi.spyOn(EquipmentUtils, 'isSuperEquipment').mockReturnValue(true);
      vi.spyOn(EquipmentUtils, 'getSuperEquipmentLevel').mockReturnValue(3);

      const parsed = EquipamentDataParser.parse({ name: 'Oculos High-Tech' });
      expect(parsed.isSuperEquipment).toBe(true);
      expect(parsed.superEquipmentLevel).toBe(3);
      expect(parsed.hasSuperEffects).toBe(true);
      expect(parsed.superEffects[0].name).toBe('Visão Noturna');
      expect(parsed.superEffects[0].particularity).toBe('Permite ver no escuro');
    });
  });
});

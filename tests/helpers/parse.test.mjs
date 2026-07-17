import { describe, it, expect, vi } from 'vitest';
import parse from '../../module/helpers/parse.mjs';
import { EnhancementRepository } from '../../module/repository/enhancement-repository.mjs';
import { EquipmentInfoParser } from '../../module/core/equipment/equipment-info.mjs';
import { CharacteristicType } from '../../module/enums/characteristic-enums.mjs';

describe('Helper: parse', () => {
  it('should format effect_on_status correctly', () => {
    const effectWithOrigin = { name: 'Poisoned', origin: 'Snake Bite' };
    const effectWithoutOrigin = { name: 'Burning' };
    
    // O array é passado pelo helper como param[0]
    expect(parse('effect_on_status', effectWithOrigin, {})).toBe('Snake Bite: Poisoned');
    expect(parse('effect_on_status', effectWithoutOrigin, {})).toBe('Burning');
  });

  it('should format item_quantity via EquipmentInfoParser', () => {
    vi.spyOn(EquipmentInfoParser, 'parseQuantity').mockReturnValue('10 unidades');
    
    expect(parse('item_quantity', 10, {})).toBe('10 unidades');
    
    EquipmentInfoParser.parseQuantity.mockRestore();
  });

  it('should parse roll_enhancement_formule correctly', () => {
    // Mock do repositório para evitar depender dos dados originais
    vi.spyOn(EnhancementRepository, 'getEnhancementById').mockReturnValue({ name: 'Super Strength' });
    
    // O mock-foundry interceptará 'gameLocalize' via game.i18n.localize e retornará a própria string
    // O helper passa 3 ou 4 argumentos. O último é o options object (hb context).
    
    // Teste com 2 valores (val1 e val2)
    const result1 = parse('roll_enhancement_formule', 'enh-id-123', CharacteristicType.ENHANCEMENT.id, 'vigor', {});
    expect(result1).toBe('(Super Strength + S0.Vigor)/2');

    // Teste com 3 valores (val1, val2 e val3)
    const result2 = parse('roll_enhancement_formule', 'enh-id-123', CharacteristicType.ENHANCEMENT.id, 'agility', 'focus', {});
    expect(result2).toBe('(Super Strength + S0.Agility)/2 + S0.Focus');
    
    EnhancementRepository.getEnhancementById.mockRestore();
  });
});

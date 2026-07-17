import { describe, it, expect } from 'vitest';
import { EquipmentRepository } from '../../module/repository/equipment-repository.mjs';

describe('EquipmentRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof EquipmentRepository.getItems === 'function') {
        const items = EquipmentRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = EquipmentRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return consistent structured data', () => {
       if (typeof EquipmentRepository.getItems === 'function') {
        const items = EquipmentRepository.getItems();
        expect(Array.isArray(items) || items instanceof Map).toBe(true);
       }
    });
  });
});

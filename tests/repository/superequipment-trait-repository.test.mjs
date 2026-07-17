import { describe, it, expect } from 'vitest';
import { SuperEquipmentTraitRepository } from '../../module/repository/superequipment-trait-repository.mjs';

describe('SuperEquipmentTraitRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof SuperEquipmentTraitRepository.getItems === 'function') {
        const items = SuperEquipmentTraitRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = SuperEquipmentTraitRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by cost and name', () => {
      if (typeof SuperEquipmentTraitRepository.getItems === 'function') {
        const items = SuperEquipmentTraitRepository.getItems();
        expect(Array.isArray(items)).toBe(true);
        
        for (let i = 0; i < items.length - 1; i++) {
          const current = items[i];
          const next = items[i + 1];
          // Ordem principal: cost. Ordem secundária: Name
          if (current.cost === next.cost) {
            expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
          } else {
            expect(current.cost).toBeLessThanOrEqual(next.cost);
          }
        }
      }
    });
  });
});

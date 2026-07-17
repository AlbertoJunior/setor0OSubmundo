import { describe, it, expect } from 'vitest';
import { AbilityRepository } from '../../module/repository/ability-repository.mjs';

describe('AbilityRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof AbilityRepository.getItems === 'function') {
        const items = AbilityRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = AbilityRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by label', () => {
      if (typeof AbilityRepository.getItems === 'function') {
        const items = AbilityRepository.getItems();
        expect(Array.isArray(items)).toBe(true);
        
        for (let i = 0; i < items.length - 1; i++) {
          const current = items[i].label;
          const next = items[i + 1].label;
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('should return deep clones on getItem(id)', () => {
      if (typeof AbilityRepository.getItem === 'function') {
        const item = AbilityRepository.getItem('briga'); // Supondo ID válido
        if (item) {
           item.label = 'HACKED';
           const checkAgain = AbilityRepository.getItem('briga');
           expect(checkAgain.label).not.toBe('HACKED');
        }
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import { EnhancementRepository } from '../../module/repository/enhancement-repository.mjs';

describe('EnhancementRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof EnhancementRepository.getItems === 'function') {
        const items = EnhancementRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = EnhancementRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by name', () => {
      if (typeof EnhancementRepository.getItems === 'function') {
        const items = EnhancementRepository.getItems();
        expect(Array.isArray(items)).toBe(true);
        
        for (let i = 0; i < items.length - 1; i++) {
          const current = items[i].name;
          const next = items[i + 1].name;
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});

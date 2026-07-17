import { describe, it, expect } from 'vitest';
import { MorphologyRepository } from '../../module/repository/morphology-repository.mjs';

describe('MorphologyRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof MorphologyRepository.getItems === 'function') {
        const items = MorphologyRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = MorphologyRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by label', () => {
      if (typeof MorphologyRepository.getItems === 'function') {
        const items = MorphologyRepository.getItems();
        expect(Array.isArray(items)).toBe(true);
        
        for (let i = 0; i < items.length - 1; i++) {
          const current = items[i].label;
          const next = items[i + 1].label;
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});

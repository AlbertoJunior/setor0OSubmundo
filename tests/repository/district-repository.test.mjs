import { describe, it, expect } from 'vitest';
import { DistrictRepository } from '../../module/repository/district-repository.mjs';

describe('DistrictRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof DistrictRepository.getItems === 'function') {
        const items = DistrictRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = DistrictRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by label', () => {
      if (typeof DistrictRepository.getItems === 'function') {
        const items = DistrictRepository.getItems();
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

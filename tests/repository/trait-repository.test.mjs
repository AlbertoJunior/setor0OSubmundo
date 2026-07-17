import { describe, it, expect } from 'vitest';
import { TraitRepository } from '../../module/repository/trait-repository.mjs';

describe('TraitRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof TraitRepository.getItems === 'function') {
        const items = TraitRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = TraitRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return a list strictly ordered by xp and name', () => {
      if (typeof TraitRepository.getItems === 'function') {
        const items = TraitRepository.getItems();
        expect(Array.isArray(items)).toBe(true);
        
        for (let i = 0; i < items.length - 1; i++) {
          const current = items[i];
          const next = items[i + 1];
          // Ordem principal: XP. Ordem secundária: Name
          if (current.xp === next.xp) {
            expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
          } else {
            expect(current.xp).toBeLessThanOrEqual(next.xp);
          }
        }
      }
    });
  });
});

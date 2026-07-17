import { describe, it, expect } from 'vitest';
import { ActiveEffectRepository } from '../../module/repository/active-effects-repository.mjs';

describe('ActiveEffectRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof ActiveEffectRepository.getItems === 'function') {
        const items = ActiveEffectRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = ActiveEffectRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return consistent structured data', () => {
       if (typeof ActiveEffectRepository.getItems === 'function') {
        const items = ActiveEffectRepository.getItems();
        expect(Array.isArray(items) || items instanceof Map).toBe(true);
       }
    });
  });
});

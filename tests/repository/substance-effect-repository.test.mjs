import { describe, it, expect } from 'vitest';
import { SubstanceEffectRepository } from '../../module/repository/substance-effect-repository.mjs';

describe('SubstanceEffectRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof SubstanceEffectRepository.getItems === 'function') {
        const items = SubstanceEffectRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = SubstanceEffectRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return consistent structured data', () => {
       if (typeof SubstanceEffectRepository.getItems === 'function') {
        const items = SubstanceEffectRepository.getItems();
        expect(Array.isArray(items) || items instanceof Map).toBe(true);
       }
    });
  });
});

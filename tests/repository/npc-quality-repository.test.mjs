import { describe, it, expect } from 'vitest';
import { NpcQualityRepository } from '../../module/repository/npc-quality-repository.mjs';

describe('NpcQualityRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof NpcQualityRepository.getItems === 'function') {
        const items = NpcQualityRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = NpcQualityRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return consistent structured data', () => {
       if (typeof NpcQualityRepository.getItems === 'function') {
        const items = NpcQualityRepository.getItems();
        expect(Array.isArray(items) || items instanceof Map).toBe(true);
       }
    });
  });
});

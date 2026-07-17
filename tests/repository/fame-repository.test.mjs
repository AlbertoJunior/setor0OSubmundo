import { describe, it, expect } from 'vitest';
import { FameRepository } from '../../module/repository/fame-repository.mjs';

describe('FameRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a deep clone of the fame items', () => {
      const items = FameRepository.getItems();
      expect(items.length).toBeGreaterThan(0);
      
      items[0].label = 'HACKED_LABEL';
      
      const newItems = FameRepository.getItems();
      expect(newItems[0].label).not.toBe('HACKED_LABEL');
    });
  });

  describe('Data Integrity', () => {
    it('should correctly filter NPC items (removing Nucleo)', () => {
      const npcItems = FameRepository.getItemsNpc();
      const hasNucleo = npcItems.some(item => item.id === 'nucleo');
      
      expect(hasNucleo).toBe(false);
    });
  });
});

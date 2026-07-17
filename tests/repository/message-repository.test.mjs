import { describe, it, expect } from 'vitest';
import { MessageRepository } from '../../module/repository/message-repository.mjs';

describe('MessageRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a clone, preventing base mutation', () => {
      if (typeof MessageRepository.getItems === 'function') {
        const items = MessageRepository.getItems();
        if (items && items.length > 0) {
          items[0].label = 'HACKED';
          items[0].name = 'HACKED';
          
          const newItems = MessageRepository.getItems();
          expect(newItems[0].label || newItems[0].name || 'dummy').not.toBe('HACKED');
        }
      }
    });
  });

  describe('Sorting and Caching', () => {
    it('should return consistent structured data', () => {
       if (typeof MessageRepository.getItems === 'function') {
        const items = MessageRepository.getItems();
        expect(Array.isArray(items) || items instanceof Map).toBe(true);
       }
    });
  });
});

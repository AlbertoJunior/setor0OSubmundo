import { describe, it, expect } from 'vitest';
import { AttributeRepository } from '../../module/repository/attribute-repository.mjs';

describe('AttributeRepository', () => {
  describe('Immutability (Deep Clone)', () => {
    it('should return a deep clone of the attributes, preventing base mutation', () => {
      const attributes = AttributeRepository.getItems();
      
      // Validação de segurança: garantir que retornou um array com itens
      expect(attributes.length).toBeGreaterThan(0);
      
      // Tentativa de mutação
      attributes[0].label = 'HACKED_LABEL';
      
      // Buscar novamente e validar que a base não foi afetada
      const newAttributes = AttributeRepository.getItems();
      expect(newAttributes[0].label).not.toBe('HACKED_LABEL');
    });
  });

  describe('Sorting and Structure', () => {
    it('should return elements with correct properties (id, label)', () => {
      const attributes = AttributeRepository.getItems();
      attributes.forEach(attr => {
        expect(attr).toHaveProperty('id');
        expect(attr).toHaveProperty('label');
      });
    });
  });
});

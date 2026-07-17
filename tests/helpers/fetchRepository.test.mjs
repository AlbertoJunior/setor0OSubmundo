import { describe, it, expect, vi, beforeEach } from 'vitest';
import fetchRepository, { clearFetchRepositoryCache } from '../../module/helpers/fetchRepository.mjs';
import { MorphologyRepository } from '../../module/repository/morphology-repository.mjs';

describe('Helper: fetchRepository', () => {
  beforeEach(() => {
    clearFetchRepositoryCache();
  });

  it('should return items from a known repository', () => {
    const items = fetchRepository('morphology');
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('should cache responses to avoid multiple repository calls', () => {
    const spy = vi.spyOn(MorphologyRepository, 'getItems');
    
    // Primeira chamada deve invocar o repositório
    fetchRepository('morphology');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Segunda chamada deve vir do cache
    fetchRepository('morphology');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Limpando o cache
    clearFetchRepositoryCache();
    fetchRepository('morphology');
    expect(spy).toHaveBeenCalledTimes(2);
    
    spy.mockRestore();
  });

  it('should return empty array and warn for unknown repositories', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = fetchRepository('invalid-repository-123');
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    
    warnSpy.mockRestore();
  });
});

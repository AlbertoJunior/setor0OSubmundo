import { describe, it, expect, vi } from 'vitest';
import lett from '../../module/helpers/lett.mjs';

describe('Helper: lett', () => {
  it('should inject hash variables into the context and call fn', () => {
    const mockContext = { existing: 'data' };
    const params = {
      hash: { newVar: 'injected' },
      fn: vi.fn((mergedContext) => {
        return `existing:${mergedContext.existing},newVar:${mergedContext.newVar}`;
      })
    };

    // Usando .call() para simular o "this" do Handlebars (mockContext)
    const result = lett.call(mockContext, params);
    
    expect(params.fn).toHaveBeenCalled();
    expect(result).toBe('existing:data,newVar:injected');
  });
});

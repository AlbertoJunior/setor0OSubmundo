import { describe, it, expect } from 'vitest';
import concat from '../../module/helpers/concat.mjs';

describe('Helper: concat', () => {
  it('should concatenate multiple strings and pop the Handlebars context', () => {
    // Handlebars always passes an options object as the last argument
    const hbOptions = { name: 'hb_options' };
    
    const result = concat('Hello', ' ', 'World', hbOptions);
    expect(result).toBe('Hello World');
  });

  it('should concatenate numbers as strings', () => {
    const result = concat(1, 2, 3, {});
    expect(result).toBe('123');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { HtmlJsUtils } from '../../module/utils/html-js-utils.mjs';

describe('HtmlJsUtils', () => {
  it('flipClasses', () => {
    const classes = ['classA'];
    const element = {
      classList: {
        contains: (cls) => classes.includes(cls),
        replace: vi.fn((a, b) => {
          const idx = classes.indexOf(a);
          if (idx > -1) classes[idx] = b;
        })
      }
    };

    HtmlJsUtils.flipClasses(element, 'classA', 'classB');
    expect(element.classList.replace).toHaveBeenCalledWith('classA', 'classB');
    
    HtmlJsUtils.flipClasses(element, 'classA', 'classB'); // Agora tem B, deve voltar pro A
    expect(element.classList.replace).toHaveBeenCalledWith('classB', 'classA');
  });

  it('expandOrContractElement', () => {
    const windowElem = {
      offsetHeight: 100,
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      },
      style: {}
    };

    const element = {
      closest: () => windowElem,
      classList: {
        toggle: vi.fn().mockReturnValue(true) // expanded
      },
      scrollHeight: 200
    };

    const res = HtmlJsUtils.expandOrContractElement(element, { minHeight: 10, maxHeight: 500, marginBottom: 0 });
    expect(res.isExpanded).toBe(true);
    // currentHeight (100) + scrollSize (200) = 300
    expect(res.newHeight).toBe(300);
    expect(windowElem.style.height).toBe('300px');
    expect(windowElem.classList.add).toHaveBeenCalledWith('S0-expand-animating');
  });
});

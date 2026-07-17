import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as utils from '../../module/utils/utils.mjs';


describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.game = {
      i18n: {
        localize: vi.fn(key => `LOCALIZED_${key}`),
        format: vi.fn((key, data) => `FORMATTED_${key}`)
      }
    };
    if (global.crypto) {
      vi.spyOn(global.crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789abc');
    }
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  describe('String Formats', () => {
    it('toTitleCase', () => {
      expect(utils.toTitleCase('hello world')).toBe('Hello World');
      expect(utils.toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('toKeyLang e keyJsonToKeyLang', () => {
      expect(utils.toKeyLang('my_key_name')).toBe('My_Key_Name');
      expect(utils.keyJsonToKeyLang('my_key_name')).toBe('S0.My_Key_Name');
    });

    it('normalizeString', () => {
      expect(utils.normalizeString('   test   string  ')).toBe('test string');
    });
  });

  describe('Localization', () => {
    it('gameLocalize', () => {
      expect(utils.gameLocalize('TEST')).toBe('LOCALIZED_TEST');
      expect(global.game.i18n.localize).toHaveBeenCalledWith('TEST');
    });

    it('localize', () => {
      expect(utils.localize('TEST')).toBe('LOCALIZED_S0.TEST');
    });

    it('localizeType', () => {
      expect(utils.localizeType('weapon')).toBe('LOCALIZED_TYPES.weapon');
    });

    it('localizeFormat', () => {
      expect(utils.localizeFormat('TEST', { a: 1 })).toBe('FORMATTED_S0.TEST');
      expect(global.game.i18n.format).toHaveBeenCalledWith('S0.TEST', { a: 1 });
    });
  });

  describe('Object & Arrays', () => {
    it('onArrayRemove', () => {
      const arr = [1, 2, 3];
      expect(utils.onArrayRemove(arr, 2)).toBe(true);
      expect(arr).toEqual([1, 3]);
      expect(utils.onArrayRemove(arr, 5)).toBe(false);
    });

    it('getObject', () => {
      const obj = { system: { hp: { value: 10 } }, name: 'Test' };
      expect(utils.getObject(obj, { system: 'system.hp.value' })).toBe(10); 
      
      const obj2 = { hp: { value: 5 } };
      expect(utils.getObject(obj2, 'hp.value')).toBe(5);
    });

    it('convertToCollection', () => {
      const items = [{ id: 'a' }, { id: 'b' }];
      const collection = utils.convertToCollection(items);
      expect(collection.get('a')).toEqual({ id: 'a' });
      expect(collection.size).toBe(2);
    });

    it('snakeToCamel', () => {
      const entries = [['my_snake_case', 1], ['another_key', 2]];
      const res = utils.snakeToCamel(entries);
      expect(res.mySnakeCase).toBe(1);
      expect(res.anotherKey).toBe(2);
    });

    it('normalizeArray', () => {
      expect(utils.normalizeArray([1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('Helpers', () => {
    it('randomId', () => {
      const id1 = utils.randomId();
      expect(id1).toBe('12345678123412341234123456789abc');
      
      const id2 = utils.randomId(5);
      expect(id2).toBe('12345');
    });

    it('logTable and logDiffMigration', () => {
      utils.logTable('Test', { a: { error: 'err' } });
      expect(console.groupCollapsed).toHaveBeenCalled();
      expect(console.table).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('err');

      utils.logDiffMigration({ version: '1.0', description: 'test' }, { diffs: [] });
      expect(console.log).toHaveBeenCalled();
    });

    it('selectCharacteristic', () => {
      // Mocking elements
      const createMockEl = (classes) => ({
        classList: {
          contains: (cls) => classes.includes(cls),
          toggle: vi.fn(),
          add: vi.fn(),
          remove: vi.fn()
        },
        blur: vi.fn(),
        nextElementSibling: null,
        previousElementSibling: null
      });

      const el = createMockEl(['S0-characteristic']);
      const next = createMockEl(['S0-characteristic']);
      const prev = createMockEl(['S0-characteristic']);
      el.nextElementSibling = next;
      el.previousElementSibling = prev;

      utils.selectCharacteristic(el);
      expect(el.classList.toggle).toHaveBeenCalledWith('S0-selected');
      expect(next.classList.remove).toHaveBeenCalledWith('S0-selected');
      expect(prev.classList.add).toHaveBeenCalledWith('S0-selected');
    });
  });
});

import { vi } from 'vitest';

// Simulação do objeto global do Foundry (game)
globalThis.game = {
  i18n: {
    localize: (key) => key,
    format: (key, data) => `${key} ${JSON.stringify(data)}`,
  },
  settings: {
    get: vi.fn(),
  },
  user: {
    name: 'TestUser',
  }
};

// Simulação de CONFIG
globalThis.CONFIG = {
  TextEditor: {
    enrichers: []
  },
  statusEffects: [
    { id: 'dead', label: 'Dead' },
    { id: 'blind', label: 'Blind' },
    { id: 'burning', label: 'Burning' },
    { id: 'shock', label: 'Shock' },
    { id: 'poison', label: 'Poison' },
    { id: 'paralysis', label: 'Paralysis' }
  ]
};

globalThis.CONST = {
  ACTIVE_EFFECT_MODES: { CUSTOM: 0, MULTIPLY: 1, ADD: 2, DOWNGRADE: 3, UPGRADE: 4, OVERRIDE: 5 },
  DICE_ROLL_MODES: { PUBLIC: 'roll', PRIVATE: 'gmroll', BLIND: 'blindroll', SELF: 'selfroll' }
};

class DummyField {
  constructor(...args) {
    if (args.length === 1 && typeof args[0] === 'object') {
      Object.assign(this, args[0]);
    }
  }
  toObject() {
    return JSON.parse(JSON.stringify(this));
  }
}

globalThis.foundry = {
  data: {
    fields: {
      SchemaField: DummyField,
      NumberField: DummyField,
      StringField: DummyField,
      ArrayField: DummyField,
      BooleanField: DummyField,
      HTMLField: DummyField,
    }
  },
  utils: {
    deepClone: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
  }
};

// Precisamos simular a FoundryApi.deepClone para que nossos testes de Repositório funcionem
// Sem isso, ao chamar FoundryApi.deepClone ele tentaria acessar classes puras do Foundry que não existem no Node.
vi.mock('../module/api/foundry-api.mjs', () => {
  return {
    FoundryApi: {
      deepClone: (obj) => {
        if (!obj) return obj;
        return JSON.parse(JSON.stringify(obj));
      },
      mergeObject: (obj1, obj2) => {
        return { ...obj1, ...obj2 };
      },
      formatActiveEffectData: (data) => data,
      Utils: {
        Collection: class Collection extends Map { }
      }
    }
  };
});

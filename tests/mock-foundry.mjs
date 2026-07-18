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
  class DummyClass {}
  
  return {
    FoundryApi: {
      Versions: {
        current: {},
        v1: {},
        v2: {},
        v3: {}
      },
      Utils: {
        Collection: class Collection extends Map {},
        deepClone: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
        mergeObject: (obj1, obj2) => ({ ...obj1, ...obj2 }),
        setProperty: (obj, path, value) => {
          const keys = path.split('.');
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        },
        isNewerVersion: vi.fn(),
        duplicate: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
      },
      Handlebars: {
        renderTemplate: vi.fn(),
        loadTemplates: vi.fn(),
      },
      Collections: {
        Actors: DummyClass,
        Items: DummyClass
      },
      Documents: {
        Actor: DummyClass,
        Item: DummyClass,
        Combat: DummyClass,
        Combatant: DummyClass,
        ActiveEffect: DummyClass,
        Macro: DummyClass,
        TokenDocument: DummyClass,
        Folder: {
          create: vi.fn()
        }
      },
      Apps: {
        FilePicker: DummyClass,
        ImagePopout: DummyClass,
      },
      SidebarTabs: {
        CombatTracker: DummyClass,
        ChatLog: DummyClass,
      },
      Canvas: {},
      Placeables: {
        Token: DummyClass,
      },
      Sheets: {
        ActorSheet: DummyClass,
        ItemSheet: DummyClass,
      },
      ChatMessage: {
        getWhisperRecipients: vi.fn(),
        getSpeaker: vi.fn(),
        create: vi.fn()
      },
      SceneControls: DummyClass,
      ImagePopout: DummyClass,
      Tabs: DummyClass,
      ActorSheet: DummyClass,
      ItemSheet: DummyClass,
      Actors: DummyClass,
      Items: DummyClass,
      Actor: DummyClass,
      Item: DummyClass,
      Combat: DummyClass,
      Combatant: DummyClass,
      ActiveEffect: DummyClass,
      Macro: DummyClass,
      TokenDocument: DummyClass,
      CombatTracker: DummyClass,
      ChatLog: DummyClass,
      TokenCanvas: DummyClass,
      FilePicker: DummyClass,
      TooltipManager: DummyClass,
      
      formatActiveEffectData: (data) => data,
      renderTemplate: vi.fn(),
      reRenderAllSheets: vi.fn(),
      loadTemplates: vi.fn(),
      mergeObject: (obj1, obj2) => ({ ...obj1, ...obj2 }),
      deepClone: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
      duplicate: (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj,
      createDialog: vi.fn(),
      deleteFoldersInWorld: vi.fn(),
      registerCustomEnricher: vi.fn(),
    }
  };
});

export const SystemFlags = Object.freeze({
  ORIGIN: {
    ID: "originId",
    TYPE: "originType",
  },
  SOURCE: {
    ID: 'sourceId'
  },
  CHARACTER: {
    ID: 'characterId'
  },
  MACRO: {
    INSTALLED: 'macroInstalled',
  },
  MANAGER: {
    CAN_EDIT: 'canEdit',
  },
  MODE: {
    EDITABLE: 'editable',
    DARK: 'darkMode',
    COMPACT: 'compactMode',
  },
  TIME: {
    LAST_REFRESH: 'lastRefresh'
  },
  ROLE: {
    ROLE: 'role',
    USER: 'user',
    GM: 'gm',
  },
  LANGUAGE: {
    SET_BY_USER: 'languageSetByUser'
  },
  WORLD: {
    DEFAULT_LANGUAGE: 'worldDefaultLanguage'
  },
  COMBAT: {
    TRACKER_INITIALIZED: 'combatTrackerInitialized'
  },
  MIGRATION: {
    VERSION: 'systemMigrationVersion'
  }
});
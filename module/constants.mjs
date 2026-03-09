export const SYSTEM_ID = Object.freeze("setor0OSubmundo");
export const SYSTEM_NAME = Object.freeze("Setor 0 - O Submundo");

export const ICONS_PATH = Object.freeze(`systems/${SYSTEM_ID}/icons`);
export const LOGO_PATH = Object.freeze(`systems/${SYSTEM_ID}/imgs/logo.png`);
export const TEMPLATES_PATH = Object.freeze(`systems/${SYSTEM_ID}/templates`);

export const SYSTEM_CLASS_CSS = Object.freeze("S0-content");
export const SYSTEM_CLASS_DIALOG_CSS = Object.freeze("S0-dialog");
export const SYSTEM_CLASS_DARK_CSS = Object.freeze("S0-page-transparent");

export const REGISTERED_TEMPLATES = Object.freeze(new Set([
  `${TEMPLATES_PATH}/others/remove-tokens-effects-dialog.hbs`
]));
export const REGISTERED_MIGRATIONS = Object.freeze(new Set());

export const SYSTEM_HOOKS = Object.freeze({
  MIGRATIONS_INIT: "setor0OSubmundo.migrationsInit"
});

// DEPRECATED: Usar SystemFlags no lugar
export const SYSTEM_FLAGS = Object.freeze({
  ORIGIN_ID: "originId",
  ORIGIN_TYPE: "originType",
  SOURCE_ID: "sourceId",
  CHARACTER_ID: "characterId",
  ROLE: "role",
  ROLE_GM: "gm",
  ROLE_USER: "user",
});

export const DEFAULT_VALUES = Object.freeze({
  BASE_VITALITY: 5,
  OVERLOAD_LIMIT: 5,
  SYNTHETIC_PENALTY_BONUS: 1,
  BASE_MOVIMENT_POINTS: 1,
  ENHANCEMENT_SLOTS_PER_CORE: 4,
});

export const COLORS = {
  BASE: {
    primary: '#FFDC00',
    secondary: '#410082',
    tertiary: '#8200FF',

    white: '#F5F5F5',
    black: '#000000',
    softBlack: '#141414',
    alternateBlack: '#282828',
    gray: '#505050',
    lightGray: '#B4B4B4',

    red: '#F00A0A',
    green: '#0A8C0A',
    blue: '#0A3AFF',
    yellow: '#E0B800',
    pink: '#D03080',
    purple: '#5A00A8',
    orange: '#E65C00',

    focus: '#FFFF96',
  },

  ALPHA: {
    primary80: 'rgba(255, 220, 0, 0.8)',
    primary50: 'rgba(255, 220, 0, 0.5)',

    secondary80: 'rgba(65, 0, 130, 0.8)',
    secondary50: 'rgba(65, 0, 130, 0.5)',

    tertiary80: 'rgba(130, 0, 255, 0.8)',
    tertiary50: 'rgba(130, 0, 255, 0.5)',

    white80: 'rgba(245, 245, 245, 0.8)',
    white50: 'rgba(245, 245, 245, 0.5)',

    black80: 'rgba(0, 0, 0, 0.8)',
    black50: 'rgba(0, 0, 0, 0.5)',

    gray80: 'rgba(80, 80, 80, 0.8)',
    gray50: 'rgba(80, 80, 80, 0.5)',

    lightGray80: 'rgba(180, 180, 180, 0.8)',
    lightGray50: 'rgba(180, 180, 180, 0.5)',

    red80: 'rgba(240, 10, 10, 0.8)',
    red50: 'rgba(240, 10, 10, 0.5)',

    green80: 'rgba(10, 140, 10, 0.8)',
    green50: 'rgba(10, 140, 10, 0.5)',

    blue80: 'rgba(10, 58, 255, 0.8)',
    blue50: 'rgba(10, 58, 255, 0.5)',

    yellow80: 'rgba(224, 184, 0, 0.8)',
    yellow50: 'rgba(224, 184, 0, 0.5)',

    pink80: 'rgba(208, 48, 128, 0.8)',
    pink50: 'rgba(208, 48, 128, 0.5)',

    purple80: 'rgba(90, 0, 168, 0.8)',
    purple50: 'rgba(90, 0, 168, 0.5)',

    orange80: 'rgba(230, 92, 0, 0.8)',
    orange50: 'rgba(230, 92, 0, 0.5)',
  },

  ON: {
    primary: '#141414',
    primaryAlt: '#141414',
    secondary: '#F5F5F5',
    secondaryAlt: '#FFDC00',
    tertiary: '#F5F5F5',
    tertiaryAlt: '#FFDC00',

    white: '#141414',
    black: '#F5F5F5',
    gray: '#F5F5F5',
    grayAlt: '#141414',
    lightGray: '#141414',

    red: '#F5F5F5',
    green: '#F5F5F5',
    blue: '#F5F5F5',
    yellow: '#F5F5F5',
    pink: '#F5F5F5',
    purple: '#F5F5F5',
    orange: '#F5F5F5',
  },

  ENHANCEMENT_LEVELS: {
    level1: '#F5F5F5',
    level2: '#FFFF96',
    level3: '#FFDC00',
    level4: '#E65C00',
    level5: '#F00A0A',
    allColors: ['#F5F5F5'],
  }
};

COLORS.ENHANCEMENT_LEVELS.allColors = Object.entries(COLORS.ENHANCEMENT_LEVELS)
  .filter(([key]) => key !== 'allColors')
  .sort(([a], [b]) => {
    const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
    const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
    return numA - numB;
  })
  .map(([, value]) => value);

COLORS.ON = {
  primary: COLORS.BASE.softBlack,
  primaryAlt: COLORS.BASE.softBlack,
  secondary: COLORS.BASE.white,
  secondaryAlt: COLORS.BASE.primary,
  tertiary: COLORS.BASE.white,
  tertiaryAlt: COLORS.BASE.primary,

  white: COLORS.BASE.softBlack,
  black: COLORS.BASE.white,
  gray: COLORS.BASE.white,
  grayAlt: COLORS.BASE.softBlack,
  lightGray: COLORS.BASE.softBlack,

  red: COLORS.BASE.white,
  green: COLORS.BASE.white,
  blue: COLORS.BASE.white,
  yellow: COLORS.BASE.white,
  pink: COLORS.BASE.white,
  purple: COLORS.BASE.white,
  orange: COLORS.BASE.white,
};
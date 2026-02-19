import { randomId } from "../utils/utils.mjs";
import { v1Overrides } from "./versions-overrides/v1.mjs";
import { v2Overrides } from "./versions-overrides/v2.mjs";

// base config for applications
const baseApplicationConfig = Object.freeze({
  Version: foundry.applications,
  Api: foundry.applications.api,
  Handlebars: foundry.applications.handlebars,
  SidebarTabs: foundry.applications.sidebar.tabs,
  Ui: foundry.applications.ui,
  Ux: foundry.applications.ux,
  Apps: foundry.applications.apps,
  Documents: foundry.documents,
  Collections: foundry.documents.collections,
  Placeables: foundry.canvas.placeables,
  Utils: foundry.utils,
  ChatMessage: ChatMessage,
  TooltipManager: foundry.helpers.interaction.TooltipManager,
});

// versions
const applicationOverrides = {
  v1: v1Overrides,
  v2: v2Overrides
};
const createdVersions = new Set();

/**
 * Cria e retorna uma configuração de aplicação baseada em uma versão específica da API do Foundry.
 *
 * Essa função mescla uma configuração base (`baseApplicationConfig`) com um conjunto de overrides
 * definidos por versão (`v1Overrides`, `v2Overrides`, etc). Caso a versão solicitada não esteja disponível
 * ou esteja incompleta, pode usar uma ou mais versões de fallback fornecidas.
 *
 * Também assegura que cada `VersionName` seja único em tempo de execução, adicionando um sufixo aleatório se necessário.
 * A configuração final é congelada com `Object.freeze` para garantir imutabilidade.
 *
 * @param {string} versionKey - A chave da versão desejada (por exemplo: `'v1'`, `'v2'`).
 * @param {string[]} [fallbackChain=[]] - Lista de chaves de versões alternativas a tentar caso a principal falhe.
 * 
 * @returns {Object} A configuração completa da aplicação para a versão selecionada.
 *
 * @throws {Error} Lança erro se nenhuma versão válida for encontrada.
 *
 * @example
 * const appV1 = createApplication('v1');
 *
 * @example
 * const appWithFallback = createApplication('v3', ['v2', 'v1']);
 *
 * @example
 * // Resultado típico da estrutura retornada:
 * {
 *   Version: ...,
 *   Api: ...,
 *   Handlebars: ...,
 *   SidebarsTabs: ...,
 *   Collections: ...,
 *   ChatMessage: ...,
 *   Sheets: ...,
 *   ...,
 *   makeClass: function,
 *   createDialog: function,
 *   VersionName: "S0-V1"
 * }
 */
export function createApplication(versionKey, fallbackChain = []) {
  const versionsToTry = [...new Set([versionKey, ...fallbackChain])];

  for (const key of versionsToTry) {
    const overrides = applicationOverrides[key];
    if (!overrides) {
      continue;
    }

    const merged = Object.assign({}, baseApplicationConfig, overrides);

    if (!validateOverride(merged, key)) {
      continue;
    }

    if (key !== versionKey) {
      console.warn(`-> [Fallback] Usando versão '${key}' no lugar de '${versionKey}'`);
    }

    if (!merged.VersionName || createdVersions.has(merged.VersionName)) {
      console.warn(`-> [VersionName] Criando um novo nome de versão. É necessário arrumar`);
      const createdRandomName = createdVersions.has(merged.VersionName) ? `-${randomId(3)}` : '';
      merged.VersionName = `S0-${versionKey.toUpperCase()}${createdRandomName}`;
    }

    createdVersions.add(merged.VersionName);
    return Object.freeze(merged);
  }

  throw new Error(`-> Nenhuma versão válida encontrada para '${versionKey}'`);
}

/**
 * Valida se um override de aplicação possui os campos obrigatórios com os tipos corretos.
 *
 * @param {Object} override - O objeto override a ser validado.
 * @param {string} versionKey - Nome da versão (para logs de erro).
 * @returns {boolean} Retorna true se for válido, false caso contrário.
 */
function validateOverride(override, versionKey) {
  const requiredFields = {
    Sheets: 'object',
    makeClass: 'function',
    createDialog: 'function',
    VersionName: 'string'
  };

  let isValid = true;

  for (const [field, expectedType] of Object.entries(requiredFields)) {
    const value = override[field];

    const actualType = typeof value;

    // null é do tipo 'object', mas deve ser rejeitado
    if (value == null || actualType !== expectedType) {
      console.warn(
        `-> [Application ${versionKey}] campo '${field}' inválido. Esperado: '${expectedType}', recebido: '${value === null ? 'null' : actualType}'`
      );
      isValid = false;
    }
  }

  return isValid;
}
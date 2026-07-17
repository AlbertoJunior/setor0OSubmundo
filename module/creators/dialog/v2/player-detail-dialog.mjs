import { SYSTEM_ID, TEMPLATES_PATH } from "../../../constants.mjs";
import { localize, randomId } from "../../../utils/utils.mjs";
import { NotificationsUtils } from "../../message/notifications.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog de detalhes de um jogador específico.
 * 
 * Exibe:
 * - Nome, avatar, status online/offline e cor do jogador
 * - Personagem padrão atribuído (com ação para abrir a ficha)
 * - Lista de todos os actors com permissão LIMITED, OBSERVER ou OWNER
 * - Flags do sistema (setor0OSubmundo) em formato flat (destaque)
 * - Outras flags agrupadas por namespace (cada grupo minimizável)
 * - Edição inline de valores de flags (clique → input → salvar)
 * - Adição de novas flags por grupo
 * 
 * Os ícones de permissão seguem o padrão do ShareDocumentDialog:
 * - OWNER: fas fa-crown
 * - OBSERVER: fas fa-eye
 * - LIMITED: fas fa-eye-slash
 */
export class PlayerDetailDialog extends HandlebarsApplicationMixin(ApplicationV2) {

  /** @type {string} ID do usuário cujos detalhes estão sendo exibidos */
  #userId = null;

  constructor(userId, options = {}) {
    super(options);
    this.#userId = userId;
  }

  static DEFAULT_OPTIONS = {
    classes: ["S0-V2", "S0-dialog", "S0-scrollable-dialog"],
    tag: "div",
    window: {
      icon: "fas fa-user",
      resizable: true,
      controls: []
    },
    position: {
      width: 520,
      height: "auto"
    },
    actions: {
      openSheet: PlayerDetailDialog.prototype._onOpenSheet,
      editFlag: PlayerDetailDialog.prototype._onEditFlag,
      saveFlag: PlayerDetailDialog.prototype._onSaveFlag,
      cancelEditFlag: PlayerDetailDialog.prototype._onCancelEditFlag,
      deleteFlag: PlayerDetailDialog.prototype._onDeleteFlag,
      addFlag: PlayerDetailDialog.prototype._onAddFlag,
      confirmAddFlag: PlayerDetailDialog.prototype._onConfirmAddFlag,
      cancelAddFlag: PlayerDetailDialog.prototype._onCancelAddFlag
    }
  };

  static PARTS = {
    content: {
      template: `${TEMPLATES_PATH}/dialog/player-detail.hbs`
    }
  };

  /**
   * Título dinâmico da janela baseado no nome do jogador.
   * @returns {string} Título formatado com o nome do usuário.
   */
  get title() {
    const user = game.users.get(this.#userId);
    return user?.name ?? localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Dialog_Title");
  }

  /**
   * Abre o dialog de detalhes para o jogador informado.
   * 
   * @param {string} userId - ID do usuário no Foundry VTT.
   */
  static async open(userId) {
    new PlayerDetailDialog(userId, {
      id: `${randomId(10)}-player-detail-dialog`
    }).render(true);
  }

  /**
   * Prepara o contexto de dados completo para o template.
   * 
   * Coleta informações do jogador, seus actors acessíveis
   * e suas flags organizadas em sistema vs grupos por namespace.
   * 
   * @param {object} options - Opções de renderização.
   * @returns {Promise<object>} Contexto com player, accessibleActors, systemFlags e flagGroups.
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const user = game.users.get(this.#userId);
    if (!user) return context;

    // Dados básicos do jogador
    context.player = {
      id: user.id,
      name: user.name,
      isGM: user.isGM,
      isActive: user.active,
      color: user.color,
      avatar: user.avatar,
      character: user.character ? {
        id: user.character.id,
        name: user.character.name,
        img: user.character.img
      } : null
    };

    // Actors com permissão LIMITED (1), OBSERVER (2) ou OWNER (3)
    context.accessibleActors = this.#collectAccessibleActors(user);

    // Flags do sistema (destaque) em formato flat
    const allFlags = user.flags ?? {};
    const systemFlagsRaw = allFlags[SYSTEM_ID] ?? {};
    context.systemFlags = this.#flattenObject(systemFlagsRaw);

    // Outras flags agrupadas por namespace
    context.flagGroups = this.#collectFlagGroups(allFlags);

    return context;
  }

  /**
   * Coleta todos os actors que o jogador possui permissão de acesso.
   * Filtra por LIMITED, OBSERVER e OWNER, excluindo o personagem padrão
   * (que já é exibido em seção separada).
   * 
   * @param {User} user - Documento do usuário.
   * @returns {Array<object>} Lista de actors com metadados de permissão.
   */
  #collectAccessibleActors(user) {
    const defaultCharId = user.character?.id;

    return game.actors
      .filter(actor => {
        const level = actor.ownership?.[user.id];
        return level >= 1 && level <= 3;
      })
      .filter(actor => actor.id !== defaultCharId)
      .map(actor => {
        const level = actor.ownership[user.id];
        const { icon, label } = this.#getPermissionVisuals(level);

        return {
          id: actor.id,
          name: actor.name,
          img: actor.img,
          type: actor.type,
          permissionIcon: icon,
          permissionLabel: label
        };
      });
  }

  /**
   * Retorna o ícone e label de permissão para um nível específico.
   * 
   * @param {number} level - Nível de permissão (1=Limited, 2=Observer, 3=Owner).
   * @returns {{ icon: string, label: string }} Ícone FontAwesome e label localizado.
   */
  #getPermissionVisuals(level) {
    switch (level) {
      case 3:
        return {
          icon: "fas fa-crown",
          label: localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Permission_Owner")
        };
      case 2:
        return {
          icon: "fas fa-eye",
          label: localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Permission_Observer")
        };
      case 1:
        return {
          icon: "fas fa-eye-slash",
          label: localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Permission_Limited")
        };
      default:
        return { icon: "fas fa-ban", label: "" };
    }
  }

  /**
   * Coleta as flags de outros namespaces (excluindo o sistema),
   * agrupando por namespace. Cada grupo contém suas flags em formato flat.
   * 
   * @param {object} allFlags - Objeto completo de flags do usuário.
   * @returns {Array<{namespace: string, flags: Array<{key: string, value: string}>}>}
   */
  #collectFlagGroups(allFlags) {
    const groups = [];

    for (const [namespace, data] of Object.entries(allFlags)) {
      if (namespace === SYSTEM_ID) continue;
      if (!data || typeof data !== "object") continue;

      const flags = this.#flattenObject(data);
      groups.push({ namespace, flags });
    }

    return groups;
  }

  /**
   * Achata um objeto aninhado em uma lista flat de { key, value }.
   * Usa caminho pontilhado para representar a hierarquia.
   * 
   * @param {object} obj - Objeto a ser achatado.
   * @param {string} [prefix=""] - Prefixo para as chaves.
   * @returns {Array<{key: string, value: string}>} Lista flat de chave→valor.
   */
  #flattenObject(obj, prefix = "") {
    const result = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        result.push(...this.#flattenObject(value, fullKey));
      } else {
        result.push({ key: fullKey, value: String(value) });
      }
    }

    return result;
  }

  // ─── Actions ────────────────────────────────────────────────────

  /**
   * Abre a ficha de um actor clicado.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Elemento com data-actor-id.
   */
  async _onOpenSheet(event, target) {
    const actorId = target.dataset.actorId;
    if (!actorId) return;

    const actor = game.actors.get(actorId);
    if (actor) {
      actor.sheet.render(true);
    }
  }

  /**
   * Ativa o modo de edição inline para o valor de uma flag.
   * Substitui o texto por um input editável com botões de salvar/cancelar.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Elemento com data-namespace e data-flag-key.
   */
  async _onEditFlag(event, target) {
    const row = target.closest("tr");
    if (!row) return;

    const valueCell = row.querySelector(".S0-flag-value-cell");
    const actionsCell = row.querySelector(".S0-flag-actions-cell");
    if (!valueCell || !actionsCell) return;

    // Extrai o valor atual do span de exibição
    const currentValue = valueCell.querySelector(".S0-flag-value-display")?.textContent ?? "";

    // Substitui a célula de valor por um input
    valueCell.innerHTML = `<input type="text" class="S0-flag-edit-input" value="${this.#escapeHtml(currentValue)}" />`;

    // Exibe botões de salvar e cancelar
    actionsCell.innerHTML = `
      <button type="button" class="S0-flag-action-btn S0-flag-save-btn" data-action="saveFlag"
              data-namespace="${target.dataset.namespace}" data-flag-key="${target.dataset.flagKey}"
              title="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Save')}">
        <i class="fas fa-check"></i>
      </button>
      <button type="button" class="S0-flag-action-btn S0-flag-cancel-btn" data-action="cancelEditFlag"
              title="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Cancel')}">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Foca no input
    const input = valueCell.querySelector(".S0-flag-edit-input");
    if (input) {
      input.focus();
      input.select();
    }
  }

  /**
   * Salva o valor editado de uma flag via user.setFlag().
   * Re-renderiza o dialog para refletir a mudança.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão de salvar com data-namespace e data-flag-key.
   */
  async _onSaveFlag(event, target) {
    const namespace = target.dataset.namespace;
    const flagKey = target.dataset.flagKey;
    const row = target.closest("tr");
    const input = row?.querySelector(".S0-flag-edit-input");
    if (!input || !namespace || !flagKey) return;

    const newValue = this.#parseValue(input.value);
    const user = game.users.get(this.#userId);
    if (!user) return;

    await user.setFlag(namespace, flagKey, newValue);
    NotificationsUtils.info(localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Saved"));
    this.render();
  }

  /**
   * Cancela a edição inline e re-renderiza o dialog.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão de cancelar.
   */
  async _onCancelEditFlag(event, target) {
    this.render();
  }

  /**
   * Remove uma flag do usuário via user.unsetFlag().
   * Solicita confirmação antes de executar.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão com data-namespace e data-flag-key.
   */
  async _onDeleteFlag(event, target) {
    const namespace = target.dataset.namespace;
    const flagKey = target.dataset.flagKey;
    if (!namespace || !flagKey) return;

    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Delete") },
      content: `<p>${localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Confirm_Delete")}</p><p><code>${namespace}.${flagKey}</code></p>`,
      yes: { default: false },
      no: { default: true }
    });

    if (!confirmed) return;

    const user = game.users.get(this.#userId);
    if (!user) return;

    await user.unsetFlag(namespace, flagKey);
    NotificationsUtils.info(localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Deleted"));
    this.render();
  }

  /**
   * Exibe os inputs para adicionar uma nova flag dentro de um grupo/namespace.
   * Insere uma nova linha na tabela do grupo com campos de chave e valor.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão com data-namespace.
   */
  async _onAddFlag(event, target) {
    const namespace = target.dataset.namespace;
    const container = target.closest(".S0-flag-group");
    if (!container) return;

    // Verifica se já existe uma linha de adição aberta
    const existing = container.querySelector(".S0-flag-add-row");
    if (existing) return;

    const table = container.querySelector(".S0-flags-table tbody");
    if (!table) return;

    // Insere uma nova linha com inputs
    const row = document.createElement("tr");
    row.classList.add("S0-flag-add-row");
    row.innerHTML = `
      <td>
        <input type="text" class="S0-flag-new-key-input S0-font-monospace S0-text-x-small"
               placeholder="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_New_Key_Placeholder')}" />
      </td>
      <td>
        <input type="text" class="S0-flag-new-value-input S0-font-monospace S0-text-x-small"
               placeholder="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_New_Value_Placeholder')}" />
      </td>
      <td class="S0-flag-actions-cell">
        <button type="button" class="S0-flag-action-btn S0-flag-save-btn" data-action="confirmAddFlag"
                data-namespace="${namespace}"
                title="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Save')}">
          <i class="fas fa-check"></i>
        </button>
        <button type="button" class="S0-flag-action-btn S0-flag-cancel-btn" data-action="cancelAddFlag"
                title="${localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Cancel')}">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;
    table.appendChild(row);

    // Foca no input de chave
    const keyInput = row.querySelector(".S0-flag-new-key-input");
    if (keyInput) keyInput.focus();
  }

  /**
   * Confirma a adição de uma nova flag. Valida a chave e salva via setFlag().
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão com data-namespace.
   */
  async _onConfirmAddFlag(event, target) {
    const namespace = target.dataset.namespace;
    const row = target.closest(".S0-flag-add-row");
    if (!row || !namespace) return;

    const keyInput = row.querySelector(".S0-flag-new-key-input");
    const valueInput = row.querySelector(".S0-flag-new-value-input");
    const key = keyInput?.value?.trim();
    const value = valueInput?.value?.trim() ?? "";

    if (!key) {
      NotificationsUtils.warning(localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Error_Empty_Key"));
      return;
    }

    const user = game.users.get(this.#userId);
    if (!user) return;

    await user.setFlag(namespace, key, this.#parseValue(value));
    NotificationsUtils.info(localize("CONTROL.PLAYER_INFORMATIONS_BUTTON.Flag_Added"));
    this.render();
  }

  /**
   * Cancela a adição de uma nova flag, removendo a linha de input.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Botão de cancelar.
   */
  async _onCancelAddFlag(event, target) {
    const row = target.closest(".S0-flag-add-row");
    if (row) row.remove();
  }

  // ─── Helpers privados ───────────────────────────────────────────

  /**
   * Tenta interpretar o valor como boolean, number ou JSON.
   * Se falhar, retorna como string.
   * 
   * @param {string} value - Valor em texto do input.
   * @returns {*} Valor convertido para o tipo mais adequado.
   */
  #parseValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;

    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") return num;

    // Tenta JSON (arrays, objetos)
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object") return parsed;
    } catch { /* ignora */ }

    return value;
  }

  /**
   * Escapa caracteres HTML para uso seguro em atributos.
   * 
   * @param {string} str - String a escapar.
   * @returns {string} String com caracteres HTML escapados.
   */
  #escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

import { TEMPLATES_PATH } from "../../../constants.mjs";
import { randomId } from "../../../utils/utils.mjs";
import { PlayerDetailDialog } from "./player-detail-dialog.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog de listagem de jogadores do mundo.
 * 
 * Exibe todos os usuários com indicador de status online/offline,
 * avatar, nome e personagem padrão. Ao clicar em um jogador,
 * abre o PlayerDetailDialog com informações detalhadas.
 * 
 * Disponível apenas para o GM via menu Scene Controls.
 */
export class PlayerInformationsDialog extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes: ["S0-V2", "S0-dialog", "S0-scrollable-dialog"],
    tag: "div",
    window: {
      title: "S0.CONTROL.PLAYER_INFORMATIONS_BUTTON.Dialog_Title",
      icon: "fas fa-users",
      resizable: true,
      controls: []
    },
    position: {
      width: 380,
      height: "auto"
    },
    actions: {
      selectPlayer: PlayerInformationsDialog.prototype._onSelectPlayer
    }
  };

  static PARTS = {
    content: {
      template: `${TEMPLATES_PATH}/dialog/player-informations.hbs`
    }
  };

  /**
   * Abre uma nova instância do dialog de listagem de jogadores.
   * Gera um ID único para permitir múltiplas instâncias simultâneas.
   */
  static async open() {
    new PlayerInformationsDialog({
      id: `${randomId(10)}-player-informations-dialog`
    }).render(true);
  }

  /**
   * Prepara o contexto de dados para o template Handlebars.
   * Coleta informações de todos os usuários do mundo.
   * 
   * @param {object} options - Opções de renderização.
   * @returns {Promise<object>} Contexto com array de jogadores.
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.players = game.users.map(user => ({
      id: user.id,
      name: user.name,
      isGM: user.isGM,
      isActive: user.active,
      color: user.color,
      characterName: user.character?.name ?? null,
      avatar: user.avatar
    }));

    return context;
  }

  /**
   * Handler de ação ao clicar em um jogador na lista.
   * Abre o PlayerDetailDialog com os dados do usuário selecionado.
   * 
   * @param {Event} event - Evento do DOM.
   * @param {HTMLElement} target - Elemento que disparou a ação.
   */
  async _onSelectPlayer(event, target) {
    const userId = target.dataset.userId;
    if (!userId) return;

    PlayerDetailDialog.open(userId);
  }
}

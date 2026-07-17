import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";
import { COLORS } from "../../constants.mjs";

export function configureSetor0ActiveEffect() {
  CONFIG.ActiveEffect.documentClass = Setor0ActiveEffect;
}

export class Setor0ActiveEffect extends FoundryApi.ActiveEffect {

  static #TOOLTIP_CONFIG = {
    FONT_FAMILY: "Setor0",
    FONT_SIZE: 40,
    DURATION: 2000,
  }

  /**
   * Chamado quando o Efeito Ativo é recém-criado/adicionado a um documento.
   * Executado quando se arrasta um item com efeito ou usa `ActiveEffect.create()`.
   * @param {Object} data    - Os dados iniciais do Efeito (nome, imagem, mudanças).
   * @param {Object} options - Opções de renderização do Foundry (ex: animar texto).
   * @param {String} userId  - ID do usuário que executou a ação.
   */
  _onCreate(data, options, userId) {
    this.#verifyHideTooltipText(options);
    super._onCreate(data, options, userId);
  }

  /**
   * Chamado apenas quando as propriedades do Efeito Ativo são DITADAS/MODIFICADAS.
   * @example Onde testar: Dê um duplo clique no efeito na ficha e mude o nome dele, ou clique no ícone para alternar entre habilitado/desabilitado (`disabled: true`).
   * @param {Object} changed - Contém apenas as propriedades que sofreram alterações (ex: `{ disabled: true }`).
   * @param {Object} options - Opções do Foundry.
   * @param {String} userId  - ID do usuário que desencadeou o update.
   */
  _onUpdate(changed, options, userId) {
    this.#verifyHideTooltipText(options);
    super._onUpdate(changed, options, userId);
  }

  /**
   * Chamado no exato momento em que o Efeito Ativo é APAGADO do banco de dados (removido do Ator/Item).
   * @param {Object} options - Opções do Foundry (ex: animar texto da exclusão).
   * @param {String} userId  - ID do usuário executante.
   */
  _onDelete(options, userId) {
    this.#verifyHideTooltipText(options);
    super._onDelete(options, userId);
  }

  /**
   * Centraliza a verificação de permissão e decide se a animação do efeito pop-up (scrolling text)
   * será executada na tela do usuário atual.
   */
  #verifyHideTooltipText(options) {
    const alwaysShow = FlagsUtils.getItemFlag(this, ActiveEffectsFlags.ALWAYS_SHOW_ON_TOKEN, false);
    const isOwner = game.user.isGM || this.parent?.isOwner;

    // Altera a opção nativa de animar para falso se o usuário não for GM nem Dono
    options.animate = !(options.animate == false) && (isOwner || alwaysShow);
  }

  /**
   * Sobrescreve o método nativo responsável por gerar o texto flutuante quando o efeito
   * é adicionado, deletado ou o status desabilitado/habilitado é alterado.
   * Aplica a estilização exclusiva de "Setor0" envolvendo (wrapping) a função global
   * de maneira efêmera (apenas durante sua execução) para evitar vazamento de memória.
   * @param {Boolean} enabled - true para exibir aviso de adição/habilitação, false para remoção.
   */
  _displayScrollingStatus(enabled) {
    const originalCreate = canvas.interface.createScrollingText;

    canvas.interface.createScrollingText = async function (origin, content, options = {}) {
      const toTop = options.direction == CONST.TEXT_ANCHOR_POINTS.TOP;
      const fillColor = toTop ? COLORS.BASE.primary : COLORS.BASE.secondary;
      const strokeColor = toTop ? COLORS.ON.primary : COLORS.ON.secondary;

      const textStyle = {
        _fontFamily: Setor0ActiveEffect.#TOOLTIP_CONFIG.FONT_FAMILY,
        _fontSize: Setor0ActiveEffect.#TOOLTIP_CONFIG.FONT_SIZE,
        _fill: fillColor,
        _stroke: strokeColor,
        _letterSpacing: 5,
        // _lineHeight: "1.2",
        // strokeThickness: 4,
        // fontWeight: "bold",
        // _dropShadow: true,
        // dropShadowBlur: 2,
        // dropShadowColor: "#000000"
      };

      options = {
        ...options,
        ...textStyle,
        duration: Setor0ActiveEffect.#TOOLTIP_CONFIG.DURATION
      };
      canvas.interface.createScrollingText = originalCreate;
      return await originalCreate.call(this, origin, content, options);
    }

    super._displayScrollingStatus(enabled);
  }
}
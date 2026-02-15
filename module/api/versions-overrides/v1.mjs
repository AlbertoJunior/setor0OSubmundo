import { Setor0BaseSheet } from "../../base/sheet/Setor0BaseSheet.mjs";
import { SYSTEM_CLASS_CSS, SYSTEM_CLASS_DARK_CSS, SYSTEM_CLASS_DIALOG_CSS } from "../../constants.mjs";
import { HtmlJsUtils } from "../../utils/html-js-utils.mjs";
import { onArrayRemove } from "../../utils/utils.mjs";
import { createA } from "../../creators/element/element-creator-jscript.mjs";

const VERSION_NAME = 'S0-V1';

class S0DialogV1 extends Dialog {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [
        ...(options.classes || []),
        SYSTEM_CLASS_CSS,
        SYSTEM_CLASS_DARK_CSS,
        SYSTEM_CLASS_DIALOG_CSS,
        VERSION_NAME,
      ]
    };
  }

  submit(button, event) {
    const target = this.options.jQuery ? this.element : this.element[0];
    try {
      if (button.callback) {
        button.callback.call(this, this, target, event);
      }

      const closeDialog = button.closeDialog !== false;
      if (closeDialog) {
        this.close();
      }
    } catch (err) {
      ui.notifications.error(err.message);
      throw new Error(err);
    }
  }

  static presetDialogRender(html, params = {}) {
    const div = html[0]?.parentElement;
    if (!div) {
      return null;
    }

    div.parentElement.style.height = 'auto';

    const paramsContentStyles = params.contentStyles;
    if (paramsContentStyles && typeof paramsContentStyles === 'object') {
      Object.entries(paramsContentStyles).forEach(([key, value]) => {
        div.style[key] = value;
      });
    }

    this.#setupHeaderParams(div, params.header);
    this.#verifyRemoveDialogButtonsContainer(div);

    HtmlJsUtils.setupHeader(html);

    return div.closest(`.${SYSTEM_CLASS_CSS}`);
  }

  static #setupHeaderParams(div, paramsHeader) {
    if (paramsHeader) {
      const headerElement = div.parentElement.children[0];

      const defaultChildren = [...headerElement.children];
      if (defaultChildren.length > 0) {
        headerElement.innerHTML = '';
        headerElement.appendChild(defaultChildren[0]);
        onArrayRemove(defaultChildren, defaultChildren[0]);
      }

      const buttons = paramsHeader.buttons || [];
      buttons.forEach(button => {
        const elementA = createA(button.label, {
          icon: { class: button.icon }
        });

        elementA.onclick = event => button.onClick();
        headerElement.appendChild(elementA)
      });

      if (defaultChildren.length > 0) {
        defaultChildren.forEach(child => {
          headerElement.appendChild(child);
        });
      }
    }
  }

  static #verifyRemoveDialogButtonsContainer(div) {
    const buttons = div.querySelectorAll('.dialog-button').length || 0;
    if (buttons == 0) {
      div.querySelector('.dialog-buttons')?.remove();
    }
  }
}

export const v1Overrides = Object.freeze({
  VersionName: VERSION_NAME,
  Sheets: foundry.appv1.sheets,
  makeClass,
  createDialog,
});

function makeClass(BaseClass) {
  const name = BaseClass.name;

  const Cls = {
    [name]: class extends BaseClass {
      static get defaultOptions() {
        const options = super.defaultOptions;
        return {
          ...options,
          classes: [
            ...(options.classes || []),
            SYSTEM_CLASS_CSS,
            VERSION_NAME,
          ]
        };
      }

      activateListeners(html) {
        super.activateListeners(html);
        HtmlJsUtils.setupContent(html);
        HtmlJsUtils.setupHeader(html);
        this.configureSheet(html);
        this.postRenderConfiguration(html);
      }
    }
  }[name];

  return Setor0BaseSheet(Cls);
}

async function createDialog(data, options) {
  const {
    title,
    header,
    content,
    buttons = [],
    minimizable = true,
    resizable = false,
    render = (html, renderedDialog, window) => { },
    onClose = () => { }
  } = data;

  const parsedButtons = parseButtons(buttons);

  return await new S0DialogV1(
    {
      title,
      content,
      buttons: parsedButtons.buttons,
      default: parsedButtons.default,
      render: (html, dialog) => {
        const window = S0DialogV1.presetDialogRender(html, { header: header });

        Object.entries(parsedButtons.buttons)
          .forEach(([buttonKey, buttonParams]) => {
            const buttonElement = html.find(`button[data-button="${buttonKey}"]`);
            if (buttonElement?.length) {
              buttonElement.addClass(buttonParams.class);
            }
          });
        render(html, dialog, window);
      },
      close: onClose
    },
    {
      ...options,
      minimizable: minimizable,
      resizable: resizable,
    }
  ).render(true);
}

/**
 * Converte uma lista de botões em um objeto formatado para uso em componentes de diálogo.
 *
 * Cada botão é indexado por seu `label` (em minúsculas), e recebe uma `callback` que encapsula o método `onClick`.
 * Também identifica qual botão é o padrão (`default: true`) e retorna seu identificador.
 *
 * @param {Array<{ label : string, onClick : function?, default : boolean? }>} buttons - Lista de botões, onde cada botão deve conter:
 * @param {string} buttons[].label - Texto que identifica o botão.
 * @param {Function} [buttons[].onClick] - Função callback executada ao clicar no botão (opcional).
 * @param {boolean} [buttons[].default] - Indica se o botão é o padrão do diálogo.
 *
 * @returns {{ buttons: Object<string, { label: string, callback: function }>, default: string|null }}
 * Um objeto contendo:
 * - `buttons`: Mapeamento de `label.toLowerCase()` → objeto com `label` e `callback`.
 * - `default`: O identificador (`label.toLowerCase()`) do botão marcado como padrão, ou `null` se nenhum for padrão.
 *
 * @example
 * const { buttons, default: defaultButton } = parseButtons([
 *   { label: 'Yes', onClick: () => console.log('Yes clicked'), default: true },
 *   { label: 'No', onClick: () => console.log('No clicked') }
 * ]);
 *
 * // buttons = {
 * //   yes: { label: 'Yes', callback: [Function] },
 * //   no: { label: 'No', callback: [Function] }
 * // }
 * // defaultButton = 'yes'
 */
function parseButtons(buttons) {
  const parsedButtons = {};
  let defaultButton = null;

  for (const bt of buttons) {
    const lowerLabel = bt.label.toLowerCase();
    parsedButtons[lowerLabel] = {
      label: bt.label,
      icon: bt.icon ? `<i class="${bt.icon}"></i>` : null,
      class: Array.isArray(bt.class) ? bt.class : [],
      closeDialog: bt.closeDialog,
      callback: (dialog, html, event) => {
        bt.onClick?.(html, dialog);
      }
    }
    if (bt.default == true) {
      defaultButton = lowerLabel;
    }
  }

  return {
    buttons: parsedButtons,
    default: defaultButton,
  };
}
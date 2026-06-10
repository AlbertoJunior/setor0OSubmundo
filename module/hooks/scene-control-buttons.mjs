import { NotificationsUtils } from "../creators/message/notifications.mjs";
import { ConfirmationDialog } from "../creators/dialog/confirmation-dialog.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "../utils/flags-utils.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { CompendiumExport } from "../core/pack/compendium-export.mjs";
import { CompendiumSync } from "../core/pack/compendium-sync.mjs";
import { RemoveTokensEffectsDialog } from "../creators/dialog/remove-tokens-effects-dialog.mjs";
import { ExperienceCalculatorDialog } from "../creators/dialog/v2/experience-calculator-dialog.mjs";
import { PlayerInformationsDialog } from "../creators/dialog/v2/player-informations-dialog.mjs";
import { localize, localizeFormat } from "../utils/utils.mjs";

export class SceneControlButtonsHookHandle {
  static firstRender = true;

  static handle(controls) {
    const tools = {
      none: this.#mountHiddenButton('none'),
      theme: this.#mountThemeButton('theme'),
      layout: this.#mountLayoutButton('layout'),
      language: this.#mountLanguageButton('language'),
      experienceCalculator: this.#mountExperienceCalculatorButton('experienceCalculator')
    };

    if (game.user.isGM) {
      tools.removeTokensEffects = this.#mountRemoveTokensEffectsButton('removeTokensEffects');
      tools.playerInformations = this.#mountPlayerInformationsButton('playerInformations');
      tools.exportCompendiums = this.#mountExportCompendiumsButton('exportCompendiums');
      tools.importCompendiums = this.#mountImportCompendiumsButton('importCompendiums');
    }

    this.#mountControls(controls, tools);
  }

  static #mountControls(controls, tools) {
    controls.setor0 = {
      name: "setor0",
      title: "Setor 0: Configurações",
      icon: "fas fa-bolt",
      activeTool: tools.none.name,
      visible: true,
      onToolChange: (event, tool) => { },
      onChange: (event, active) => {
        if (!active) {
          return;
        }
        const tools = ui.controls.tools;
        for (const [key, value] of Object.entries(tools)) {
          const button = document.querySelector(`button[data-action="tool"][data-tool="${key}"]`);
          if (button) {
            button.classList.add(value.class);
          }

          if (typeof value.verifyActive === 'function') {
            value.active = value.verifyActive();
          }

          if (typeof value.actualName === 'function') {
            value.title = value.actualName(value.active);
          }
        }
      },
      tools: tools
    };
  }

  static #mountHiddenButton(name) {
    return {
      name: name,
      title: "none",
      icon: "fas fa-text",
      order: 999999,
      class: ['hidden'],
      button: false,
      toggle: false,
      active: false,
      visible: true,
      onChange: async (event, active) => {
        if (active && this.firstRender) {
          this.firstRender = false;
        }
      }
    };
  }

  static #mountThemeButton(name) {
    const user = game.user;

    const verifyActive = () => { return FlagsUtils.getItemFlag(user, SystemFlags.MODE.DARK, false) };

    const isActive = verifyActive();

    const toolTitle = (active) => {
      const modeText = active ? localize('CONTROL.THEME_BUTTON.Dark') : localize('CONTROL.THEME_BUTTON.Light');
      return localizeFormat('CONTROL.THEME_BUTTON.Title', { state: modeText });
    }

    return {
      name: name,
      title: toolTitle(isActive),
      icon: "fas fa-adjust",
      order: 100,
      toggle: true,
      active: isActive,
      verifyActive: verifyActive,
      actualName: toolTitle,
      onChange: async (event, active) => {
        const actualMode = FlagsUtils.getItemFlag(user, SystemFlags.MODE.DARK, false);
        await FlagsUtils.setItemFlag(user, SystemFlags.MODE.DARK, !actualMode);
        FoundryApi.reRenderAllSheets()

        const modeText = !actualMode ? localize('CONTROL.THEME_BUTTON.Dark') : localize('CONTROL.THEME_BUTTON.Light');
        NotificationsUtils.info(localizeFormat('CONTROL.THEME_BUTTON.Activated', { state: modeText }));
        event.target.ariaLabel = toolTitle(!actualMode);
      }
    };
  }

  static #mountLayoutButton(name) {
    const user = game.user;

    const verifyActive = () => { return FlagsUtils.getItemFlag(user, SystemFlags.MODE.COMPACT, false) };

    const isActive = verifyActive();

    const toolTitle = (active) => {
      const modeText = active ? localize('CONTROL.LAYOUT_BUTTON.Compact') : localize('CONTROL.LAYOUT_BUTTON.Expanded');
      return localizeFormat('CONTROL.LAYOUT_BUTTON.Title', { state: modeText });
    }

    return {
      name: name,
      title: toolTitle(isActive),
      icon: "fas fa-columns",
      order: 200,
      toggle: true,
      active: isActive,
      verifyActive: verifyActive,
      actualName: toolTitle,
      onChange: async (event, active) => {
        const actualMode = FlagsUtils.getItemFlag(user, SystemFlags.MODE.COMPACT, false);
        await FlagsUtils.setItemFlag(user, SystemFlags.MODE.COMPACT, !actualMode);
        FoundryApi.reRenderAllSheets()

        const modeText = !actualMode ? localize('CONTROL.LAYOUT_BUTTON.Compact') : localize('CONTROL.LAYOUT_BUTTON.Expanded');
        NotificationsUtils.info(localizeFormat('CONTROL.LAYOUT_BUTTON.Activated', { state: modeText }));
        event.target.ariaLabel = toolTitle(!actualMode);
      }
    };
  }

  static #mountLanguageButton(name) {
    return {
      name: name,
      title: localize('CONTROL.LANGUAGE_BUTTON.Title'),
      icon: "fas fa-language",
      order: 300,
      button: true,
      toggle: false,
      active: false,
      onChange: async (event, active) => {
        await document.querySelector('button[data-app="configure"]').click();
        setTimeout(
          () => {
            document.getElementById('settings-config-core.language')?.focus();
          }, 200
        );
      }
    };
  }

  static #mountRemoveTokensEffectsButton(name) {
    return {
      name: name,
      title: localize('CONTROL.REMOVE_TOKENS_EFFECTS_BUTTON.Label'),
      icon: "fas fa-skull",
      order: 400,
      button: true,
      toggle: false,
      active: false,
      visible: true,
      onChange: async (event, active) => {
        const tokens = canvas?.tokens?.controlled || [];
        RemoveTokensEffectsDialog.open(tokens);
      }
    };
  }

  static #mountExportCompendiumsButton(name) {
    return {
      name: name,
      title: localize('CONTROL.EXPORT_COMPENDIUMS_BUTTON.Title'),
      icon: "fas fa-file-export",
      order: 600,
      button: true,
      toggle: false,
      active: false,
      visible: true,
      onChange: async (event, active) => {
        await CompendiumExport.exportCompendiumsToJson();
      }
    };
  }

  static #mountImportCompendiumsButton(name) {
    return {
      name: name,
      title: localize('CONTROL.IMPORT_COMPENDIUMS_BUTTON.Title'),
      icon: "fas fa-file-import",
      order: 700,
      button: true,
      toggle: false,
      active: false,
      visible: true,
      onChange: async (event, active) => {
        ConfirmationDialog.open({
          titleDialog: localize('CONTROL.IMPORT_COMPENDIUMS_BUTTON.Dialog_Title'),
          message: localize('CONTROL.IMPORT_COMPENDIUMS_BUTTON.Dialog_Message'),
          isDanger: true,
          onConfirm: async () => {
            NotificationsUtils.info(localize('CONTROL.IMPORT_COMPENDIUMS_BUTTON.Notify_Start'));
            await CompendiumSync.clear();
            NotificationsUtils.info(localize('CONTROL.IMPORT_COMPENDIUMS_BUTTON.Notify_End'));
            setTimeout(() => window.location.reload(), 1000);
          }
        });
      }
    };
  }

  static #mountPlayerInformationsButton(name) {
    return {
      name: name,
      title: localize('CONTROL.PLAYER_INFORMATIONS_BUTTON.Title'),
      icon: "fas fa-users",
      order: 500,
      button: true,
      toggle: false,
      active: false,
      visible: true,
      onChange: async (event, active) => {
        PlayerInformationsDialog.open();
      }
    };
  }

  static #mountExperienceCalculatorButton(name) {
    return {
      name: name,
      title: localize('CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Title'),
      icon: "fas fa-calculator",
      order: 350,
      button: true,
      toggle: false,
      active: false,
      onChange: async (event, active) => {
        ExperienceCalculatorDialog.open();
      }
    };
  }
}
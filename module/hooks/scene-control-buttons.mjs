import { NotificationsUtils } from "../creators/message/notifications.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "../utils/flags-utils.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";

export class SceneControlButtonsHookHandle {
    static firstRender = true;

    static handle(controls) {
        const tools = {
            none: this.#mountHiddenButton('none'),
            theme: this.#mountThemeButton('theme'),
            layout: this.#mountLayoutButton('layout'),
            language: this.#mountLanguageButton('language')
        };

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
            order: 99,
            class: ['hidden'],
            button: false,
            toggle: false,
            active: false,
            visible: true,
            onChange: async (event, active) => {
                if (active && this.firstRender) {
                    this.firstRender = false;
                    NotificationsUtils.info("Você pode alterar configurações como 'Tema' e 'Botões'");
                }
            }
        };
    }

    static #mountThemeButton(name) {
        const user = game.user;

        const verifyActive = () => { return FlagsUtils.getItemFlag(user, SystemFlags.MODE.DARK, false) };

        const isActive = verifyActive();

        const toolTitle = (active) => {
            return `Alternar Tema Claro e Escuro (${active ? 'Escuro' : 'Claro'})`;
        }

        return {
            name: name,
            title: toolTitle(isActive),
            icon: "fas fa-adjust",
            order: 1,
            toggle: true,
            active: isActive,
            verifyActive: verifyActive,
            actualName: toolTitle,
            onChange: async (event, active) => {
                const actualMode = FlagsUtils.getItemFlag(user, SystemFlags.MODE.DARK, false);
                await FlagsUtils.setItemFlag(user, SystemFlags.MODE.DARK, !actualMode);
                FoundryApi.reRenderAllSheets()
                NotificationsUtils.info(`Tema ${actualMode ? "Claro" : "Escuro"} ativado.`);
                event.target.ariaLabel = toolTitle(!actualMode);
            }
        };
    }

    static #mountLayoutButton(name) {
        const user = game.user;

        const verifyActive = () => { return FlagsUtils.getItemFlag(user, SystemFlags.MODE.COMPACT, false) };

        const isActive = verifyActive();

        const toolTitle = (active) => {
            return `Alternar Layout Expandido e Compacto (${active ? 'Compacto' : 'Expandido'})`;
        }

        return {
            name: name,
            title: toolTitle(isActive),
            icon: "fas fa-columns",
            order: 2,
            toggle: true,
            active: isActive,
            verifyActive: verifyActive,
            actualName: toolTitle,
            onChange: async (event, active) => {
                const actualMode = FlagsUtils.getItemFlag(user, SystemFlags.MODE.COMPACT, false);
                await FlagsUtils.setItemFlag(user, SystemFlags.MODE.COMPACT, !actualMode);
                FoundryApi.reRenderAllSheets()
                NotificationsUtils.info(`Modo ${actualMode ? "Expandido" : "Compacto"} ativado.`);
                event.target.ariaLabel = toolTitle(!actualMode);
            }
        };
    }

    static #mountLanguageButton(name) {
        return {
            name: name,
            title: 'Alterar idioma',
            icon: "fas fa-language",
            order: 3,
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
}
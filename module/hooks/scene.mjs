import { TODO } from "../../scripts/utils/utils.mjs";
import { configureSetor0SceneControl } from "../core/scene/scene-control.mjs";
import { NotificationsUtils } from "../creators/message/notifications.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { FlagsUtils } from "../utils/flags-utils.mjs";
import { FoundryApi } from "../utils/foundry-api.mjs";

export class SceneHookHandle {
    static async register() {
        TODO('VOLTAR AQUI E RESOLVER ESSES COMENTÁRIOS')
        // Hooks.on("getSceneControlButtons", (controls) => {
        //     SceneHookHandle.getSceneControlButtons(controls);
        // });

        // configureSetor0SceneControl()
    }

    static getSceneControlButtons(controls) {
        controls.push({
            name: "interface-settings",
            title: "Setor 0: Configurações",
            icon: "fas fa-cog",
            layer: null,
            visible: true,
            tools: [
                {
                    name: "tema",
                    title: "Alternar Tema Claro e Escuro",
                    icon: "fas fa-adjust",
                    button: true,
                    onClick: async () => {
                        const actualMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.DARK, false);
                        await FlagsUtils.setItemFlag(game.user, SystemFlags.MODE.DARK, !actualMode);

                        FoundryApi.reRenderAllSheets()
                        NotificationsUtils.info(`Tema ${actualMode ? "Claro" : "Escuro"} ativado.`);
                    }
                },
                {
                    name: "layout",
                    title: "Alternar Layout Expandido e Compacto",
                    icon: "fas fa-columns",
                    button: true,
                    onClick: async () => {
                        const actualMode = FlagsUtils.getItemFlag(game.user, SystemFlags.MODE.COMPACT, false);
                        await FlagsUtils.setItemFlag(game.user, SystemFlags.MODE.COMPACT, !actualMode);
                        FoundryApi.reRenderAllSheets()
                        NotificationsUtils.info(`Modo ${actualMode ? "Expandido" : "Compacto"} ativado.`);
                    }
                }
            ]
        });
    }
}
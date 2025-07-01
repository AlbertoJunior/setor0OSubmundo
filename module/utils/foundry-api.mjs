import { randomId } from "../../scripts/utils/utils.mjs";
import { SYSTEM_CLASS_CSS } from "../constants.mjs";

// base config for applications
const baseApplicationConfig = {
    Version: foundry.applications,
    Api: foundry.applications.api,
    Handlebars: foundry.applications.handlebars,
    Collections: foundry.documents.collections,
    ChatMessage: ChatMessage,
    Utils: foundry.utils,
    Ui: foundry.applications.ui
};

// versions
const v1Overrides = {
    Sheets: foundry.appv1.sheets,
    makeClass: (Base) => class extends Base { }
};

const v2Overrides = {
    ...v1Overrides,
    Sheets: foundry.applications.sheets,
    makeClass: (Base) => {
        const { HandlebarsApplicationMixin } = foundry.applications.api;
        return class extends HandlebarsApplicationMixin(Base) {
            getData() {
                return {};
            }
        };
    }
};

const applicationOverrides = {
    v1: v1Overrides,
    v2: v2Overrides
};

function createApplication(versionKey, fallbackChain = []) {
    const versionsToTry = [...new Set([versionKey, ...fallbackChain])];

    for (const key of versionsToTry) {
        const overrides = applicationOverrides[key];
        if (!overrides) {
            continue;
        }

        const merged = Object.assign({}, baseApplicationConfig, overrides);

        if (!merged.Sheets || !merged.makeClass) {
            console.warn(`-> [Application ${key}] inválido`);
            continue;
        }

        if (key !== versionKey) {
            console.warn(`-> [Fallback] Usando versão '${key}' no lugar de '${versionKey}'`);
        }

        return Object.freeze(merged);
    }

    throw new Error(`-> Nenhuma versão válida encontrada para '${versionKey}'`);
}

const ApplicationV1 = createApplication("v1");
const ApplicationV2 = createApplication("v2", ["v1"]);

export class FoundryApi {
    //#region UPDATED 
    // static ActorSheet = ApplicationV2.makeClass(ApplicationV2.Sheets.ActorSheet);
    //#endregion

    //#region NEED UPDATE to V2
    static ActorSheet = ApplicationV1.makeClass(ApplicationV1.Sheets.ActorSheet);
    static ItemSheet = ApplicationV1.makeClass(ApplicationV1.Sheets.ItemSheet);
    //#endregion

    static Actors = Object.freeze(ApplicationV2.Collections.Actors);
    static Items = Object.freeze(ApplicationV2.Collections.Items);
    static SceneControls = Object.freeze(ApplicationV2.Ui.SceneControls);

    static ChatMessage = Object.freeze({
        getWhisperRecipients: (recipient) => ApplicationV2.ChatMessage.getWhisperRecipients(recipient),
        getSpeaker: (actor) => ApplicationV2.ChatMessage.getSpeaker({ actor: actor }),
        create: async (messageData, optionsMode) => await ApplicationV2.ChatMessage.create(messageData, optionsMode)
    });

    static async renderTemplate(path, data) {
        return ApplicationV2.Handlebars.renderTemplate(path, data);
    }

    static async loadTemplates(path, data) {
        return ApplicationV2.Handlebars.loadTemplates(path, data);
    }

    static mergeObject(object1, object2) {
        return ApplicationV2.Utils.mergeObject(object1, object2);
    }

    static async createDialog(
        { title, content, buttons = [], minimizable = true, render = (html, renderedDialog) => { } } = data,
        options,
    ) {
        let $html;

        const parsedButtons = buttons.map(button => {
            const cloned = { ...button };
            cloned.action = randomId(10);

            const classList = Array.isArray(cloned.class) ? [...cloned.class] : [];

            classList.push('S0-button-dialog');

            if (cloned.default === true) {
                classList.push('S0-button-focus');
            }

            cloned.class = [...new Set(classList)].join(' ');

            return cloned;
        });

        let buttonToRemove;
        if (parsedButtons.length == 0) {
            buttonToRemove = randomId(10);
            parsedButtons.push({
                label: buttonToRemove,
                action: buttonToRemove,
            });
        }

        const dialog = new ApplicationV2.Api.DialogV2(
            {
                window: {
                    title: title,
                    minimizable: minimizable,
                },
                position: {
                    width: options?.width || 'auto',
                    height: options?.height || 'auto',
                },
                classes: [SYSTEM_CLASS_CSS, 'S0-dialogV2', 'dialog'],
                content: content,
                buttons: parsedButtons,
                submit: result => {
                    const buttonAction = parsedButtons.find(button => button.action == result);
                    const method = buttonAction?.onClick;
                    if (typeof method === 'function') {
                        method($html);
                    } else {
                        console.log(`User picked option: ${buttonAction.label}`);
                    }
                }
            },
            options
        );

        const renderedDialog = await dialog.render(true);

        $html = $(renderedDialog.element);

        if (buttonToRemove) {
            $html.find(`[data-action="${buttonToRemove}"]`)?.remove();
        }

        render($html, renderedDialog);
        return renderedDialog;
    }
}
import { createApplication } from "./create-application.mjs";

const ApplicationV1 = createApplication("v1");
const ApplicationV2 = createApplication("v2", ["v1"]);

function convertToClass(BaseClass, application) {
    const cls = {
        [BaseClass.name]: class extends BaseClass {
            static VERSION = application.VersionName;
        }
    }[BaseClass.name];
    return cls;
}

export class FoundryApi {
    static Versions = {
        v1: ApplicationV1,
        v2: ApplicationV2,
    };

    //#region UPDATED 
    // static ActorSheet = convertToClass(ApplicationV2.makeClass(ApplicationV2.Sheets.ActorSheet), ApplicationV2);
    // static ItemSheet = convertToClass(ApplicationV2.makeClass(ApplicationV1.Sheets.ItemSheet), ApplicationV2);
    //#endregion

    //#region NEED UPDATE to V2
    static ActorSheet = convertToClass(ApplicationV1.makeClass(ApplicationV1.Sheets.ActorSheet), ApplicationV1);
    static ItemSheet = convertToClass(ApplicationV1.makeClass(ApplicationV1.Sheets.ItemSheet), ApplicationV1);
    //#endregion

    static Actors = convertToClass(ApplicationV2.Collections.Actors, ApplicationV2);
    static Items = convertToClass(ApplicationV2.Collections.Items, ApplicationV2);

    static SceneControls = Object.freeze(ApplicationV2.Ui.SceneControls);
    static ImagePopout = Object.freeze(ApplicationV2.Apps.ImagePopout);
    static Tabs = Object.freeze(ApplicationV2.Ux.Tabs);

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
        { title, header, content, buttons = [], minimizable = true, render = (html, renderedDialog, window) => { }, onClose = () => { } } = data,
        options,
        forcedApplication,
    ) {
        let application = forcedApplication ?? ApplicationV2;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            application = ApplicationV1;
        }

        return application.createDialog({ title, header, content, buttons, minimizable, render, onClose }, options);
    }
}
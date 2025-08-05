import { SYSTEM_CLASS_CSS } from "../constants.mjs";
import { createApplication } from "./create-application.mjs";

const ApplicationV1 = createApplication("v1");
const ApplicationV2 = createApplication("v2", ["v1"]);

const Versions = {
    current: Object.freeze(ApplicationV2),
    v1: Object.freeze(ApplicationV1),
    v2: Object.freeze(ApplicationV2),
};

function convertToClass(BaseClass, application) {
    if (!application) {
        application = Versions.current;
    }

    const cls = {
        [BaseClass.name]: class extends BaseClass {
            static VERSION = application.VersionName;
        }
    }[BaseClass.name];
    return cls;
}

export class FoundryApi {
    static Versions = Versions;

    static Utils = Versions.current.Utils;
    static Handlebars = Versions.current.Handlebars;
    static Collections = Versions.current.Collections;
    static Documents = Versions.current.Documents;
    static Apps = Versions.current.Apps;
    static SidebarTabs = Versions.current.SidebarTabs;
    static Placeables = Versions.current.Placeables;
    static Sheets = Versions.current.Sheets;

    static ChatMessage = Object.freeze({
        getWhisperRecipients: (recipient) => Versions.current.ChatMessage.getWhisperRecipients(recipient),
        getSpeaker: (actor) => Versions.current.ChatMessage.getSpeaker({ actor: actor }),
        create: async (messageData, optionsMode) => await Versions.current.ChatMessage.create(messageData, optionsMode)
    });

    static SceneControls = convertToClass(Versions.current.Ui.SceneControls);
    static ImagePopout = convertToClass(Versions.current.Apps.ImagePopout);
    static Tabs = convertToClass(Versions.current.Ux.Tabs);

    //#region UPDATED 
    // static ActorSheet = Versions.current.makeClass(this.Sheets.ActorSheet);
    // static ItemSheet = Versions.current.makeClass(this.Sheets.ItemSheet);
    //#endregion

    //#region NEED UPDATE to V2
    static ActorSheet = ApplicationV1.makeClass(ApplicationV1.Sheets.ActorSheet);
    static ItemSheet = ApplicationV1.makeClass(ApplicationV1.Sheets.ItemSheet);
    //#endregion

    static Actors = convertToClass(this.Collections.Actors);
    static Items = convertToClass(this.Collections.Items);

    static Actor = convertToClass(this.Documents.Actor);
    static Item = convertToClass(this.Documents.Item);
    static Combat = convertToClass(this.Documents.Combat);
    static Combatant = convertToClass(this.Documents.Combatant);
    static ActiveEffect = convertToClass(this.Documents.ActiveEffect);
    static Macro = convertToClass(this.Documents.Macro);
    static TokenDocument = convertToClass(this.Documents.TokenDocument);

    static CombatTracker = convertToClass(this.SidebarTabs.CombatTracker);
    static ChatLog = convertToClass(this.SidebarTabs.ChatLog);

    static TokenCanvas = convertToClass(this.Placeables.Token);

    static FilePicker = convertToClass(this.Apps.FilePicker);

    static async renderTemplate(path, data) {
        return this.Handlebars.renderTemplate(path, data);
    }

    static async reRenderAllSheets() {
        const isSetor0SheeetV1 = (app) =>
            (app instanceof this.ActorSheet || app instanceof this.ItemSheet)
            && app?.element?.hasClass(SYSTEM_CLASS_CSS)
            && app?.rendered && typeof app.render === 'function';

        const isSetor0SheetV2 = (app) =>
            app?.classes?.includes(SYSTEM_CLASS_CSS)
            && typeof app.document?.render === 'function';

        Object.values(foundry.ui.windows).filter(isSetor0SheeetV1).forEach(app => app.render());
        Object.values(foundry.ui.activeWindow).filter(isSetor0SheetV2).forEach(app => app.document.render());
    }

    static async loadTemplates(path, data) {
        return this.Handlebars.loadTemplates(path, data);
    }

    static mergeObject(object1, object2) {
        return this.Utils.mergeObject(object1, object2);
    }

    static deepClone(object) {
        return this.Utils.deepClone(object);
    }

    static async createDialog(
        { title, header, content, buttons = [], minimizable = true, render = (html, renderedDialog, window) => { }, onClose = () => { } } = data,
        options,
        forcedApplication,
    ) {
        let application = forcedApplication ?? Versions.current;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            application = ApplicationV1;
        }

        return application.createDialog({ title, header, content, buttons, minimizable, render, onClose }, options);
    }
}
import { SYSTEM_CLASS_CSS } from "../constants.mjs";
import { createApplication } from "./create-application.mjs";

const ApplicationV1 = createApplication("v1");
const ApplicationV2 = createApplication("v2", ["v1"]);

const Versions = {
  current: Object.freeze(ApplicationV2),
  v1: Object.freeze(ApplicationV1),
  v2: Object.freeze(ApplicationV2),
};

const CurrentVersion = Object.freeze(Versions.current);

function convertToClass(BaseClass, application) {
  if (!application) {
    application = CurrentVersion;
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

  static Utils = CurrentVersion.Utils;
  static Handlebars = CurrentVersion.Handlebars;
  static Collections = CurrentVersion.Collections;
  static Documents = CurrentVersion.Documents;
  static Apps = CurrentVersion.Apps;
  static SidebarTabs = CurrentVersion.SidebarTabs;
  static Placeables = CurrentVersion.Placeables;
  static Sheets = CurrentVersion.Sheets;

  static ChatMessage = Object.freeze({
    getWhisperRecipients: (recipient) => CurrentVersion.ChatMessage.getWhisperRecipients(recipient),
    getSpeaker: (actor) => {
      const speaker = CurrentVersion.ChatMessage.getSpeaker({ actor: actor });
      if (!speaker.actor && actor._id) {
        speaker.actor = actor._id;
      }

      if (speaker.alias == game.user.name && actor.name) {
        speaker.alias = actor.name;
      }
      return speaker;
    },
    create: async (messageData, optionsMode) => await CurrentVersion.ChatMessage.create(messageData, optionsMode)
  });

  static SceneControls = convertToClass(CurrentVersion.Ui.SceneControls);
  static ImagePopout = convertToClass(CurrentVersion.Apps.ImagePopout);
  static Tabs = convertToClass(CurrentVersion.Ux.Tabs);

  //#region UPDATED 
  // static ActorSheet = CurrentVersion.makeClass(this.Sheets.ActorSheet);
  // static ItemSheet = CurrentVersion.makeClass(this.Sheets.ItemSheet);
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
    // V1: app.element is a jQuery object, use [0] to get native DOM element
    const isSetor0SheetV1 = (app) =>
      app?.element?.[0]?.classList?.contains(SYSTEM_CLASS_CSS)
      && app?.rendered && typeof app.render === 'function';

    // V2: check options.classes for system class
    const isSetor0SheetV2 = (app) =>
      app?.options?.classes?.includes(SYSTEM_CLASS_CSS)
      && app?.rendered && typeof app.render === 'function';

    const safeRender = (app) => {
      try {
        app.render();
      } catch (err) {
        console.warn(`[reRenderAllSheets] Falha ao re-renderizar: ${err.message}`);
      }
    };

    // V1 windows
    if (foundry.ui?.windows) {
      Object.values(foundry.ui.windows).filter(isSetor0SheetV1).forEach(safeRender);
    }

    // V2 application instances
    if (foundry.applications?.instances) {
      for (const app of foundry.applications.instances.values()) {
        if (isSetor0SheetV2(app)) {
          safeRender(app);
        }
      }
    }
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

  static duplicate(object) {
    return this.Utils.duplicate(object);
  }

  static async createDialog(
    { title, header, content, buttons = [], minimizable = true, render = (html, renderedDialog, window) => { }, onClose = () => { } } = data,
    options,
    forcedApplication,
  ) {
    let application = forcedApplication ?? CurrentVersion;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      application = ApplicationV1;
    }

    return application.createDialog({ title, header, content, buttons, minimizable, render, onClose }, options);
  }

  static async deleteFoldersInWorld(folders) {
    if (folders) {
      const sorted = folders.sort((a, b) => b.depth - a.depth);
      for (const deletable of sorted) {
        try {
          await deletable.delete();
        } catch (error) {

        }
      }
      return sorted.length;
    }
    return 0;
  }
}
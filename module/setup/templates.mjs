import { logTable } from "../utils/utils.mjs";
import { actorTemplatesRegister } from "../base/sheet/actor/player/actor-sheet.mjs";
import { equipmentTemplatesRegister } from "../base/sheet/equipment/equipment-sheet.mjs";
import { npcTemplatesRegister } from "../base/sheet/actor/npc/npc-sheet.mjs";
import { traitTemplatesRegister } from "../base/sheet/trait/trait-sheet.mjs";
import { maneuverTemplatesRegister } from "../base/sheet/maneuver/maneuver-sheet.mjs";
import { REGISTERED_TEMPLATES, TEMPLATES_PATH } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";

export async function registerTemplates() {
  const loadedAuxiliaryTemplates = await loadAuxiliaryTemplates();
  const loadedSheetTemplates = await loadSheetTemplates();

  const allTemplates = [...loadedAuxiliaryTemplates, ...loadedSheetTemplates];
  const errorsLoadedTemplates = allTemplates.filter(templateResult => templateResult.status == "Falha");
  logTemplateErrors("Erros ao carregar os templates", errorsLoadedTemplates);

  logTable('Todos os templates foram registados!', allTemplates);
}

async function loadAuxiliaryTemplates() {
  const configTemplates = [
    // EFFECTS
    { call: "status-effects-partial", path: "effects/status-effects-partial" },
    // OTHERS
    { call: "buttons-dialog", path: "others/buttons-dialog" },
    { call: "roll-chat-mode", path: "others/roll-chat-mode" },
    { call: "buttons-float-menu", path: "others/list-default-buttons-float-menu" },
    // MESSAGES
    { call: "core-roll-message", path: "messages/roll/core-result" },
    { call: "core-roll-message-invalid", path: "messages/roll/core-result-invalid" },
    { call: "button-quietness", path: "messages/roll/parts/button-quietness" },
    { call: "button-perseverance", path: "messages/roll/parts/button-perseverance" },
    { call: "button-consciousness", path: "messages/roll/parts/button-consciousness" },
    { call: "default-dices", path: "messages/roll/parts/default-dices" },
    { call: "overload-dices", path: "messages/roll/parts/overload-dices" },
    // ROLL DIALOG
    { call: "roll-dialog", path: "rolls/roll-dialog" },
    { call: "roll-dialog-default", path: "rolls/roll-dialog-default" },
    { call: "roll-dialog-custom", path: "rolls/roll-dialog-custom" },
    { call: "roll-dialog-simple", path: "rolls/roll-dialog-simple" },
    { call: "roll-dialog-virtue", path: "rolls/roll-dialog-virtue" },
    { call: "weapon-select-partial", path: "rolls/weapon-select-partial" },
  ];

  const loadedAuxiliaryTemplates = await loadAndRegisterTemplates(configTemplates);

  addOnRegisteredTemplates(loadedAuxiliaryTemplates);

  return loadedAuxiliaryTemplates;
}

async function loadSheetTemplates() {
  const sheetTemplates = [
    { model: 'Player', method: actorTemplatesRegister() },
    { model: 'Npc', method: npcTemplatesRegister() },
    { model: 'Items', method: equipmentTemplatesRegister() },
    { model: 'Traits', method: traitTemplatesRegister() },
    { model: 'Maneuvers', method: maneuverTemplatesRegister() },
  ];

  const results = await Promise.all(sheetTemplates.map(async (template) => {
    try {
      const loadedTemplates = await template.method;
      return { template: template.model, status: "Sucesso", loadedTemplates };
    } catch (error) {
      console.error(error);
      return { template: template.model, status: "Falha", template };
    }
  }));

  logTable('Templates das Fichas Registrados', results)

  const errors = results.filter(result => result.status == "Falha");
  logTemplateErrors("Erros ao carregar os registers", errors);

  const allSheetTemplates = results.flatMap(item => item.loadedTemplates);
  addOnRegisteredTemplates(allSheetTemplates);

  return allSheetTemplates;
}

export async function loadAndRegisterTemplates(inputTemplates = []) {
  const fullTemplates = inputTemplates.map(template => ({
    ...template,
    fullPath: `${TEMPLATES_PATH}/${template.path}.hbs`
  }));

  const templatesToLoad = fullTemplates.filter(template => !Handlebars.partials[template.fullPath]);

  await FoundryApi.loadTemplates(templatesToLoad.map(template => template.fullPath));

  const results = await Promise.all(fullTemplates.map(async ({ call, path, fullPath }) => {
    if (!call) {
      return { call: null, path, fullPath, status: "Ignorado (sem call)" };
    }

    const partialContent = Handlebars.partials[fullPath];
    if (!partialContent) {
      return { call, path, fullPath, status: "Falha (não encontrado)" };
    }

    try {
      Handlebars.registerPartial(call, partialContent);
      return { call, path, fullPath, status: "Sucesso" };
    } catch (error) {
      return { call, path, fullPath, status: "Falha" };
    }
  }));

  return results;
}

function addOnRegisteredTemplates(templates) {
  for (const { fullPath, status } of templates) {
    if (!status.includes('Falha')) {
      REGISTERED_TEMPLATES.add(fullPath);
    }
  }
}

function logTemplateErrors(label, errors) {
  if (errors.length > 0) {
    console.error(`⛔ ${label}`);
    console.table(errors);
  }
}
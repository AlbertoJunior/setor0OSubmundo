import { Setor0BaseActorSheet } from "../BaseActorSheet.mjs";
import { getObject, selectCharacteristic } from "../../../../utils/utils.mjs";
import { SheetMethods } from "./methods/sheet-methods.mjs";
import { selectLevelOnOptions, updateEnhancementLevelsOptions } from "./methods/enhancement-methods.mjs";
import { EquipmentType } from "../../../../enums/equipment-enums.mjs";
import { CharacteristicType } from "../../../../enums/characteristic-enums.mjs";
import { HtmlJsUtils } from "../../../../utils/html-js-utils.mjs";
import { loadAndRegisterTemplates } from "../../../../setup/templates.mjs";
import { SYSTEM_CLASS_CSS, SYSTEM_ID, TEMPLATES_PATH } from "../../../../constants.mjs";
import { SheetActorDragabbleMethods } from "./methods/dragabble-methods.mjs";
import { ActorUtils } from "../../../../core/actor/actor-utils.mjs";
import { ActiveEffectsUtils } from "../../../../core/effect/active-effects-utils.mjs";
import { FoundryApi } from "../../../../api/foundry-api.mjs";

export async function actorTemplatesRegister() {
  const templates = [
    { path: "actors/characteristics", call: 'actorCharacteristic' },
    { path: "actors/biography", call: 'actorBiography' },
    { path: "actors/biography-trait-partial", call: 'traitPartialContainer' },
    { path: "actors/status", call: 'actorStatus' },
    { path: "actors/enhancement", call: 'actorEnhancement' },
    { path: "actors/enhancement-partial", call: 'enhancementPartial' },
    { path: "actors/equipment", call: 'actorEquipment' },
    { path: "actors/shortcuts", call: 'actorShortcuts' },
    { path: "actors/shortcut-default-partial", call: 'shortcutDefaultPartial' },
    { path: "actors/network", call: 'actorNetwork' },
    { path: "actors/network-partial", call: 'networkPartial' },
  ];

  return await loadAndRegisterTemplates(templates);
}

export async function registerActor() {
  await FoundryApi.Actors.registerSheet(SYSTEM_ID, Setor0ActorSheet, {
    types: ["Player"],
    makeDefault: true
  });
}

class Setor0ActorSheet extends Setor0BaseActorSheet {
  static SHEET_CONFIG = {
    templates: [
      { name: 'sheet', template: `${TEMPLATES_PATH}/actors/actor-sheet.hbs` }
    ],
    width: 600,
    height: 890,
    classes: []
  };

  get mapEvents() {
    return {
      menu: SheetMethods.handleMethods.menu,
      trait: SheetMethods.handleMethods.trait,
      enhancement: SheetMethods.handleMethods.enhancement,
      language: SheetMethods.handleMethods.language,
      effects: SheetMethods.handleMethods.effects,
      temporary: SheetMethods.handleMethods.temporary,
      equipment: SheetMethods.handleMethods.equipment,
      shortcuts: SheetMethods.handleMethods.shortcuts,
      allies: SheetMethods.handleMethods.allies,
      informants: SheetMethods.handleMethods.informants,
      group: SheetMethods.handleMethods.characteristic,
    };
  }

  constructor(...args) {
    super(...args);
    this.filterBag = EquipmentType.UNKNOWM;
    this.isExpandedEffects = undefined;
    this.isExpandedShortcuts = undefined;
    this.defaultHeight = undefined;
  }

  configureSheet(html) {
    super.configureSheet(html);
    SheetActorDragabbleMethods.setup(html, this.actor);
  }

  postRenderConfiguration(html) {
    super.postRenderConfiguration(html);
    this.#presetSheet(html);
  }

  #presetSheet(html) {
    const actor = this.actor;
    [
      {
        container: html.querySelector('#atributosContainer'),
        systemCharacteristic: getObject(actor, CharacteristicType.ATTRIBUTES)
      },
      {
        container: html.querySelector('#repertorioContainer'),
        systemCharacteristic: getObject(actor, CharacteristicType.REPERTORY)
      },
      {
        container: html.querySelector('#skillsContainer'),
        systemCharacteristic: getObject(actor, CharacteristicType.SKILLS)
      },
      {
        container: html.querySelector('#fameContainer'),
        systemCharacteristic: getObject(actor, CharacteristicType.SIMPLE)
      }
    ].forEach(({ container, systemCharacteristic }) => {
      let hasNext = container?.firstElementChild;
      while (hasNext) {
        const children = hasNext.querySelectorAll('.S0-characteristic');
        const level = systemCharacteristic[hasNext.id];
        selectCharacteristic(children[Math.min(level - 1, children.length - 1)]);
        hasNext = hasNext.nextElementSibling;
      }
    });

    const virtueContainer = html.querySelector('#virtudesContainer');
    let virtueElementChild = virtueContainer.firstElementChild;
    while (virtueElementChild) {
      const virtueLevel = ActorUtils.getVirtueLevel(actor, virtueElementChild.id);
      selectCharacteristic(virtueElementChild.children[virtueLevel]);
      virtueElementChild = virtueElementChild.nextElementSibling;
    }

    this.#presetLanguages(html);
    this.#presetEnhancement(html);
    this.#presetStatus(html);
    this.#presetSheetExpandContainers(html);
  }

  #presetLanguages(html) {
    const langContainer = html.querySelector('#linguasContainer').children;
    const langElements = Array.from(langContainer);

    getObject(this.actor, CharacteristicType.LANGUAGE)
      .forEach(language => {
        const langElement = langElements.find(el => el.id === language)?.querySelector('.S0-characteristic');

        if (langElement) {
          selectCharacteristic(langElement);
        }
      });
  }

  #presetEnhancement(html) {
    const actor = this.actor;

    const activeEffects = new Set(ActorUtils.getEffects(actor).map(effect => ActiveEffectsUtils.getOriginId(effect)));
    const actorEnhancements = Object.values(getObject(actor, CharacteristicType.ENHANCEMENT_ALL));

    html.querySelectorAll('.S0-enhancement').forEach((enhaceContainer, index) => {
      const enhancement = actorEnhancements[index];
      const selects = Array.from(enhaceContainer.querySelectorAll('select'));

      const familySelect = selects[0];
      const option = Array.from(familySelect.options).find(option => option.dataset.itemId == enhancement.id);
      if (option) {
        option.selected = true;
        const levelSelects = selects.slice(1);
        updateEnhancementLevelsOptions(enhancement.id, levelSelects);
        selectLevelOnOptions(enhancement, levelSelects, activeEffects);
      }
    });

    function select(id, characteristic) {
      const value = getObject(actor, characteristic) || 0;
      const element = html.querySelector(`#enhancementPage #${id} .S0-characteristic:nth-child(${value})`);
      if (element) selectCharacteristic(element);
    }
    select('sobrecarga', CharacteristicType.OVERLOAD);
  }

  #presetStatus(html) {
    const actor = this.actor;

    function select(id, characteristic) {
      const value = getObject(actor, characteristic) || 0;
      const element = html.querySelector(`#statusPage #${id} .S0-characteristic:nth-child(${value})`);
      if (element) selectCharacteristic(element);
    }

    select('consciencia', CharacteristicType.VIRTUES.CONSCIOUSNESS.USED);
    select('perseveranca', CharacteristicType.VIRTUES.PERSEVERANCE.USED);
    select('quietude', CharacteristicType.VIRTUES.QUIETNESS.USED);
    select('sobrecarga', CharacteristicType.OVERLOAD);
    select('vida', CharacteristicType.LIFE);

    Setor0BaseActorSheet.presetStatusVitality(html, actor);
    Setor0BaseActorSheet.presetStatusProtect(html, actor);
  }

  #presetSheetExpandContainers(html) {
    const effectsContainer = html.querySelector('#effects-container');
    const isExpandedEffects = this.isExpandedEffects;
    this.#verifyAndExpandContainers(effectsContainer, isExpandedEffects, html);

    const shortcutsContainer = html.querySelector(`#shortcuts-container-${this.actor.id}`);
    if (!shortcutsContainer) {
      return
    }

    const isExpandedShortcuts = this.isExpandedShortcuts;
    this.#verifyAndExpandContainers(shortcutsContainer, isExpandedShortcuts, html);

    if (!this.defaultHeight || isExpandedEffects === undefined || isExpandedShortcuts == undefined) {
      requestAnimationFrame(() => {
        const content = html.parentElement?.parentElement;
        const windowElem = content?.closest(`.${SYSTEM_CLASS_CSS}`);
        this.defaultHeight = windowElem?.offsetHeight;

        this.isExpandedEffects = effectsContainer.classList.contains('S0-expanded');
        this.isExpandedShortcuts = shortcutsContainer.classList.contains('S0-expanded');
      });
    }
  }

  #verifyAndExpandContainers(container, isExpanded, html) {
    if (typeof isExpanded === 'boolean') {
      container.classList.toggle('S0-expanded', isExpanded);
      if (!isExpanded) {
        HtmlJsUtils.flipClasses(html.querySelector('#effects-container-icon'), 'fa-chevron-up', 'fa-chevron-down');
      }
    }
  }
}
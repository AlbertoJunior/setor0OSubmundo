import { TraitRepository } from "../../repository/trait-repository.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { localize } from "../../utils/utils.mjs";
import { TraitMessageCreator } from "../message/trait-message.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class TraitDialog {
  static async open(type, callback) {
    const traits = TraitRepository.getItemsByType(type);
    const content = await this.#mountContent(traits, true, true);

    FoundryApi.createDialog(
      {
        title: localize("Adicionar_Traco"),
        content: content,
        buttons: [
          { label: localize("Cancelar") },
          {
            label: localize("Adicionar"),
            default: true,
            onClick: (html) => {
              const objectTrait = this.#mountTraitObject(html, traits);
              callback(objectTrait);
            }
          }
        ],
        render: (html) => { this.#myRender(html, traits); }
      },
      { width: 400 }
    );
  }

  static async openByTrait(trait, type, actor, callback) {
    const traits = TraitRepository.getItemsByType(type);
    const content = await this.#mountContent(traits, false, callback != undefined, trait);
    const title = `${callback ? `${localize('Editar')} ` : ''}${localize('Traco.Traco')}`;

    const buttons = [];
    if (callback != undefined) {
      buttons.push({ label: localize("Cancelar") });
      buttons.push({
        label: localize("Salvar"),
        default: true,
        onClick: (html) => {
          const objectTrait = this.#mountTraitObject(html, traits);
          callback(objectTrait);
        }
      });
    } else {
      buttons.push({
        label: localize("Chat"),
        default: true,
        onClick: async (html) => {
          const fetchedTrait = traits.find(t => t.id == trait.sourceId);
          if (fetchedTrait) {
            const messageContent = await TraitMessageCreator.mountContent(fetchedTrait);
            ChatCreator.sendToChat(actor, messageContent);
          }
        }
      });
    }

    FoundryApi.createDialog(
      {
        title: title,
        content: content,
        buttons: buttons,
        render: (html) => { this.#myRender(html, traits); }
      },
      { width: 400 }
    );
  }

  static async #mountContent(traits, enableChangeTrait, enableChangeParticularity, trait) {
    const selectedTrait = traits.find(element => element.id == trait?.sourceId);

    const data = {
      title: localize('Traco.Traco'),
      options: this.#mapOptions(traits, selectedTrait),
      isEnabledChangeTrait: enableChangeTrait ? '' : 'disabled',
      particularity: localize('Particularidade'),
      isEnabledChangeParticularity: enableChangeParticularity ? '' : 'disabled',
      particularityValue: selectedTrait?.particularity || '',
      morph: localize('Morfologia'),
      morphValue: selectedTrait?.morph || '',
      requirement: localize('Requisito'),
      requirementValue: selectedTrait?.requirement || '',
      cost: localize('Custo'),
      description: selectedTrait?.description
    };

    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/traits/trait-dialog.hbs`, data);
  }

  static #mapOptions(traits, selectedTrait) {
    const groups = {};

    const prefix = 'XP:';

    traits.forEach((attr, index) => {
      const groupLabel = attr.morph ? attr.morph : `${prefix} ${attr.xp}`;

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push({
        id: attr.id,
        isSelected: selectedTrait?.id === attr.id ? 'selected' : '',
        label: attr.name
      });
    });

    return Object.entries(groups)
      .sort(([labelA], [labelB]) => {
        const isXPA = labelA.startsWith(prefix);
        const isXPB = labelB.startsWith(prefix);

        if (isXPA && isXPB) {
          const xpA = parseInt(labelA.replace(prefix, "").trim());
          const xpB = parseInt(labelB.replace(prefix, "").trim());
          return xpA - xpB;
        }

        if (isXPA) {
          return 1;
        }

        if (isXPB) {
          return -1;
        }

        return labelA.localeCompare(labelB);
      })
      .map(([label, options]) => (
        {
          label,
          options
        }
      ));
  }

  static #mountTraitObject(html, traits) {
    const traitId = html.querySelector('#trait').value;
    const objectTrait = this.#findTrait(traits, traitId);
    if (objectTrait.particularity != undefined) {
      const particularity = html.querySelector('#particularity').value;
      objectTrait['particularity'] = particularity;
    }
    return objectTrait;
  }

  static #myRender(html, traits) {
    html.querySelector('#trait').addEventListener('change', (event) => {
      this.#updateValues(html, traits)
    });
    this.#updateValues(html, traits);
  }

  static #updateValues(html, traits) {
    const traitId = html.querySelector('#trait').value;
    const selectedTrait = this.#findTrait(traits, traitId);

    const htmlElements = {
      costLabel: { element: html.querySelector('#cost') },
      divParticularity: { element: html.querySelector('#divParticularity'), addClass: 'hidden' },
      particularityLabel: { element: html.querySelector('#particularity') },
      divRequirement: { element: html.querySelector('#divRequirement'), addClass: 'hidden' },
      requirementLabel: { element: html.querySelector('#requirement') },
      divMorph: { element: html.querySelector('#divMorph'), addClass: 'hidden' },
      morphLabel: { element: html.querySelector('#morph') },
      descriptionLabel: { element: html.querySelector('#description') },
    };

    if (selectedTrait) {
      this.#toggleVisibility(selectedTrait.particularity, htmlElements.divParticularity, htmlElements.particularityLabel);
      this.#toggleVisibility(selectedTrait.requirement, htmlElements.divRequirement, htmlElements.requirementLabel, selectedTrait.requirement);
      this.#toggleVisibility(selectedTrait.morph, htmlElements.divMorph, htmlElements.morphLabel, selectedTrait.morph);

      htmlElements.costLabel.element.innerHTML = selectedTrait.xp ?? "0";
      htmlElements.descriptionLabel.element.innerHTML = selectedTrait.description;
    } else {
      Object.values(htmlElements).forEach(el => {
        if (el.addClass) {
          el.element.classList.add(el.addClass);
        }
      });
      htmlElements.costLabel.element.innerHTML = '0';
      htmlElements.particularityLabel.element.innerHTML = '';
    }

    if (html.parentElement && html.parentElement.parentElement) {
      html.parentElement.parentElement.style.height = 'auto';
    }
  }

  static #findTrait(traits, traitId) {
    return traits.find(element => element.id == traitId);
  }

  static #toggleVisibility(particularity, container, labelContainer = null, value = "") {
    const haveElement = particularity !== undefined
    const element = container.element;
    const label = labelContainer.element;

    element.classList.toggle("hidden", !haveElement);
    if (label) {
      label.innerHTML = haveElement ? value : "";
    }
  }
}
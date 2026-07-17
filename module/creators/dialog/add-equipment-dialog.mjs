import { localize, localizeType } from "../../utils/utils.mjs"
import { TEMPLATES_PATH } from "../../constants.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class AddEquipmentDialog {
  static async showItemSelectorDialog(items, onSelect = () => { }) {
    const content = await this.#mountContent();

    FoundryApi.createDialog(
      {
        title: localize('Selecionar_Item'),
        content: content,
        render: (html, dialog) => {
          this.#initRender(html, items, dialog, onSelect);
        },
      },
      {
        width: 540,
      }
    );
  }

  static #initRender(html, items, dialog, onSelect = () => { }) {
    const selectedItems = new Set();

    let actualSelectedButton = undefined;
    html.querySelectorAll(`[data-action="${OnEventType.CHECK}"]`).forEach(el => {
      el.addEventListener('click', (event) => {
        const currentTarget = event.currentTarget;
        let newList = [];
        if (actualSelectedButton == currentTarget) {
          currentTarget.classList.remove('S0-marked');
          actualSelectedButton = undefined;

          newList = items;
        } else {
          actualSelectedButton?.classList.remove('S0-marked')
          currentTarget.classList.add('S0-marked');
          actualSelectedButton = currentTarget;

          const type = currentTarget.dataset.type;
          if (type == 'selected') {
            newList = selectedItems;
          } else {
            newList = items.filter(item => item.type.toLowerCase() == type);
          }
        }

        this.#renderItems(html, newList, selectedItems);
      });
    });

    const filterInput = html.querySelector("#filter-input");
    filterInput.addEventListener("input", () => {
      const query = filterInput.value.toLowerCase();

      let filtered = items;
      if (actualSelectedButton) {
        const type = actualSelectedButton.dataset.type;
        filtered = items.filter(item => item.type.toLowerCase() == type);
      }

      filtered = filtered.filter(i => i.name.toLowerCase().includes(query));
      this.#renderItems(html, filtered, selectedItems);
    });

    const addButton = html.querySelector("#add-item-button");
    addButton.addEventListener("click", (event) => {
      event.preventDefault();
      onSelect(selectedItems);
      dialog.close();
    });

    this.#renderItems(html, items, selectedItems);
  }

  static #renderItems(html, filteredItems, selectedItems) {
    const carousel = html.querySelector("#carousel");
    const addButton = html.querySelector("#add-item-button");
    const details = html.querySelector("#item-details");

    carousel.innerHTML = '';
    for (const item of filteredItems) {
      const card = this.#createItemCard(item, selectedItems.has(item));

      card.addEventListener("click", () => {
        if (selectedItems.has(item)) {
          selectedItems.delete(item);
        } else {
          selectedItems.add(item);
        }
        card.classList.toggle("S0-selected", selectedItems.has(item));
        this.#updateSelectionCount(addButton, selectedItems);
        this.#updateDetails(details, item, selectedItems.size === 0);
      });

      carousel.appendChild(card);
    }
  }

  static #createItemCard(item, isSelected) {
    const card = document.createElement('div');
    card.className = 'S0-item-bag S0-clickable';
    if (isSelected) card.classList.add("S0-selected");

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;

    const divName = document.createElement('div');
    divName.className = 'S0-item-legend S0-px-4';

    const name = document.createElement('span');
    name.className = 'S0-hide-long-text';
    name.textContent = item.name;

    divName.appendChild(name);

    card.appendChild(img);
    card.appendChild(divName);
    return card;
  }

  static #updateSelectionCount(addButton, selectedItems) {
    const count = selectedItems.size;
    addButton.textContent = `Adicionar (${count}) ite${count <= 1 ? 'm' : 'ns'}`;
    addButton.disabled = count === 0;
  }

  static #updateDetails(details, item, isEmpty) {
    if (isEmpty) {
      details.innerHTML = `
                <div class="S0-message-simple-text">
                    Selecione um item para ver detalhes.
                </div>
            `;
      return;
    }

    const typeString = `<strong>${localize('Tipo')}:</strong> <span>${localizeType('Item.' + item.type)}</span>`
    const nameString = `<strong>${localize('Nome')}:</strong> <span>${item.name}</span>`
    details.innerHTML = `
            ${typeString}
            <br>
            ${nameString}
            <br>
            <strong>${localize('Descricao')}:</strong>
            <div class="S0-message-simple-text">
                ${item.description ?? "Sem descrição."}
            </div>
            `;
  }

  static async #mountContent() {
    const data = {
    }
    return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/items/dialog/add-equipment-dialog.hbs`, data);
  }
}
import { gameLocalize, localize, randomId } from "../../utils/utils.mjs";
import { EquipmentInfoParser } from "../../core/equipment/equipment-info.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType, SuperEquipmentParticularityType } from "../../enums/equipment-enums.mjs";
import { SuperEquipmentParticularityField } from "../../data/field/equipment-field.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { AttributeRepository } from "../../repository/attribute-repository.mjs";
import { SuperEquipmentTraitRepository } from "../../repository/superequipment-trait-repository.mjs";
import { NotificationsUtils } from "../message/notifications.mjs";
import { CreateFormDialog } from "./create-dialog.mjs";

export class SuperEquipmentEffectsDialog {
  static async open(type, onConfirm = (selectedEffect, characteristic) => { }) {
    let title;
    let listTraits;
    let characteristic;

    if (type == 'good') {
      title = localize('Itens.Efeitos');
      listTraits = SuperEquipmentTraitRepository.getGoodTraits();
      characteristic = EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS;
    } else if (type == 'bad') {
      title = localize('Itens.Defeitos');
      listTraits = SuperEquipmentTraitRepository.getBadTraits();
      characteristic = EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS;
    } else {
      console.warn('erro com o tipo');
      return;
    }

    const listCharacteristics = this.#mapCharacteristicsToOptions();
    const uuid = randomId(10);

    CreateFormDialog.open(
      title,
      'items/dialog/superequipment-effect-dialog',
      {
        presetForm: {
          traits: this.#mapTraitToOptions(listTraits),
          characteristic: listCharacteristics,
          uuid: uuid,
        },
        render: (html, renderedDialog, windowApp) => this.#render(windowApp, html, listTraits, listCharacteristics),
        onConfirm: (data) => {
          const { selectedTrait, particularity, selectedParticularity } = data;
          const trait = this.#findTrait(listTraits, selectedTrait);

          if (!trait) {
            NotificationsUtils.error('Erro ao selecionar Traço');
            return;
          }

          const requireParticularity = !!trait.particularity;
          const hasParticularity = particularity?.trim().length > 0;

          if (requireParticularity && !hasParticularity) {
            NotificationsUtils.error('Esse Traço precisa do campo Particularidade preenchido');
            return;
          }

          const particularityObject = hasParticularity
            ? this.#mountTraitParticularity(trait.particularity, particularity, selectedParticularity)
            : null;

          if (typeof onConfirm === 'function') {
            const copyObject = {
              ...trait,
              id: `${uuid}.${trait.id}`,
              particularity: particularityObject,
            };

            onConfirm(copyObject, characteristic);
          }
        },
        windowOptions: {
          width: 400
        },
      }
    );
  }

  static #mapCharacteristicsToOptions() {
    const groups = {
      [localize('Atributos.Atributos')]: AttributeRepository.getItems(),
      [localize('Habilidades')]: AbilityRepository.getItems(),
      [localize('Tipo_Dano')]: EquipmentInfoParser.getDamageTypes(),
    };

    return Object.entries(groups)
      .map(([label, options]) => ({
        label,
        options: options.map(opt => ({
          ...opt,
          name: gameLocalize(opt.label),
        })),
      }));
  }

  static #mapTraitToOptions(list) {
    const costText = localize('Custo');
    const groups = {};

    list.forEach((attr, index) => {
      const groupLabel = `${costText}: ${attr.cost}`;

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push({
        ...attr,
        index,
      });
    });

    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(a.split(':')[1]) - parseInt(b.split(':')[1]))
      .map(([label, options]) => (
        {
          label,
          options
        }
      ));
  }

  static #render(windowApp, html, listTraits, listCharacteristics) {
    const characteristics = listCharacteristics.flatMap(group => group.options);

    const selectEffect = html.querySelector('select[name="selectedTrait"]');
    const cost = html.querySelector('#costValue');
    const limit = html.querySelector('#limitValue');
    const description = html.querySelector('.S0-container .S0-message-simple-text');

    const particularityContainer = html.querySelector('#particularityContainer');
    const inputParticularity = html.querySelector('input[name="particularity"]');

    const selectParticularityContainer = html.querySelector('#selectedParticularityContainer');
    const selectCharacteristicParticularity = html.querySelector('select[name="selectedParticularity"]');

    const characteristicElements = { selectCharacteristicParticularity, inputParticularity };
    selectCharacteristicParticularity.addEventListener('change', () => this.#onSelectCharacteristicChange(characteristics, characteristicElements));

    const effectsElements = {
      selectEffect, description, cost, limit,
      particularityContainer, inputParticularity,
      selectParticularityContainer, selectCharacteristicParticularity
    };
    selectEffect.addEventListener('change', () => this.#onSelectEffectChange(windowApp, listTraits, effectsElements));
    this.#onSelectEffectChange(windowApp, listTraits, effectsElements);
  }

  static #onSelectCharacteristicChange(characteristics, jElements) {
    const { selectCharacteristicParticularity, inputParticularity } = jElements;
    const selectedVal = selectCharacteristicParticularity.value;
    const selected = characteristics.find(c => c.id == selectedVal);
    if (selected) {
      inputParticularity.value = selected.name;
    }
  }

  static #onSelectEffectChange(windowApp, listTraits, jElements) {
    const {
      selectEffect, description, cost, limit,
      particularityContainer, inputParticularity,
      selectParticularityContainer, selectCharacteristicParticularity: selectCharacteristic
    } = jElements;

    const selectedId = selectEffect.value;
    const trait = this.#findTrait(listTraits, selectedId);

    if (!trait) {
      particularityContainer.style.display = 'none';
      selectParticularityContainer.style.display = 'none';
      return;
    }

    description.textContent = trait.description;
    cost.textContent = trait.cost;
    limit.textContent = trait.limit;

    inputParticularity.value = '';

    const jElementsCharacteristics = { selectParticularityContainer, selectCharacteristic, inputParticularity, particularityContainer };
    this.#updateSelectCharacteristic(trait, jElementsCharacteristics);

    windowApp.style.height = 'auto';
  }

  static #updateSelectCharacteristic(trait, jElements) {
    const hasParticularity = trait.particularity != null;

    const { selectParticularityContainer, selectCharacteristic, inputParticularity, particularityContainer } = jElements;

    if (hasParticularity) {
      const particularityType = trait.particularity.type;

      const mappedIndex = {
        [SuperEquipmentParticularityType.ATTRIBUTE]: 0,
        [SuperEquipmentParticularityType.SKILL]: 6,
        [SuperEquipmentParticularityType.DAMAGE_TYPE]: 20,
      };
      const index = mappedIndex[particularityType];
      const canSelect = index != null;

      if (particularityType == SuperEquipmentParticularityType.FIXED) {
        selectParticularityContainer.style.display = 'none';
        particularityContainer.style.display = 'none';
        selectCharacteristic.value = '';
        inputParticularity.value = trait.particularity.description;
        return;
      }

      selectParticularityContainer.style.display = canSelect ? '' : 'none';
      particularityContainer.style.display = !canSelect ? '' : 'none';

      if (canSelect) {
        selectCharacteristic.selectedIndex = index;
        selectCharacteristic.dispatchEvent(new Event('change'));
      } else {
        selectCharacteristic.value = '';
      }
    } else {
      particularityContainer.style.display = 'none';
      selectParticularityContainer.style.display = 'none';
    }
  }

  static #findTrait(listTraits, id) {
    return listTraits.find(trait => trait.id == id);
  }

  static #mountTraitParticularity(particularity, inputParticularity, selectedParticularity) {
    const particularityObject = SuperEquipmentParticularityField.toJson(
      {
        ...particularity,
        description: inputParticularity.trim(),
      }
    );

    const particularityType = particularity.type;
    if (particularityType != SuperEquipmentParticularityType.FIXED) {
      const mappedCharacteristic = {
        [SuperEquipmentParticularityType.ATTRIBUTE]: {
          path: CharacteristicType.BONUS.ATTRIBUTES,
          value: particularity.change?.value || 2
        },
        [SuperEquipmentParticularityType.SKILL]: {
          path: CharacteristicType.BONUS.SKILL,
          value: particularity.change?.value || 1
        },
      };

      const characteristic = mappedCharacteristic[particularityType];
      if (characteristic && selectedParticularity) {
        const key = `${characteristic.path.system}.${selectedParticularity}`
        particularityObject.change = { key: key, value: characteristic.value }
      }
    }
    return particularityObject;
  }
}
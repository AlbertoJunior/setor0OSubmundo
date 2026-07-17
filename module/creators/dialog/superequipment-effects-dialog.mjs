import { gameLocalize, localize, randomId } from "../../utils/utils.mjs";
import { EquipmentInfoParser } from "../../core/equipment/equipment-info.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType, SuperEquipmentParticularityType } from "../../enums/equipment-enums.mjs";
import { SuperEquipmentParticularityField } from "../../data/field/equipment-field.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { AttributeRepository } from "../../repository/attribute-repository.mjs";
import { SuperEquipmentTraitRepository } from "../../repository/superequipment-trait-repository.mjs";
import { TraitRepository } from "../../repository/trait-repository.mjs";
import { NotificationsUtils } from "../message/notifications.mjs";
import { CreateFormDialog } from "./create-dialog.mjs";
import { TraitType } from "../../enums/trait-enums.mjs";
import { EffectChangeValueType } from "../../enums/enhancement-enums.mjs";

export class SuperEquipmentEffectsDialog {
  static #WIDTH = 400;

  static async open(type, onConfirm = (selectedEffect, characteristic) => { }) {
    let title;
    let listTraits;
    let characteristic;

    if (type == TraitType.GOOD) {
      title = localize('Itens.Efeitos');
      listTraits = SuperEquipmentTraitRepository.getGoodTraits();
      characteristic = EquipmentCharacteristicType.SUPER_EQUIPMENT.EFFECTS;
    } else if (type == TraitType.BAD) {
      title = localize('Itens.Defeitos');
      listTraits = SuperEquipmentTraitRepository.getBadTraits();
      characteristic = EquipmentCharacteristicType.SUPER_EQUIPMENT.DEFECTS;
    } else {
      console.warn('erro com o tipo');
      return;
    }

    const listCharacteristics = this.#mapCharacteristicsToOptions();
    const uuid = randomId(10);

    const traitsOptions = [
      ...this.#mapTraitToOptions(listTraits),
      {
        label: localize('Outro'),
        options: [{ id: 'custom', name: `[ ${localize('Criar_Customizado')} ]` }]
      },
    ];

    CreateFormDialog.open(
      title,
      'items/dialog/superequipment-effect-dialog',
      {
        presetForm: {
          traits: traitsOptions,
          effectsOptions: TraitRepository.getBonusOptionsMap(),
          skillsOptions: AbilityRepository.getItems().map(opt => ({
            ...opt,
            name: gameLocalize(opt.label),
          })),
          characteristic: listCharacteristics,
          uuid: uuid,
        },
        render: (html, renderedDialog, windowApp) => this.#render(windowApp, html, listTraits, listCharacteristics),
        onConfirm: (data) => {
          const {
            selectedTrait,
            particularity,
            selectedParticularity,
            description,
            cost,
            limit,
            key,
            skillKey,
            value
          } = data;

          if (selectedTrait === 'custom') {
            if (!description?.trim()) {
              NotificationsUtils.error(localize("Aviso.Erro.Descricao_Obrigatoria"));
              return;
            }

            let effectKey = key;
            let partType = SuperEquipmentParticularityType.FIXED;

            if (effectKey === CharacteristicType.BONUS.SKILL.system && skillKey) {
              effectKey = `${effectKey}.${skillKey}`;
              partType = SuperEquipmentParticularityType.SKILL;
            } else {
              partType = SuperEquipmentParticularityType.ATTRIBUTE;
            }

            const change = {
              key: effectKey,
              value: Number(value),
              typeOfValue: EffectChangeValueType.FIXED,
              mode: CONST.ACTIVE_EFFECT_MODES.ADD
            };

            const particularityObject = {
              type: partType,
              description: description,
              change: change
            };

            if (partType === SuperEquipmentParticularityType.SKILL) {
              const matchedSkill = AbilityRepository.getItems().find(o => o.id === skillKey);
              if (matchedSkill) particularityObject.description = gameLocalize(matchedSkill.label);
            } else {
              const effectsOptions = TraitRepository.getBonusOptionsMap();
              const matchedOption = effectsOptions.flatMap(g => g.options).find(o => o.id === key);
              if (matchedOption) particularityObject.description = matchedOption.description;
            }

            if (typeof onConfirm === 'function') {
              const customTrait = {
                id: randomId(),
                name: description,
                cost: Number(cost),
                limit: Number(limit),
                description: description,
                particularity: particularityObject,
              };

              onConfirm(customTrait, characteristic);
            }
            return;
          }

          const trait = this.#findTrait(listTraits, selectedTrait);

          if (!trait) {
            NotificationsUtils.error(localize("Aviso.Erro.Selecionar_Traco"));
            return;
          }

          const requireParticularity = !!trait.particularity;
          const hasParticularity = particularity?.trim().length > 0;

          if (requireParticularity && !hasParticularity) {
            NotificationsUtils.error(localize("Aviso.Erro.Traco_Particularidade_Preenchida"));
            return;
          }

          const particularityObject = hasParticularity
            ? this.#mountTraitParticularity(trait.particularity, particularity, selectedParticularity, false)
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
          width: this.#WIDTH
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

    const customFormContainer = html.querySelector('#customFormContainer');
    const defaultValuesContainer = html.querySelector('#defaultValuesContainer');

    const selectParticularityContainer = html.querySelector('#selectedParticularityContainer');
    const selectCharacteristicParticularity = html.querySelector('select[name="selectedParticularity"]');

    const characteristicElements = { selectCharacteristicParticularity, inputParticularity };
    selectCharacteristicParticularity.addEventListener('change', () => this.#onSelectCharacteristicChange(characteristics, characteristicElements));

    const selectEffectKey = html.querySelector('#effectKey');
    const customParticularityContainer = html.querySelector('#customParticularityContainer');

    const checkSkillSelection = () => {
      if (selectEffectKey && selectEffectKey.value === CharacteristicType.BONUS.SKILL.system) {
        if (customParticularityContainer) customParticularityContainer.style.display = 'block';
      } else {
        if (customParticularityContainer) customParticularityContainer.style.display = 'none';
      }
      windowApp.style.height = 'auto';
    };

    if (selectEffectKey) selectEffectKey.addEventListener('change', checkSkillSelection);
    checkSkillSelection();

    const effectsElements = {
      selectEffect, description, cost, limit,
      particularityContainer, inputParticularity,
      selectParticularityContainer, selectCharacteristicParticularity,
      customFormContainer, defaultValuesContainer
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
      selectEffect,
      description,
      cost,
      limit,
      particularityContainer,
      inputParticularity,
      selectParticularityContainer,
      selectCharacteristicParticularity: selectCharacteristic,
      customFormContainer,
      defaultValuesContainer
    } = jElements;

    const selectedId = selectEffect.value;

    if (selectedId === 'custom') {
      customFormContainer.style.display = '';
      defaultValuesContainer.style.display = 'none';
      particularityContainer.style.display = 'none';
      selectParticularityContainer.style.display = 'none';
      windowApp.style.height = 'auto';
      return;
    } else {
      customFormContainer.style.display = 'none';
      defaultValuesContainer.style.display = '';
    }

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

  static #mountTraitParticularity(particularity, inputParticularity, selectedParticularity, isCustom = false) {
    const particularityObject = SuperEquipmentParticularityField.toJson(
      {
        ...particularity,
        description: inputParticularity.trim(),
      }
    );

    let particularityType = particularity.type;

    if (isCustom && selectedParticularity) {
      if (selectedParticularity.includes('attribute')) {
        particularityType = SuperEquipmentParticularityType.ATTRIBUTE;
      } else if (selectedParticularity.includes('skill')) {
        particularityType = SuperEquipmentParticularityType.SKILL;
      } else {
        particularityType = SuperEquipmentParticularityType.DAMAGE_TYPE;
      }
      particularityObject.type = particularityType;
    }

    if (particularityType != SuperEquipmentParticularityType.FIXED) {
      const mappedCharacteristic = {
        [SuperEquipmentParticularityType.ATTRIBUTE]: {
          path: CharacteristicType.BONUS.ATTRIBUTES,
          value: particularity.change?.value || 2
        },
        [SuperEquipmentParticularityType.SKILL]: {
          path: CharacteristicType.BONUS.SKILL,
          value: particularity.change?.value || 1
        }
      };

      const characteristic = mappedCharacteristic[particularityType];
      if (characteristic && selectedParticularity) {
        let key = selectedParticularity;

        // Em traits normais, a chave muitas vezes é preenchida pelo Enum base
        if (!isCustom) {
          key = `${characteristic.path.system}.${selectedParticularity}`;
        }

        particularityObject.change = { key: key, value: characteristic.value };
      }
    }

    // Resolve issue: (nome) instead of (modificador)
    // Only in regular traits we passed the name into inputParticularity instead of the dropdown val
    if (!isCustom) {
      particularityObject.description = inputParticularity.trim();
    }

    return particularityObject;
  }
}
import { gameLocalize, localize, randomId } from "../../../scripts/utils/utils.mjs";
import { EquipmentInfoParser } from "../../core/equipment/equipment-info.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType, SuperEquipmentParticularityType } from "../../enums/equipment-enums.mjs";
import { SuperEquipmentParticularityField } from "../../field/equipment-field.mjs";
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
            [localize('Atributos')]: AttributeRepository.getItems(),
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

        const selectEffect = html.find('select[name="selectedTrait"]');
        const cost = html.find('#costValue');
        const limit = html.find('#limitValue');
        const description = html.find('.S0-container .S0-message-simple-text');

        const particularityContainer = html.find('#particularityContainer');
        const inputParticularity = html.find('input[name="particularity"]');

        const selectParticularityContainer = html.find('#selectedParticularityContainer');
        const selectCharacteristicParticularity = html.find('select[name="selectedParticularity"]');

        const characteristicElements = { selectCharacteristicParticularity, inputParticularity };
        selectCharacteristicParticularity.on('change', () => this.#onSelectCharacteristicChange(characteristics, characteristicElements));

        const effectsElements = {
            selectEffect, description, cost, limit,
            particularityContainer, inputParticularity,
            selectParticularityContainer, selectCharacteristicParticularity
        };
        selectEffect.on('change', () => this.#onSelectEffectChange(windowApp, listTraits, effectsElements));
        this.#onSelectEffectChange(windowApp, listTraits, effectsElements);
    }

    static #onSelectCharacteristicChange(characteristics, jElements) {
        const { selectCharacteristicParticularity, inputParticularity } = jElements;
        const selectedVal = selectCharacteristicParticularity.val();
        const selected = characteristics.find(c => c.id == selectedVal);
        if (selected) {
            inputParticularity.val(selected.name);
        }
    }

    static #onSelectEffectChange(windowApp, listTraits, jElements) {
        const {
            selectEffect, description, cost, limit,
            particularityContainer, inputParticularity,
            selectParticularityContainer, selectCharacteristicParticularity: selectCharacteristic
        } = jElements;

        const selectedId = selectEffect.val();
        const trait = this.#findTrait(listTraits, selectedId);

        if (!trait) {
            particularityContainer.hide();
            selectParticularityContainer.hide();
            return;
        }

        description.text(trait.description);
        cost.text(trait.cost);
        limit.text(trait.limit);

        inputParticularity.val('');

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
                selectParticularityContainer.hide();
                particularityContainer.hide();
                selectCharacteristic.val('');
                inputParticularity.val(trait.particularity.description);
                return;
            }

            selectParticularityContainer.toggle(canSelect);
            particularityContainer.toggle(!canSelect);

            if (canSelect) {
                selectCharacteristic.prop('selectedIndex', index).trigger('change');
            } else {
                selectCharacteristic.val('');
            }
        } else {
            particularityContainer.hide();
            selectParticularityContainer.hide();
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
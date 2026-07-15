import { getObject, localize, gameLocalize, onArrayRemove, randomId } from "../../../../utils/utils.mjs";
import { RollTestUtils } from "../../../../core/rolls/roll-test-utils.mjs";
import { CreateRollableTestDialog } from "../../../../creators/dialog/create-roll-test-dialog.mjs";
import { NotificationsUtils } from "../../../../creators/message/notifications.mjs";
import { ActorType } from "../../../../enums/characteristic-enums.mjs";
import { EquipmentCharacteristicType } from "../../../../enums/equipment-enums.mjs";
import { OnEventType } from "../../../../enums/on-event-type.mjs"
import { EquipmentUpdater } from "../../../updater/equipment-updater.mjs";
import { playerRollHandle } from "../../actor/player/methods/player-roll-methods.mjs";
import { npcRollHandle } from "../../actor/npc/methods/npc-roll-methods.mjs";
import { handlerEquipmentMenuRollEvents } from "./equipment-menu-roll-methods.mjs";
import { CreateFormDialog } from "../../../../creators/dialog/create-dialog.mjs";
import { NpcUtils } from "../../../../core/npc/npc-utils.mjs";
import { RollTestMessageCreator } from "../../../../creators/message/roll-test-message.mjs";
import { ChatCreator } from "../../../../utils/chat-creator.mjs";
import { AttributeRepository } from "../../../../repository/attribute-repository.mjs";
import { AbilityRepository } from "../../../../repository/ability-repository.mjs";
import { MacroTypesEnum } from "../../../../enums/macro-enums.mjs";

export const handlerEquipmentItemRollEvents = {
  [OnEventType.ADD]: async (item, event) => EquipmentSheetItemRollHandle.add(item, event),
  [OnEventType.EDIT]: async (item, event) => EquipmentSheetItemRollHandle.edit(item, event),
  [OnEventType.REMOVE]: async (item, event) => EquipmentSheetItemRollHandle.remove(item, event),
  [OnEventType.CHECK]: async (item, event) => EquipmentSheetItemRollHandle.check(item, event),
  [OnEventType.ROLL]: async (item, event) => EquipmentSheetItemRollHandle.roll(item, event),
  [OnEventType.CHAT]: async (item, event) => EquipmentSheetItemRollHandle.chat(item, event),
  [OnEventType.VIEW]: async (item, event) => EquipmentSheetItemRollHandle.view(item, event),
}

export async function rollByItemAndRollId(item, rollId) {
  await EquipmentSheetItemRollHandle.rollById(item, rollId);
}

class EquipmentSheetItemRollHandle {
  static async add(item, event) {
    const rollTest = this.#getItemRollTest(item, this.#getItemRollTestId(event));
    if (!rollTest) {
      NotificationsUtils.error(localize('Aviso.Teste.Erro_Carregar'));
      return;
    }

    const addType = event.currentTarget.dataset.type;
    if (addType == 'macro') {
      await RollTestUtils.createMacroByRollTestData(rollTest, { parentName: item.name, img: item.img, actor: item.actor, type: MacroTypesEnum.EQUIPAMENTO });
    } else if (addType == 'clone') {
      const cloneTest = {
        ...rollTest,
        name: `${rollTest.name} (${localize('Copia')})`,
        id: randomId(),
      };
      await handlerEquipmentMenuRollEvents.createRollTest(item, cloneTest);
    }
  }

  static async edit(item, event) {
    const rollTest = this.#getItemRollTest(item, this.#getItemRollTestId(event));
    const onConfirm = async (newRollTest) => {
      const possibleTests = this.#getItemTests(item);
      possibleTests[possibleTests.indexOf(rollTest)] = newRollTest;
      await EquipmentUpdater.updateEquipment(item, EquipmentCharacteristicType.POSSIBLE_TESTS, possibleTests)
    }
    CreateRollableTestDialog.open(rollTest, onConfirm, undefined, item.actor, MacroTypesEnum.EQUIPAMENTO);
  }

  static async remove(item, event) {
    const rollId = this.#getItemRollTestId(event);
    const rollTest = this.#getItemRollTest(item, rollId);
    if (!rollTest) {
      return;
    }

    const possibleTests = this.#getItemTests(item);
    onArrayRemove(possibleTests, rollTest);

    const changes = [EquipmentUpdater.createChange(EquipmentCharacteristicType.POSSIBLE_TESTS, possibleTests)];

    const currentDefaultTestId = getObject(item, EquipmentCharacteristicType.DEFAULT_TEST);
    if (currentDefaultTestId == rollId) {
      let newDefaultTest = ''
      if (possibleTests.length > 0) {
        newDefaultTest = possibleTests[0].id;
      }

      changes.push(EquipmentUpdater.createChange(EquipmentCharacteristicType.DEFAULT_TEST, newDefaultTest));
    }

    await EquipmentUpdater.updateEquipmentData(item, changes);
  }

  static async check(item, event) {
    const rollId = this.#getItemRollTestId(event);
    const possibleTests = this.#getItemTests(item);

    const sortedTests = possibleTests.sort((a, b) => {
      if (a.id === rollId) {
        return -1
      } else if (b.id === rollId) {
        return 1
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    const changes = [
      EquipmentUpdater.createChange(EquipmentCharacteristicType.DEFAULT_TEST, rollId),
      EquipmentUpdater.createChange(EquipmentCharacteristicType.POSSIBLE_TESTS, sortedTests)
    ];

    await EquipmentUpdater.updateEquipmentData(item, changes);
  }

  static async roll(item, event) {
    const dataset = event.currentTarget.dataset;
    const rollId = dataset.itemId;
    this.rollById(item, rollId);
  }

  static async rollById(item, rollId) {
    const possibleTests = this.#getItemTests(item);
    const rollTest = possibleTests.find(test => test.id == rollId);
    if (!rollTest) {
      return;
    }

    if (!item.actor) {
      NotificationsUtils.error(localize('Aviso.Teste.Erro_Sem_Ator'));
      return;
    }

    const actor = item.actor;
    const isNpc = actor.type == ActorType.NPC;

    CreateFormDialog.open(
      localize("Modificadores"),
      "rolls/modifiers",
      {
        presetForm: {
          canBeHalf: isNpc ? NpcUtils.canHalfTest(actor) : true,
          canBeOverload: isNpc,
          canBeSpecialist: isNpc ? NpcUtils.canBeSpecialist(actor) : true,
          canBePenalty: isNpc,
          values: {
            bonus: rollTest.bonus,
            automatic: rollTest.automatic,
            specialist: rollTest.specialist,
            critic: rollTest.critic,
            difficulty: rollTest.difficulty,
            penalty: isNpc ? NpcUtils.calculatePenalty(actor) : 0,
          }
        },
        onConfirm: async (data) => {
          const updatedRollTest = {
            ...rollTest,
            bonus: Number(data.bonus),
            automatic: Number(data.automatic),
            specialist: Boolean(data.specialist),
            critic: Number(data.critic),
            difficulty: Number(data.difficulty),
          };

          const half = Boolean(data.half);
          const rollMode = data.chatSelect;

          const mappedRollActor = {
            [ActorType.PLAYER]: async () => {
              await playerRollHandle.rollableItem(actor, updatedRollTest, item, half, rollMode);
            },
            [ActorType.NPC]: async () => {
              updatedRollTest.penalty = Number(data.penalty);
              updatedRollTest.overload = Number(data.overload);
              await npcRollHandle.rollableItem(actor, updatedRollTest, item, half, rollMode);
            },
          }

          const mappedMethod = mappedRollActor[actor.type];
          if (typeof mappedMethod === 'function') {
            mappedMethod();
          } else {
            console.warn('o teste não possui um tipo de personagem mapeado');
          }
        }
      },
    );
  }

  static async chat(item, event) {
    const rollTest = this.#getItemRollTest(item, this.#getItemRollTestId(event));
    if (!rollTest) {
      return;
    }

    const actor = item.actor;
    if (!actor) {
      return;
    }

    const primaryAttr = AttributeRepository.getItems().find(a => a.id === rollTest.primary_attribute);
    const secondaryAttr = AttributeRepository.getItems().find(a => a.id === rollTest.secondary_attribute);
    const ability = AbilityRepository.getItem(rollTest.ability);

    const data = {
      name: rollTest.name,
      itemName: item.name,
      primaryAttributeLabel: primaryAttr ? localize(primaryAttr.label.replace('S0.', '')) : null,
      secondaryAttributeLabel: secondaryAttr ? localize(secondaryAttr.label.replace('S0.', '')) : null,
      abilityLabel: ability ? localize(ability.label.replace('S0.', '')) : null,
      bonus: rollTest.bonus || 0,
      automatic: rollTest.automatic || 0,
      difficulty: rollTest.difficulty || 0,
      specialistLabel: rollTest.specialist ? gameLocalize('Yes') : gameLocalize('No'),
      critic: rollTest.critic || 0,
    };

    const messageContent = await RollTestMessageCreator.mountContent(data);
    ChatCreator.sendToChat(actor, messageContent);
  }

  static async view(item, event) {
    const rollTest = this.#getItemRollTest(item, this.#getItemRollTestId(event));
    if (!rollTest) {
      return;
    }
    CreateRollableTestDialog.view(rollTest, item.actor, MacroTypesEnum.EQUIPAMENTO);
  }

  static #getItemRollTestId(event) {
    return event.currentTarget.dataset.itemId;
  }

  static #getItemRollTest(item, rollId) {
    return this.#getItemTests(item).find(test => test.id == rollId);
  }

  static #getItemTests(item) {
    return [...getObject(item, EquipmentCharacteristicType.POSSIBLE_TESTS)] || [];
  }
}
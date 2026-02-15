import { getObject, labelError } from "../../utils/utils.mjs";
import { EquipmentCharacteristicType } from "../../enums/equipment-enums.mjs";
import { AbilityRepository } from "../../repository/ability-repository.mjs";
import { EquipmentUtils } from "../equipment/equipment-utils.mjs";
import { NpcUtils } from "../npc/npc-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollSimplified {
  static async rollByAmount(actor, params) {
    const modifiersInformations = {
      isHalf: false,
      bonus: 0,
      penalty: 0,
    }
    return await this.#rollDices(actor, params.value, modifiersInformations);
  }

  static async roll(actor, params) {
    const modifiersInformations = this.#mountModifiersInfo(params);
    const abilityInfo = this.#mountAbilityInfo(params.skillName);
    const rolledDices = await this.#rollDices(actor, params.value, modifiersInformations);

    const rollInformation = {
      resultRoll: rolledDices,
      abilityInfo: abilityInfo,
      modifiers: modifiersInformations,
      difficulty: Number(params.difficulty),
      critic: Number(params.critic),
      mode: params.chatSelect,
    };

    return rollInformation;
  }

  static #mountModifiersInfo(params) {
    return {
      specialist: Boolean(params.specialist == 'on' || params.specialist),
      bonus: Number(params.bonus),
      penalty: Number(params.penalty),
      isHalf: Boolean(params.isHalf == 'on' || params.isHalf),
      automatic: Number(params.automatic),
      weapon: params.weapon,
    };
  }

  static #mountAbilityInfo(skillName) {
    return {
      skill: skillName,
      label: AbilityRepository.getItem(skillName)?.label || labelError(),
    };
  }

  static async #rollDices(actor, value, modifiersInformations) {
    const halfDiceAmount = Math.floor(value / 2);
    const adjustedForHalf = modifiersInformations.isHalf ? halfDiceAmount : value;
    const finalValue = Math.max(adjustedForHalf + modifiersInformations.bonus - modifiersInformations.penalty, 0);

    const rolledDices = await CoreRollMethods.rollDiceAmountWithOverload(actor, finalValue);
    return rolledDices;
  }

  static async rollByEquipment(actor, equipmentInfoRoll) {
    const { item, rollTest, value, skillName, isHalf } = equipmentInfoRoll;

    let itemBonus = 0;
    let itemAutomatic = 0;
    if (EquipmentUtils.isWeapon(item)) {
      itemBonus = getObject(item, EquipmentCharacteristicType.DAMAGE) || 0;
      itemAutomatic = getObject(item, EquipmentCharacteristicType.TRUE_DAMAGE) || 0;
    }

    const parsedEquipmentRoll = {
      value: value,
      skillName: skillName,
      penalty: NpcUtils.calculatePenalty(actor),
      isHalf: isHalf,
      specialist: rollTest.specialist,
      bonus: rollTest.bonus + itemBonus,
      automatic: rollTest.automatic + itemAutomatic,
      weapon: EquipmentUtils.getItemRollInformation(item),
      difficulty: rollTest.difficulty,
      critic: rollTest.critic,
    };

    const resultRoll = await this.roll(actor, parsedEquipmentRoll);

    return {
      name: `${item.name}: ${rollTest.name}`,
      ...resultRoll,
    }
  }
}
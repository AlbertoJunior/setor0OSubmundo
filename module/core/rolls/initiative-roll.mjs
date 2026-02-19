import { ActorType } from "../../enums/characteristic-enums.mjs";
import { ActorUtils } from "../actor/actor-utils.mjs";
import { NpcUtils } from "../npc/npc-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class RollInitiative {
  static async roll(actor) {
    const initiative = this.#getInitiativeBonus(actor);
    const resultRoll = await CoreRollMethods.rollDice(1);
    const value = resultRoll.values[0];
    return {
      initiative: initiative,
      value: value,
      total: initiative + value,
      roll: resultRoll.roll,
      values: resultRoll.values,
    }
  }

  static #getInitiativeBonus(actor) {
    const actorType = actor.type;
    if (actorType == ActorType.PLAYER) {
      return ActorUtils.calculateInitiative(actor);
    } else if (actorType == ActorType.NPC) {
      return NpcUtils.calculateInitiative(actor);
    } else {
      return 0;
    }
  }
}
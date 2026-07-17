export class RollUtils {
  static isOverloadRoll(roll) {
    return roll.options?.isOverload === true || roll.flags?.setor0OSubmundo?.isOverload === true;
  }
}

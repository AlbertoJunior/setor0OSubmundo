import { SYSTEM_ID } from "../constants.mjs";

export class FlagsUtils {
  static getActorFlag(actor, flag, defaultValue) {
    const value = actor.getFlag(SYSTEM_ID, flag);
    if (defaultValue != undefined && defaultValue != null) {
      return value ?? defaultValue
    }
    return value;
  }

  static async setItemFlag(item, flag, value) {
    await item.setFlag(SYSTEM_ID, flag, value);
  }

  static getItemFlag(item, flag, defaultValue) {
    const flagValue = (typeof item.getFlag === 'function')
      ? item.getFlag(SYSTEM_ID, flag)
      : item?.flags?.[SYSTEM_ID]?.[flag];

    return flagValue ?? defaultValue;
  }

  static getSystemFlag(item, flag) {
    return item?.flags?.[SYSTEM_ID]?.[flag]
  }
}
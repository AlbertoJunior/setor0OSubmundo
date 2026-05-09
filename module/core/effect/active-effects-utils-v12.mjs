import { SYSTEM_ID } from "../../constants.mjs";
import { ActiveEffectsFlags } from "../../enums/active-effects-enums.mjs";

/**
 * @deprecated Utilitário legado para compatibilidade com o Foundry V12.
 * Será removido na V15 quando o suporte a V12 for totalmente encerrado e a V13 for a mínima suportada.
 */
export class ActiveEffectsUtilsV12 {

  static getFlags(activeEffect) {
    return activeEffect.flags[SYSTEM_ID] || {};
  }

  static getOriginId(activeEffect) {
    return this.getFlags(activeEffect)[ActiveEffectsFlags.ORIGIN_ID];
  }

  static getOriginType(activeEffect) {
    return this.getFlags(activeEffect)[ActiveEffectsFlags.ORIGIN_TYPE];
  }

  static getType(activeEffect) {
    return this.getFlags(activeEffect)[ActiveEffectsFlags.TYPE];
  }

  static canRemoveEffect(activeEffect) {
    return this.getFlags(activeEffect)[ActiveEffectsFlags.CAN_REMOVE] ?? true;
  }
}

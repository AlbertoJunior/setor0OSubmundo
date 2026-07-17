import { SYSTEM_ID } from "../../constants.mjs";
import { SocketUtils } from "./socket-utils.mjs";
import { SocketEvent } from "../../enums/socket-enums.mjs";

export class SocketHandler {
  static SOCKET_NAME = `system.${SYSTEM_ID}`;

  static #actions = {
    [SocketEvent.SHOW_DOCUMENT]: SocketUtils.handleShowDocument
  };

  static init() {
    console.log(`=> Setor 0 - O Submundo | Iniciando Socket Handler (${SocketHandler.SOCKET_NAME})`);
    game.socket.on(SocketHandler.SOCKET_NAME, SocketHandler._onMessage);
  }

  static async _onMessage(data) {
    console.log("=> Setor 0 - O Submundo | Socket Event Received:", data);
    if (!data || !data.action) return;

    const handler = SocketHandler.#actions[data.action];
    if (handler) {
      await handler(data);
    }
  }

  static emit(action, payload) {
    game.socket.emit(SocketHandler.SOCKET_NAME, {
      action: action,
      ...payload
    });
  }
}

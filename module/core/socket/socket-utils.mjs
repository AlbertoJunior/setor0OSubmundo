import { ShareDocumentDialog } from "../../creators/dialog/share-document-dialog.mjs";
import { localize } from "../../utils/utils.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { SocketEvent } from "../../enums/socket-enums.mjs";

export class SocketUtils {

  static get shareDocumentActions() {
    return [
      {
        id: "showPlayers",
        enabled: () => game.user.isGM,
        icon: "fas fa-eye",
        label: "SOCKET.SHOW_PLAYERS",
        action: function () {
          SocketUtils.showDocumentToPlayers(this.document.uuid);
        }
      },
      {
        id: "showTo",
        enabled: () => true,
        icon: "fas fa-users",
        label: "SOCKET.SHOW_TO",
        action: function () {
          SocketUtils.showDocumentToSpecificUsers(this.document.uuid);
        }
      }
    ];
  }

  static async handleShowDocument(data) {
    if (!data.uuid) return;

    if (data.users && !data.users.includes(game.user.id)) return;

    try {
      const doc = await fromUuid(data.uuid);
      if (doc) doc.sheet.render(true);
    } catch (err) {
      console.warn("Setor 0 - O Submundo | Erro ao carregar o documento compartilhado", err);
    }
  }

  static async showDocumentToPlayers(uuid) {
    const { SocketHandler } = await import("./socket-handler.mjs");
    SocketHandler.emit(SocketEvent.SHOW_DOCUMENT, { uuid: uuid });
    NotificationsUtils.info(localize("SOCKET.SHARED_WITH_ALL_PLAYERS"));
  }

  static async showDocumentToSpecificUsers(uuid) {
    await ShareDocumentDialog.create(uuid);
  }
}

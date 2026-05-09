import { ShareDocumentDialog } from "../../creators/dialog/share-document-dialog.mjs";
import { localize } from "../../utils/utils.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";

export class SocketUtils {

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
    SocketHandler.emit("showDocument", { uuid: uuid });
    NotificationsUtils.info(localize("SOCKET.SHARED_WITH_ALL_PLAYERS"));
  }

  static async showDocumentToSpecificUsers(uuid) {
    await ShareDocumentDialog.create(uuid);
  }
}

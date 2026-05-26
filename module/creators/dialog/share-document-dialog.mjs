import { FoundryApi } from "../../api/foundry-api.mjs";
import { SocketEvent } from "../../enums/socket-enums.mjs";
import { localize, gameLocalize } from "../../utils/utils.mjs";
import { NotificationsUtils } from "../message/notifications.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";

export class ShareDocumentDialog {
  static async create(uuid) {
    const doc = await fromUuid(uuid);
    if (!doc) {
      NotificationsUtils.warn(localize("SOCKET.DOCUMENT_NOT_FOUND"));
      return;
    }

    const activeUsers = game.users.filter(u => u.active && u.id !== game.user.id);
    const selectableUsers = activeUsers;

    if (selectableUsers.length === 0) {
      NotificationsUtils.warn(localize("SOCKET.NO_USERS_ONLINE"));
      return;
    }

    const data = {
      isGM: game.user.isGM,
      selectableUsers: selectableUsers.map(user => {
        const permissionLevel = doc.getUserLevel(user);
        let icon = "";
        let title = "";
        let iconClass = "";

        if (permissionLevel >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
          icon = "fas fa-crown";
          title = gameLocalize("OWNERSHIP.OWNER");
        } else if (permissionLevel === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
          icon = "fas fa-eye";
          title = gameLocalize("OWNERSHIP.OBSERVER");
        } else if (permissionLevel === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) {
          icon = "fas fa-eye-slash";
          title = gameLocalize("OWNERSHIP.LIMITED");
        } else {
          icon = "fas fa-ban";
          title = gameLocalize("OWNERSHIP.NONE");
          iconClass = "S0-debuff-color";
        }

        return {
          id: user.id,
          name: user.name,
          isGM: user.isGM,
          title: title,
          icon: icon,
          iconClass: iconClass
        };
      })
    };

    const content = await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/dialog/share-document.hbs`, data);

    const dialogData = {
      title: localize("SOCKET.SHARE_DOCUMENT_TITLE"),
      content: content,
      buttons: [
        {
          label: localize("Cancelar"),
          onClick: () => { }
        },
        {
          label: localize("Confirmar"),
          default: true,
          onClick: async (html) => {
            const form = html.querySelector("form");
            const formData = new FormData(form);
            const selectedUsers = formData.getAll("users");

            if (selectedUsers.length > 0) {
              const { SocketHandler } = await import("../../core/socket/socket-handler.mjs");
              SocketHandler.emit(SocketEvent.SHOW_DOCUMENT, { uuid: uuid, users: selectedUsers });
              NotificationsUtils.info(localize("SOCKET.SHARED_SUCCESS"));
            }
          }
        }
      ]
    };

    await FoundryApi.createDialog(dialogData, { width: 300 });
  }
}

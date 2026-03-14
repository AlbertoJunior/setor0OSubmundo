import { FoundryApi } from "../api/foundry-api.mjs";
import { SYSTEM_ID, COLORS } from "../constants.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";

export class FolderUtils {
  static async getOrCreateMacroFolder(folderName) {
    if (!folderName) {
      throw new Error("Nome da pasta não especificado.");
    }

    let folder = game.folders.find(f => f.name === folderName && f.type === "Macro");
    if (!folder) {
      folder = await FoundryApi.Documents.Folder.create({
        name: folderName,
        type: "Macro",
        color: this.getFolderColor(folderName)
      });
    }
    return folder;
  }

  static async getCharacterMacroFolderId(actor) {
    const playersFolder = await FolderUtils.#getOrCreatePlayersFolder("Macro");
    return await FolderUtils.#getOrCreateCharacterFolder(actor, playersFolder, "Macro");
  }

  static async getCharacterJournalFolderId(actor) {
    const playersFolder = await FolderUtils.#getOrCreatePlayersFolder("Journal");
    return await FolderUtils.#getOrCreateCharacterFolder(actor, playersFolder, "Journal");
  }

  static async #getOrCreatePlayersFolder(type) {
    if (!type) {
      throw new Error("Tipo de pasta não especificado.");
    }

    let playersFolder = game.folders.find(f => f.type === type && f.name === "Jogadores");
    if (!playersFolder) {
      playersFolder = await FoundryApi.Documents.Folder.create({
        name: "Jogadores",
        type: type
      });
    }
    return playersFolder;
  }

  static async #getOrCreateCharacterFolder(actor, playersFolder, type) {
    if (!type) {
      throw new Error("Tipo de pasta não especificado.");
    }

    let characterFolder = game.folders.find(f =>
      f.type === type &&
      f.folder?.id === playersFolder.id &&
      f.flags?.[SYSTEM_ID]?.[SystemFlags.CHARACTER.ID] === actor.id
    );

    if (!characterFolder) {
      characterFolder = await FoundryApi.Documents.Folder.create({
        name: actor.name,
        type: type,
        folder: playersFolder.id,
        color: this.getFolderColor(),
        flags: {
          [SYSTEM_ID]: {
            [SystemFlags.CHARACTER.ID]: actor.id
          }
        },
        ownership: {
          [game.user.id]: 3,
          default: 0
        }
      });
    }
    return characterFolder.id;
  }

  static getFolderColor(role = "") {
    const safeRole = typeof role === "string" ? role : "";
    const upperRole = safeRole.toUpperCase();

    switch (upperRole) {
      case "GM":
        return COLORS.BASE.red;
      case "USER":
        return COLORS.BASE.blue;
      default:
        return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
    }
  }
}

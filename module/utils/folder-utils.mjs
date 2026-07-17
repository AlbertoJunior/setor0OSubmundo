import { FoundryApi } from "../api/foundry-api.mjs";
import { SYSTEM_ID, COLORS } from "../constants.mjs";
import { SystemFlags } from "../enums/flags-enums.mjs";
import { MacroRoleEnum } from "../enums/macro-enums.mjs";

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

  static async getGmFolderId(type = "Macro") {
    let gmFolder = game.folders.find(f => f.type === type && f.name === MacroRoleEnum.GM);
    if (!gmFolder) {
      gmFolder = await FoundryApi.Documents.Folder.create({
        name: MacroRoleEnum.GM,
        type: type,
        color: this.getFolderColor(MacroRoleEnum.GM)
      });
    }
    return gmFolder.id;
  }

  static async getPlayersFolderId(type = "Macro") {
    const folder = await this.#getOrCreatePlayersFolder(type);
    return folder.id;
  }

  static async getCharacterMacroFolderId(actor, subFolderName) {
    const playersFolder = await FolderUtils.#getOrCreatePlayersFolder("Macro");
    const characterFolderId = await FolderUtils.#getOrCreateCharacterFolder(actor, playersFolder, "Macro");

    if (subFolderName) {
      return await FolderUtils.#getOrCreateSubFolder(subFolderName, characterFolderId, "Macro");
    }

    return characterFolderId;
  }

  static async getCharacterJournalFolderId(actor) {
    const playersFolder = await FolderUtils.#getOrCreatePlayersFolder("Journal");
    return await FolderUtils.#getOrCreateCharacterFolder(actor, playersFolder, "Journal");
  }

  static async #getOrCreatePlayersFolder(type) {
    if (!type) {
      throw new Error("Tipo de pasta não especificado.");
    }

    let playersFolder = game.folders.find(f => f.type === type && f.name === MacroRoleEnum.PLAYERS);
    if (!playersFolder) {
      playersFolder = await FoundryApi.Documents.Folder.create({
        name: MacroRoleEnum.PLAYERS,
        type: type,
        color: this.getFolderColor(MacroRoleEnum.PLAYERS)
      });
    }
    return playersFolder;
  }

  static async #getOrCreateCharacterFolder(actor, playersFolder, type) {
    if (!type) {
      throw new Error("Tipo de pasta não especificado.");
    }
    if (!actor || !actor.name) {
      throw new Error("Ator inválido ou sem nome.");
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

  static async #getOrCreateSubFolder(subFolderName, parentFolderId, type) {
    if (!subFolderName || !parentFolderId || !type) {
      throw new Error("Parâmetros incompletos para subpasta.");
    }

    let subFolder = game.folders.find(f => f.type === type && f.name === subFolderName && f.folder?.id === parentFolderId);
    if (!subFolder) {
      subFolder = await FoundryApi.Documents.Folder.create({
        name: subFolderName,
        type: type,
        folder: parentFolderId,
        color: this.getFolderColor()
      });
    }
    return subFolder.id;
  }

  static getFolderColor(role = "") {
    const safeRole = typeof role === "string" ? role : "";
    const upperRole = safeRole.toUpperCase();

    switch (upperRole) {
      case SystemFlags.ROLE.GM.toUpperCase():
      case MacroRoleEnum.GM.toUpperCase():
        return COLORS.BASE.red;
      case SystemFlags.ROLE.USER.toUpperCase():
      case MacroRoleEnum.PLAYERS.toUpperCase():
        return COLORS.BASE.blue;
      default:
        return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
    }
  }
}

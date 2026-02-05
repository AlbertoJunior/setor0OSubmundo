import { FoundryApi } from "../../api/foundry-api.mjs";
import { SYSTEM_FLAGS, SYSTEM_ID } from "../../constants.mjs";
import { FlagsUtils } from "../../utils/flags-utils.mjs";

export class CompendiumSync {
  static async clear() {
    if (!game.user.isGM) {
      ui.notifications.error("Apenas o GM pode apagar pastas.");
      return;
    }

    const deleteFolders = async (folders) => {
      const sorted = folders.sort((a, b) => b.depth - a.depth);
      for (const folder of sorted) await folder.delete();
      return sorted.length;
    };

    const deleteDocuments = async (docs) => {
      let count = 0;
      for (const doc of docs) {
        try {
          await doc.delete();
          count++;
        } catch (err) {
          console.warn(`Erro ao apagar documento ${doc.name || doc.id}`, err);
        }
      }
      return count;
    };

    let totalFolders = 0;
    let totalDocs = 0;

    // ===== Compêndios =====
    for (const pack of game.packs) {
      try {
        // Destrava se necessário
        const wasLocked = pack.locked;
        if (wasLocked) await pack.configure({ locked: false });

        // Pastas do compêndio
        if (pack.folders) {
          totalFolders += await deleteFolders(pack.folders.contents);
        }

        // Documentos do compêndio
        const docs = await pack.getDocuments();
        totalDocs += await deleteDocuments(docs);

        // Reaplica lock
        if (wasLocked) await pack.configure({ locked: true });
      } catch (err) {
        console.error(`Erro no compêndio ${pack.collection}`, err);
        ui.notifications.warn(`Erro ao limpar ${pack.collection}`);
      }
    }

    // ===== Mundo =====
    totalFolders += await deleteFolders(game.folders.contents);

    ui.notifications.info(`Pastas apagadas: ${totalFolders}`);
    ui.notifications.info(`Objetos apagados: ${totalDocs}`);
  }

  static async syncDefaultCompendiums() {
    const packsBase = `systems/${SYSTEM_ID}/packs/src`;

    const browseResult = await FoundryApi.Apps.FilePicker.browse("data", packsBase);
    const toDeleteTemp = [];

    for (const packFolderPath of browseResult.dirs) {
      const packName = packFolderPath.split("/").pop();
      const packId = `${SYSTEM_ID}.${packName}`;
      const pack = game.packs.get(packId);

      if (!pack) {
        console.warn(`Compêndio não encontrado [${packName}]`);
        continue
      }

      const jsonFile = await this.#getJson(packFolderPath);
      if (!jsonFile) {
        continue
      }

      const data = await this.#loadJson(jsonFile);
      if (!data.elements.length) {
        continue
      }

      const wasLocked = pack.locked;
      if (wasLocked) {
        await pack.configure({ locked: false });
      }

      const foldersId = await this.#verifyAndCreateFolders(pack, data.folders);

      const filteredData = this.#filterCompendiumItems(pack, data);
      for (const itemData of filteredData) {
        try {
          const parentFolder = itemData.folder;
          if (parentFolder) {
            const parentFolderNewId = foldersId.get(parentFolder);
            itemData.folder = parentFolderNewId;
          }
          const tempDocument = await pack.documentClass.create(itemData);
          await pack.importDocument(tempDocument);
          toDeleteTemp.push(tempDocument)
        } catch (e) {
          console.error(`Erro ao importar ${itemData.name} para ${packId}:`, e);
        }
      }

      if (wasLocked) {
        await pack.configure({ locked: true });
      }

      console.log(`✅ Pack ${packName} sincronizado: ${data.length} itens importados`);
    }

    await FoundryApi.deleteFoldersInWorld(toDeleteTemp);

    console.log("🎉 Todos os compêndios da pasta packs/src foram sincronizados!");
  }

  static async #getJson(folderPath) {
    const folderFiles = await FoundryApi.Apps.FilePicker.browse("data", folderPath);
    return folderFiles.files.find(f => f.endsWith(".json"));
  }

  static async #loadJson(jsonFile) {
    const response = await fetch(jsonFile);
    const data = await response.json();
    return data;
  }

  static async #verifyAndCreateFolders(pack, folders) {
    const toDelete = [];
    folders = folders.sort((a, b) => {
      if (!a.folder && b.folder) return -1;
      if (a.folder && !b.folder) return 1;
      return 0;
    });

    const mapperId = new Map();

    for (const folder of folders) {
      const packFolder = pack.folders.find(f => f.name === folder.name && f.type === folder.type);
      if (!packFolder) {
        const parentFolder = folder.folder;
        if (parentFolder) {
          const parentFolderNewId = mapperId.get(parentFolder);
          folder.folder = parentFolderNewId;
        }

        const folderDocument = await FoundryApi.Documents.Folder.create(folder);
        mapperId.set(folder._id, folderDocument._id);
        await pack.importFolder(folderDocument);
        toDelete.push(folderDocument);
      }
    }

    await FoundryApi.deleteFoldersInWorld(toDelete);
    return mapperId;
  }

  static #filterCompendiumItems(pack, data) {
    const inPackItems = pack.contents.map(item => FlagsUtils.getSystemFlag(item, SYSTEM_FLAGS.SOURCE_ID)).filter(i => Boolean(i));
    const filteredData = data.elements.filter(item => !inPackItems.includes(FlagsUtils.getSystemFlag(item, SYSTEM_FLAGS.SOURCE_ID)));
    return filteredData;
  }
}

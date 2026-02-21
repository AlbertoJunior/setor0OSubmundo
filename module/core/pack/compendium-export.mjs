import { SYSTEM_FLAGS, SYSTEM_ID } from "../../constants.mjs";
import { logTable } from "../../utils/utils.mjs";

export class CompendiumExport {
  static async exportCompendiumsToJson() {
    if (!window.JSZip) {
      console.warn("JSZip não encontrado, tente: await import(\"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js\")");
      //await import("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js")
      return
    }

    const zip = new JSZip();

    const systemPacks = game.packs.filter(p => p.metadata.system === SYSTEM_ID);

    const result = [];

    for (const pack of systemPacks) {
      const typeName = pack.documentName;

      try {
        const mappedItems = pack.contents.map(item => this.#mountItemToExport(item));

        let stats = {};
        if (pack.contents.size > 0 || pack.contents.length > 0) {
          const firstItem = pack.contents.values().next().value;
          stats = firstItem._stats || {};
          stats = {
            coreVersion: stats.coreVersion,
            systemId: stats.systemId,
            modifiedTime: stats.modifiedTime,
            lastModifiedBy: stats.lastModifiedBy
          };
        }

        const mappedFolders = (pack.folders.contents ?? pack.folders).map(folder => this.#mountFolderToExport(folder));

        const compendium = {
          title: pack.title,
          banner: pack.banner,
          documentName: pack.documentName,
          stats: stats,
          sortingMode: pack.sortingMode,
          elements: mappedItems,
          folders: mappedFolders,
        }

        const typeNameJson = `${typeName}.json`;

        const folder = zip.folder(pack.metadata.name);
        folder.file(typeNameJson, JSON.stringify(compendium, null, 2));
        result.push({ Pack: pack.title, Status: `✅ Adicionado: ${pack.metadata.name}/${typeNameJson}` });
      } catch (error) {
        result.push({
          Pack: pack.title,
          Status: `❌ Não adicionado: ${pack.metadata.name}/${typeName}`,
          error: error
        });
      }
    }

    // Gera o ZIP
    const content = await zip.generateAsync({ type: "blob" });

    // Salva ZIP no navegador
    const fileName = `${SYSTEM_ID}-packs.zip`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = fileName;
    a.click();
    a.remove()

    logTable(`Compêndios Exportados para ${fileName}`, result);
  }

  static #mountItemToExport(item) {
    const jsonItem = item.toObject ? item.toObject() : { ...item };
    const baseFlags = jsonItem.flags ?? {};
    const systemFlags = baseFlags[SYSTEM_ID] ?? {};
    const sourceId = systemFlags[SYSTEM_FLAGS.SOURCE_ID] ?? jsonItem._id;

    delete jsonItem._stats;

    return {
      ...jsonItem,
      folder: item?.folder?._id,
      flags: {
        ...baseFlags,
        [SYSTEM_ID]: {
          ...systemFlags,
          [SYSTEM_FLAGS.SOURCE_ID]: sourceId
        }
      }
    };
  }

  static #mountFolderToExport(folder) {
    const jsonFolder = folder.toObject ? folder.toObject() : { ...folder };
    delete jsonFolder._stats;
    return jsonFolder;
  }
}
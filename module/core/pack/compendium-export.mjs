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

    const result = []

    for (const pack of systemPacks) {
      try {
        const mappedItems = pack.contents.map(this.#mountItemToExport);
        const compendium = {
          title: pack.title,
          banner: pack.banner,
          documentName: pack.documentName,
          elements: mappedItems,
          folders: pack.folders,
          sortingMode: pack.sortingMode,
        }

        const typeName = `${pack.documentName}.json`;

        const folder = zip.folder(pack.metadata.name);
        folder.file(typeName, JSON.stringify(compendium, null, 2));
        result.push({ Pack: pack.title, Status: `✅ Adicionado: ${pack.metadata.name}/${typeName}` });
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
    const baseFlags = item.flags ?? {};
    const systemFlags = baseFlags[SYSTEM_ID] ?? {};
    const sourceId = systemFlags[SYSTEM_FLAGS.SOURCE_ID] ?? item._id;

    return {
      ...item,
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
}
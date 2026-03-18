import { SYSTEM_CLASS_CSS } from "../constants.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";
import { snakeToCamel } from "./utils.mjs";

export class DialogUtils {

  static showArtWork(title, imgPath, shareable, uuid) {
    new FoundryApi.ImagePopout({
      src: imgPath,
      window: {
        title: title || "Título da Imagem"
      },
      classes: [SYSTEM_CLASS_CSS, 'S0-no-padding'],
      shareable: shareable || false,
      uuid: uuid,
    }).render(true);
  }

  static getDialogFormData(html) {
    try {
      // If html is the form itself, use it. Otherwise find the last form within it.
      const form = html.tagName === 'FORM' ? html : html.querySelector('form:last-of-type') || html.querySelector('form');
      if (!form) {
        console.warn("[getDialogFormData] Nenhum formulário encontrado no HTML fornecido.");
        return {};
      }
      const formData = new FormData(form);
      const data = snakeToCamel(formData.entries());
      return data;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}
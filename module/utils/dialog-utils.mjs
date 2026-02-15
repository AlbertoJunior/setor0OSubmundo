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
      const forms = html[0].querySelectorAll('form');
      const form = forms[forms.length - 1];
      const formData = new FormData(form);
      const data = snakeToCamel(formData.entries());
      return data;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}
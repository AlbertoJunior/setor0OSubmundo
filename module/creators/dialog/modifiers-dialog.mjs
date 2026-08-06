import { CreateFormDialog } from "./create-dialog.mjs";
import { localize } from "../../utils/utils.mjs";

export class ModifiersDialog {
  static open(options) {
    return CreateFormDialog.open(
      localize("Modificadores"),
      "rolls/modifiers",
      options
    );
  }
}

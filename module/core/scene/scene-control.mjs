import { TODO } from "../../../scripts/utils/utils.mjs";
import { FoundryApi } from "../../utils/foundry-api.mjs";

/** Depreciado */
class Setor0SceneControls extends FoundryApi.SceneControls {
    // _onClickLayer(event) {
    //     debugger
    //     const layerName = event.currentTarget.dataset.canvasLayer;
    //     if (!layerName) {
    //         const controlName = event.currentTarget.dataset.control;
    //         const control = ui.controls.controls.find(i => i.name == controlName);
    //         if (control) {
    //             ui.controls.initialize({ control: control.name, layer: null, tool: control.tools[0] });
    //         }
    //     } else {
    //         super._onClickLayer(event);
    //     }
    // }
}

export function configureSetor0SceneControl() {
    TODO('verificar se vou apagar tudo isso')
    ui.controls = Setor0SceneControls;
    // ui.controls.render(true);
}
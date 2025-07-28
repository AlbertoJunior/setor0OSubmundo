import { DEPRECATED } from "../../utils/utils.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

class Setor0SceneControls extends FoundryApi.SceneControls {
    constructor() {
        DEPRECATED('Setor0SceneControls');
    }

    // _onClickLayer(event) {
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

// export function configureSetor0SceneControl() {
// ui.controls = Setor0SceneControls;
// ui.controls.render(true);
// }
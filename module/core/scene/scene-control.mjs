import { FoundryApi } from "../../utils/foundry-api.mjs";

class MySceneControls extends FoundryApi.SceneControls {
    _onClickLayer(event) {
        const layerName = event.currentTarget.dataset.canvasLayer;
        if (!layerName) {
            const controlName = event.currentTarget.dataset.control;
            const control = ui.controls.controls.find(i => i.name == controlName);
            if (control) {
                ui.controls.initialize({ control: control.name, layer: null, tool: control.tools[0] });
            }
        } else {
            super._onClickLayer(event);
        }
    }
}

export function configureSetor0SceneControl() {
    ui.controls = new MySceneControls();
    ui.controls.render(true);
}
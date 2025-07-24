import { gameLocalize, localize } from "../../../scripts/utils/utils.mjs";

export class Setor0TokenDocument extends CONFIG.Token.documentClass {
    static #mappedLabel = new Map();

    static setValuesOnMapped(values = []) {
        const isValid = value => value && value.trim() !== '';

        values.forEach(({ id, label }) => {
            if (isValid(id) && isValid(label)) {
                this.#mappedLabel.set(id, label);
            }
        });
    }

    static getTrackedAttributeChoices(attributes) {
        const barGroup = gameLocalize("TOKEN.BarAttributes");
        const valueGroup = gameLocalize("TOKEN.BarValues");

        const preset = super.getTrackedAttributeChoices(attributes);
        const mappedItems = preset.map(item => {
            const itemLabel = item.label.replace('.value', '');
            return {
                group: item.group,
                value: item.value,
                label: this.#mappedLabel.has(itemLabel) ? localize(this.#mappedLabel.get(itemLabel)) : itemLabel
            }
        }).sort((a, b) => {
            if (a.group == b.group) {
                return a.label.compare(b.label);
            } else if (a.group == barGroup) {
                return -1
            } else if (a.group == valueGroup) {
                return 1
            } else {
                return a.label.compare(b.label);
            }
        });

        return mappedItems;
    }
}

export async function configureSetor0TokenDocument() {
    CONFIG.Token.documentClass = Setor0TokenDocument;
}
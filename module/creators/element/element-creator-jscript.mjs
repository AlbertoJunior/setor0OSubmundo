import { localize } from "../../utils/utils.mjs";

export function createEmptyOption() {
    return createOption('', '');
}

export function createOption(value, textContent, data) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = textContent;
    if (data) {
        Object.entries(data).forEach(([key, value]) => {
            option.dataset[key] = value;
        });
    }
    return option;
}

export function createOptionGroup(label) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = label;
    return optGroup;
}

export function createOptionsAndSetOnSelects(selects = [], options = []) {
    selects.forEach(select => {
        select.innerHTML = '';
        select.appendChild(createEmptyOption());

        const groups = new Map();

        options.forEach(({ id, name, level }) => {
            if (!groups.has(level)) {
                groups.set(level, createOptionGroup(`${localize('Nivel')}: ${level}`));
            }

            const group = groups.get(level);
            group.appendChild(createOption(id, name));
        });

        [...groups.entries()]
            .sort(([a], [b]) => a - b)
            .forEach(([, group]) => select.appendChild(group));
    });
}

export function createLi(textContent, options = {}) {
    const li = document.createElement("li");
    li.classList = options?.classList || '';

    if (options.icon) {
        const icon = createIcon(options.icon);
        if (icon) {
            li.appendChild(icon);
        }
    }

    if (options.title) {
        li.title = options.title;
    }

    if (textContent) {
        const text = document.createTextNode(textContent);
        li.appendChild(text);
    }
    return li;
}

export function createIcon(options = {}) {
    const iconClass = options.class;
    if (!iconClass) {
        return;
    }

    const i = document.createElement("i");
    i.classList = iconClass;

    const optionsKeys = Object.keys(options).filter(key => key !== 'class');
    for (const key of optionsKeys) {
        i.style[key] = options[key];
    }

    return i;
}

export function createA(textContent, options = {}) {
    const element = document.createElement('a');

    if (options.class) {
        element.classList = options.class;
    }

    if (options.icon) {
        const icon = createIcon(options.icon);
        if (icon) {
            element.appendChild(icon);
        }
    }

    if (textContent) {
        element.appendChild(document.createTextNode(textContent));
    }
    return element;
}
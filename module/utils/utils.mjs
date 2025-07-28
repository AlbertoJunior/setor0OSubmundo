import { NotificationsUtils } from "../creators/message/notifications.mjs";

function containClass(element, cls) {
    return element.classList.contains(cls);
}

function isCharacteristic(element) {
    return containClass(element, 'S0-characteristic') || containClass(element, 'S0-characteristic-6') || containClass(element, 'S0-characteristic-temp');
}

export function selectCharacteristic(element) {
    if (!element) {
        return;
    }

    if (!isCharacteristic(element)) {
        return;
    }

    element.classList.toggle('S0-selected');

    let next = element.nextElementSibling;
    while (next) {
        if (isCharacteristic(next)) {
            next.classList.remove('S0-selected');
        }
        next = next.nextElementSibling;
    }

    let before = element.previousElementSibling;
    while (before) {
        if (isCharacteristic(before)) {
            before.classList.add('S0-selected');
        }
        before = before.previousElementSibling;
    }

    element.blur();
}

export function selectCharacteristicAndReturnLength(element) {
    selectCharacteristic(element);
    const value = element.parentElement.querySelectorAll('.S0-selected').length;
    return value;
}

export function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export function toKeyLang(key) {
    const removeUnderscore = key.replaceAll('_', ' ');
    const toTitle = toTitleCase(removeUnderscore);
    return toTitle.replaceAll(' ', '_');
}

export function keyJsonToKeyLang(key) {
    const langKey = toKeyLang(key);
    return `S0.${langKey}`;
}

export function gameLocalize(key) {
    return game.i18n.localize(key);
}

export function localize(key) {
    return game.i18n.localize(`S0.${key}`);
}

export function localizeType(key) {
    return game.i18n.localize(`TYPES.${key}`);
}

export function localizeFormat(key, data, prefix = 'S0') {
    return game.i18n.format(`${prefix}.${key}`, data);
}

export function labelError() {
    return `<${localize('Erro')}>`;
}

export function onArrayRemove(array, item) {
    const indexToRemove = array.indexOf(item);
    if (indexToRemove !== -1) {
        array.splice(indexToRemove, 1);
        return true;
    }
    return false;
}

export function TODO(message, notify) {
    console.warn(`-> ${message}`);
    if (notify) {
        NotificationsUtils.info(message);
    }
}

export function DEPRECATED(className, classMethod) {
    console.warn(`-> ${className}${classMethod ? `.${classMethod}` : ''}`);
}

export function getObject(object, path) {
    let pathHaveSystem = path;
    if (path.system) {
        pathHaveSystem = path.system;
    }

    return pathHaveSystem.split('.').reduce((acc, key) => acc && acc[key], object);
}

export function randomId(maxString) {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10);
    const finalId = id.replaceAll('-', '');

    if (typeof maxString == 'number' && maxString > 0) {
        return finalId.substring(0, maxString);
    }
    return finalId;
}

export function convertToCollection(items) {
    return new foundry.utils.Collection(items.map(item => [item.id, item]));
}

export function snakeToCamel(entries) {
    const camelCaseData = {};
    for (const [key, value] of entries) {
        const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
        camelCaseData[camelKey] = value;
    }
    return camelCaseData;
}

export function normalizeString(str) {
    return str.replace(/\s+/g, ' ').trim();
}

export function logTable(title, table) {
    console.log(`---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----\n-> ${title}`);
    console.table(table);

    const errors = Object.values(table).filter(result => result.error != null);
    if (errors.length > 0) {
        for (const resultWithError of errors) {
            console.error(resultWithError.error);
        }
    }

    console.log('---> ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- <---');
}
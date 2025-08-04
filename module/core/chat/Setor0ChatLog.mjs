import { FoundryApi } from "../../api/foundry-api.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { MessageRepository } from "../../repository/message-repository.mjs";
import { localize, TODO } from "../../utils/utils.mjs";
import { RollPerseverance } from "../rolls/perseverance-roll.mjs";

class Setor0ChatLog extends FoundryApi.ChatLog {
    static DEFAULT_OPTIONS = {
        actions: {
            [OnEventType.VIEW]: this.#view,
            [OnEventType.CHECK]: this.#check,
        }
    };

    static #viewMap = {
        'toggle-tooltip': async (target, message) => {

        }
    };

    static #checkMap = {
        'consciousness': async (target, message) => {
            TODO('implementar');
            await this.#updateButtonOnContent(message, target, "Consciência utilizada");
        },
        'perseverance': async (target, message) => {
            const result = await RollPerseverance.operateMessage(message);
            if (result) {
                await this.#updateButtonOnContent(message, target, localize('Perseveranca_Utilizada'));
            }
        },
        'quietness': async (target, message) => {
            TODO('implementar');
            await this.#updateButtonOnContent(message, target, localize('Quietude_Utilizada'));
        },
    }

    static #getMessageId(event) {
        const { messageId } = event.target.closest("[data-message-id]")?.dataset ?? {};
        return messageId;
    }

    static #prepareEventMessage(event, target) {
        event.preventDefault();
        if (target.disabled) {
            return;
        }

        const messageId = Setor0ChatLog.#getMessageId(event);
        const message = MessageRepository.findMessage(messageId);
        if (!message) {
            console.warn(`messageId is invalid`);
            return;
        }

        if (message.speakerActor.isOwner) {
            console.warn(`User: ${game.user.name} isn't the owner of this message`);
            return;
        }

        const dataset = target.dataset;
        return {
            action: dataset.action,
            type: dataset.type,
            message: message
        }
    }

    static #view(event, target) {
        const { type, message } = Setor0ChatLog.#prepareEventMessage(event, target) ?? {};
        const method = Setor0ChatLog.#viewMap[type];
        if (typeof method === 'function') {
            method(target, message);
        } else {
            console.warn(`method is invalid [${type}]`);
        }
    }

    static #check(event, target) {
        const { type, message } = Setor0ChatLog.#prepareEventMessage(event, target) ?? {};
        const method = Setor0ChatLog.#checkMap[type];
        if (typeof method === 'function') {
            method(target, message);
        } else {
            console.warn(`method is invalid [${type}]`);
        }
    }

    static async #updateButtonOnContent(message, button, text) {
        const $content = $(message.content);
        const $button = $content.find(`button[data-action="${button.dataset.action}"][data-type="${button.dataset.type}"]`);
        if ($button) {
            $button.text(text);
            $button.removeAttr('data-action').removeAttr('data-type');
            $button.attr('disabled', true);
            await MessageRepository.updateMessage(message, { content: $content.prop('outerHTML') });
        }
    }
}

export function configureSetor0ChatLog() {
    CONFIG.ui.chat = Setor0ChatLog;
}
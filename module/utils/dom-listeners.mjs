import { RollPerseverance } from "../core/rolls/perseverance-roll.mjs";
import { MessageRepository } from "../repository/message-repository.mjs";
import { HtmlJsUtils } from "./html-js-utils.mjs";
import { localize } from "../utils/utils.mjs";

export class DOMUtils {
    static #mapEventsHandle = {
        'toggle-tooltip': (target) => this.#toggleTooltip(target),
        'roll': {
            'perseverance': (target) => this.#perseverance(target),
        },
    }

    static addListenersOnDOM() {
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            const eventData = target.dataset;

            if (!eventData || !eventData.handleOnDom) {
                return;
            }

            const action = eventData.action;
            if (!action) {
                return;
            }

            const method = this.#mapEventsHandle[action];
            if (typeof method === 'function') {
                return method(target);
            }

            const type = eventData.type;
            const methodOfType = method?.[type];
            if (typeof methodOfType === 'function') {
                return methodOfType(target);
            }

            console.log(`-> Não existe evento configurado no DOM para [${action}]`);
        });
    }

    static #toggleTooltip(target) {
        let tooltip = target.previousElementSibling;
        let hooks = 0;
        while (hooks < 5 && tooltip) {
            if (tooltip.classList.contains('S0-container-contract')) {
                HtmlJsUtils.expandOrContractMessageElement(tooltip, { minHeight: 0, maxHeight: 600, marginBottom: 0 })
                return;
            } else {
                tooltip = tooltip.previousElementSibling;
                hooks++;
            }
        }
    }

    static async #perseverance(target) {
        const messageId = target.closest('.chat-message')?.dataset?.messageId;
        const message = MessageRepository.findMessage(messageId);
        if (!message) {
            console.warn('-> Possível erro ao procurar a mensagem');
            return;
        }

        const result = await RollPerseverance.operateMessage(message);
        if (result) {
            this.#removePerseveranceButton(message, target);
        }
    }

    static #removePerseveranceButton(message, button) {
        let $content = $(message.content);
        let $button = $content.find(`button[data-action="${button.dataset.action}"][data-type="${button.dataset.type}"]`);
        if ($button) {
            $button.text(localize('Perseveranca_Utilizada'));
            $button.removeAttr('data-action').removeAttr('data-type');
            $button.attr('disabled', true);
            MessageRepository.updateMessage(message, { content: $content.prop('outerHTML') });
        }
    }
}
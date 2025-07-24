import { FoundryApi } from "./foundry-api.mjs";

export class ChatCreator {

    static MODE_PRIVATE_TO_GM = CONST.DICE_ROLL_MODES.PRIVATE;
    static MODE_BLIND = CONST.DICE_ROLL_MODES.BLIND;
    static MODE_SELF = CONST.DICE_ROLL_MODES.SELF;
    static MODE_PUBLIC = CONST.DICE_ROLL_MODES.PUBLIC;

    static async sendToChat(actor, content, mode) {
        const messageData = {
            speaker: FoundryApi.ChatMessage.getSpeaker(actor),
            content: content,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            whisper: this.#configureWhisperByMode(mode),
            blind: this.#configureBlindByMode(mode)
        };
        await FoundryApi.ChatMessage.create(messageData);
    }

    static async sendToChatTypeRoll(actor, content, rolls = [], mode) {
        const messageData = {
            speaker: FoundryApi.ChatMessage.getSpeaker(actor),
            content: content,
            rolls: rolls,
            whisper: this.#configureWhisperByMode(mode),
            blind: this.#configureBlindByMode(mode)
        };
        const optionsMode = { rollMode: mode };
        await FoundryApi.ChatMessage.create(messageData, optionsMode);
    }

    static #configureWhisperByMode(mode) {
        switch (mode) {
            case this.MODE_PRIVATE_TO_GM:
                return new Set([...FoundryApi.ChatMessage.getWhisperRecipients("GM").map(u => u.id), game.user.id]);
            case this.MODE_BLIND:
                return new Set(FoundryApi.ChatMessage.getWhisperRecipients("GM").map(u => u.id));
            case this.MODE_SELF:
                return [game.user.id];
            default:
                return [];
        }
    }

    static #configureBlindByMode(mode) {
        switch (mode) {
            case this.MODE_PRIVATE_TO_GM:
                return true;
            case this.MODE_BLIND:
                return true;
            case this.MODE_SELF:
                return false;
            default:
                return false;
        }
    }

}
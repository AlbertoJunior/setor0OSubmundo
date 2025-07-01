import { FoundryApi } from "./foundry-api.mjs";

export class ChatCreator {

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
            case CONST.DICE_ROLL_MODES.PRIVATE:
                return new Set([...FoundryApi.ChatMessage.getWhisperRecipients("GM").map(u => u.id), game.user.id]);
            case CONST.DICE_ROLL_MODES.BLIND:
                return new Set(FoundryApi.ChatMessage.getWhisperRecipients("GM").map(u => u.id));
            case CONST.DICE_ROLL_MODES.SELF:
                return [game.user.id];
            default:
                return [];
        }
    }

    static #configureBlindByMode(mode) {
        switch (mode) {
            case CONST.DICE_ROLL_MODES.PRIVATE:
                return true;
            case CONST.DICE_ROLL_MODES.BLIND:
                return true;
            case CONST.DICE_ROLL_MODES.SELF:
                return false;
            default:
                return false;
        }
    }

}
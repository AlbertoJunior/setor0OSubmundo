export class MessageRepository {
    static findMessage(messageId) {
        return game.messages.get(messageId);
    }

    static findMessageByActorId(actorId) {
        return game.messages.filter(message => message.speaker.actor == actorId);
    }

    static async updateMessage(message, params) {
        if (!message) {
            return;
        }
        await message.update(params);
    }
}
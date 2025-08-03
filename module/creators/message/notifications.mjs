export class NotificationsUtils {
    static async info(message) {
        ui.notifications.info(message);
    }

    static async error(message) {
        ui.notifications.error(message);
    }

    static async warning(message) {
        ui.notifications.warn(message);
    }
}
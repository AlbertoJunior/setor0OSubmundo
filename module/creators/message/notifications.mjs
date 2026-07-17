export class NotificationsUtils {
  static async success(message) {
    ui.notifications.success(message);
  }

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
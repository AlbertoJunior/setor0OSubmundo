export class OwnershipUtils {

  static NONE = 0;
  static LIMITED = 1;
  static OBSERVER = 2;
  static OWNER = 3;

  static isOwner(item) {
    return item?.isOwner || false
  }

  static isDefaultLimited(item) {
    return this.#ownershipDefault(item) == this.LIMITED || false
  }

  static isDefaultObserver(item) {
    return this.#ownershipDefault(item) == this.OBSERVER || false
  }

  static canEdit(item) {
    if (game.user.isGM)
      return true;

    const ownership = this.#ownershipUser(item);
    return ownership == this.OWNER;
  }

  static canRoll(item) {
    if (game.user.isGM)
      return true;

    const ownership = this.#ownershipUser(item);
    return ownership == this.OWNER || ownership == this.LIMITED;
  }

  static canDoSomething(item) {
    return this.#ownershipDefault(item) > this.NONE || this.#ownershipUser(item) > this.NONE
  }

  static #ownershipDefault(item) {
    return item?.ownership?.default || this.NONE
  }

  static #ownershipUser(item) {
    return item?.ownership?.[game.user.id] || this.NONE
  }
}
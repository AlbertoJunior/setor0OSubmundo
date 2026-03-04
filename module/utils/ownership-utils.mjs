export class OwnershipUtils {

  static NONE = 0;
  static LIMITED = 1;
  static OBSERVER = 2;
  static OWNER = 3;

  static isOwner(actor) {
    return actor?.isOwner || false
  }

  static isLimited(actor) {
    return this.#ownershipDefault(actor) == this.LIMITED || false
  }

  static isObserver(actor) {
    return this.#ownershipDefault(actor) == this.OBSERVER || false
  }

  static canDoSomething(actor) {
    return this.#ownershipDefault(actor) > this.NONE
  }

  static #ownershipDefault(actor) {
    return actor?.ownership?.default || this.NONE
  }
}
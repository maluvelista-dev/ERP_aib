import { ApplicationPolicy } from './ApplicationPolicy.js';

export class OrderPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }

  show() {
    return this.#ownsOrder();
  }

  create() {
    return this.index();
  }

  generatePdf() {
    return this.#ownsOrder();
  }

  clearHistory() {
    return this.index();
  }

  sendWhatsapp() {
    return this.#ownsOrder();
  }

  destroy() {
    return this.#ownsOrder();
  }

  update() {
    return this.destroy();
  }

  #ownsOrder() {
    return Boolean(this.user?.id && this.record?.createdById === this.user.id);
  }
}

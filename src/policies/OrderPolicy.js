import { ApplicationPolicy } from './ApplicationPolicy.js';

export class OrderPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }

  show() {
    return this.isAdmin() || this.#ownsOrder();
  }

  create() {
    return this.index();
  }

  generatePdf() {
    return this.isAdmin() || this.#ownsOrder();
  }

  clearHistory() {
    return this.isSeller();
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

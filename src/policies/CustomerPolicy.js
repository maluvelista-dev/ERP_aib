import { ApplicationPolicy } from './ApplicationPolicy.js';

export class CustomerPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }

  show() {
    return this.#ownsCustomer();
  }

  create() {
    return this.index();
  }

  update() {
    return this.#ownsCustomer();
  }

  destroy() {
    return this.#ownsCustomer();
  }

  activate() {
    return this.#ownsCustomer();
  }

  toggleActive() {
    return this.#ownsCustomer();
  }

  #ownsCustomer() {
    return Boolean(this.user?.id && this.record?.createdById === this.user.id);
  }
}

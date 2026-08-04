import { ApplicationPolicy } from './ApplicationPolicy.js';

export class CustomerPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }

  show() {
    return this.index();
  }

  create() {
    return this.index();
  }

  update() {
    return this.index();
  }

  destroy() {
    return this.isAdmin();
  }

  activate() {
    return this.isAdmin();
  }

  toggleActive() {
    return this.isAdmin();
  }
}

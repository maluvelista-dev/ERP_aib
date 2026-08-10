import { ApplicationPolicy } from './ApplicationPolicy.js';

export class ProductPolicy extends ApplicationPolicy {
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
    return this.isAdmin();
  }

  destroy() {
    return this.isAdmin();
  }
}

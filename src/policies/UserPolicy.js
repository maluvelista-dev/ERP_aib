import { ApplicationPolicy } from './ApplicationPolicy.js';

export class UserPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin();
  }

  show() {
    return this.isAdmin() || this.ownsRecord();
  }

  create() {
    return this.isAdmin();
  }

  update() {
    return this.isAdmin() || this.ownsRecord();
  }

  destroy() {
    if (this.user.id === this.record?.id) {
      return false;
    }

    return this.isAdmin() && this.record?.role === 'SELLER';
  }

  activate() {
    return this.destroy();
  }

  toggleActive() {
    return this.destroy();
  }

  approve() {
    return this.destroy();
  }

  reject() {
    return this.destroy();
  }
}

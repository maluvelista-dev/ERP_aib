import { ApplicationPolicy } from './ApplicationPolicy.js';

export class UserPolicy extends ApplicationPolicy {
  index() {
    return this.isManager();
  }

  show() {
    return this.isManager() || this.ownsRecord();
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

    return this.isManager() && this.record?.role === 'SELLER';
  }

  activate() {
    return this.destroy();
  }

  toggleActive() {
    return this.destroy();
  }
}

import { ApplicationPolicy } from './ApplicationPolicy.js';

export class OrderPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }

  show() {
    return this.index();
  }

  create() {
    return this.index();
  }

  generatePdf() {
    return this.index();
  }

  sendWhatsapp() {
    return this.index();
  }

  destroy() {
    return this.isAdminOrManager()
      || Boolean(this.user?.id && this.record?.createdById === this.user.id);
  }
}

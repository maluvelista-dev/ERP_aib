export class ApplicationPolicy {
  constructor(user, record = null) {
    this.user = user;
    this.record = record;
  }

  index() {
    return false;
  }

  show() {
    return false;
  }

  create() {
    return false;
  }

  update() {
    return false;
  }

  destroy() {
    return false;
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }

  isManager() {
    return false;
  }

  isSeller() {
    return this.user?.role === 'seller';
  }

  isAdminOrManager() {
    return this.isAdmin();
  }

  ownsRecord() {
    return Boolean(this.user?.id && this.record?.id && this.user.id === this.record.id);
  }
}

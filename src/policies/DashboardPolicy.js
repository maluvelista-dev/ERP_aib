import { ApplicationPolicy } from './ApplicationPolicy.js';

export class DashboardPolicy extends ApplicationPolicy {
  show() {
    return this.isAdmin() || this.isSeller();
  }
}

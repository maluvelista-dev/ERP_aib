import { ApplicationPolicy } from './ApplicationPolicy.js';

export class ProductCategoryPolicy extends ApplicationPolicy {
  index() {
    return this.isAdmin() || this.isSeller();
  }
}

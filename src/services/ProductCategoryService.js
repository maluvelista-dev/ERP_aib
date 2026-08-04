import ProductCategoryRepository from '../repositories/ProductCategoryRepository.js';
import { ProductCategoryModel } from '../models/ProductCategoryModel.js';

class ProductCategoryService {
  async list() {
    return ProductCategoryRepository.findActive();
  }

  async findById(id) {
    return ProductCategoryRepository.findById(id);
  }

  async findOrCreateByName(name, description = null) {
    const slug = ProductCategoryModel.normalizeSlug(name);
    const existing = await ProductCategoryRepository.findBySlug(slug);

    if (existing) {
      return existing;
    }

    const data = ProductCategoryModel.validateCreate({
      name,
      slug,
      description,
      active: true
    });

    return ProductCategoryRepository.create(data);
  }
}

export default new ProductCategoryService();

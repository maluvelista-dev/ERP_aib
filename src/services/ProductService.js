import ProductRepository from '../repositories/ProductRepository.js';
import ProductCategoryService from './ProductCategoryService.js';
import { ProductModel } from '../models/ProductModel.js';
import { AppError } from '../utils/AppError.js';

class ProductService {
  async list(filters = {}) {
    return ProductRepository.findActive({
      categoryId: filters.categoryId || null,
      search: filters.search || null,
      includeInactive: Boolean(filters.includeInactive)
    });
  }

  async findById(id) {
    const product = await ProductRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async create(payload) {
    const data = ProductModel.validateCreate(payload);
    const code = ProductModel.normalizeCode(data.code);
    const existing = await ProductRepository.findByCode(code);

    if (existing) {
      throw new AppError('A product with this code already exists', 409);
    }

    const category = await this.#resolveCategory(data);

    return ProductRepository.create({
      ...data,
      categoryId: category.id,
      category: category.name,
      code,
      unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
      boxPrice: ProductModel.normalizeMoney(data.boxPrice)
    });
  }
   
  async update(id, payload) {
    const product = await this.findById(id);
    const data = ProductModel.validateUpdate(payload);
    const code = ProductModel.normalizeCode(data.code);
    const existing = await ProductRepository.findByCode(code);

    if (existing && existing.id !== product.id) {
      throw new AppError('A product with this code already exists', 409);
    }

    const category = await this.#resolveCategory(data);

    return ProductRepository.update(id, {
      ...data,
      categoryId: category.id,
      category: category.name,
      code,
      unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
      boxPrice: ProductModel.normalizeMoney(data.boxPrice)
    });
  }

  async remove(id) {
    await this.findById(id);
    return ProductRepository.softDelete(id);
  }

  async #resolveCategory(data) {
    if (data.categoryId) {
      const category = await ProductCategoryService.findById(data.categoryId);

      if (!category || category.active === false) {
        throw new AppError('Invalid product category', 422);
      }

      return category;
    }

    return ProductCategoryService.findOrCreateByName(data.category);
  }
}

export default new ProductService();

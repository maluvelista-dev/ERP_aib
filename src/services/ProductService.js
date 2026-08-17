import ProductRepository from '../repositories/ProductRepository.js';
import ProductCategoryService from './ProductCategoryService.js';
import { ProductModel } from '../models/ProductModel.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { TtlCache } from '../utils/TtlCache.js';

const productListCache = new TtlCache({
  ttlMs: env.catalogCacheTtlMs,
  maxEntries: 200
});

const cacheKeyFor = (filters) => JSON.stringify({
  categoryId: filters.categoryId || null,
  search: filters.search?.trim().toLowerCase() || null,
  includeInactive: Boolean(filters.includeInactive)
});

class ProductService {
  async list(filters = {}) {
    const cacheKey = cacheKeyFor(filters);
    const cached = productListCache.get(cacheKey);
    if (cached) return cached;

    const products = await ProductRepository.findActive({
      categoryId: filters.categoryId || null,
      search: filters.search || null,
      includeInactive: Boolean(filters.includeInactive)
    });

    return productListCache.set(cacheKey, products);
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
    const sortOrder = await ProductRepository.nextSortOrder();

    const product = await ProductRepository.create({
      ...data,
      categoryId: category.id,
      category: category.name,
      code,
      sortOrder,
      unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
      boxPrice: ProductModel.normalizeMoney(data.boxPrice)
    });
    productListCache.clear();
    return product;
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

    const updatedProduct = await ProductRepository.update(id, {
      ...data,
      categoryId: category.id,
      category: category.name,
      code,
      unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
      boxPrice: ProductModel.normalizeMoney(data.boxPrice)
    });
    productListCache.clear();
    return updatedProduct;
  }

  async remove(id) {
    await this.findById(id);
    const product = await ProductRepository.softDelete(id);
    productListCache.clear();
    return product;
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

import ProductRepository from '../repositories/ProductRepository.js';
import ProductCategoryService from './ProductCategoryService.js';
import { ProductModel } from '../models/ProductModel.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { TtlCache } from '../utils/TtlCache.js';
import { paginationMeta, paginationParams } from '../utils/pagination.js';
import { getRedis } from '../config/redis.js';

const productListCache = new TtlCache({
  ttlMs: env.catalogCacheTtlMs,
  maxEntries: 200
});

const cacheKeyFor = (filters) => JSON.stringify({
  categoryId: filters.categoryId || null,
  search: filters.search?.trim().toLowerCase() || null,
  includeInactive: Boolean(filters.includeInactive)
});

const catalogVersion = async () => {
  const redis = await getRedis();
  return redis ? (await redis.get('catalog:version') || '0') : 'local';
};

const clearProductCache = async () => {
  productListCache.clear();
  const redis = await getRedis();
  if (redis) await redis.incr('catalog:version');
};

class ProductService {
  async paginate(filters = {}) {
    const { page, pageSize, skip } = paginationParams(filters);
    const cacheKey = `page:${page}:${pageSize}:${cacheKeyFor(filters)}`;
    const redis = await getRedis();
    const sharedKey = `catalog:${await catalogVersion()}:${cacheKey}`;
    if (redis) {
      const shared = await redis.get(sharedKey);
      if (shared) return JSON.parse(shared);
    }
    const cached = productListCache.get(cacheKey);
    if (cached) return cached;

    const result = await ProductRepository.paginate(filters, skip, pageSize);
    const response = { items: result.items, pagination: paginationMeta(result.total, page, pageSize) };
    productListCache.set(cacheKey, response);
    if (redis) await redis.set(sharedKey, JSON.stringify(response), { PX: env.catalogCacheTtlMs });
    return response;
  }

  async list(filters = {}) {
    const cacheKey = cacheKeyFor(filters);
    const redis = await getRedis();
    const sharedKey = `catalog:${await catalogVersion()}:${cacheKey}`;
    if (redis) {
      const shared = await redis.get(sharedKey);
      if (shared) return JSON.parse(shared);
    }
    const cached = productListCache.get(cacheKey);
    if (cached) return cached;

    const products = await ProductRepository.findActive({
      categoryId: filters.categoryId || null,
      search: filters.search || null,
      includeInactive: Boolean(filters.includeInactive)
    });

    productListCache.set(cacheKey, products);
    if (redis) await redis.set(sharedKey, JSON.stringify(products), { PX: env.catalogCacheTtlMs });
    return products;
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
    const name = ProductModel.normalizeName(data.name);
    const [existingByCode, existingByName] = await Promise.all([
      ProductRepository.findByCode(code),
      ProductRepository.findByName(name)
    ]);

    if (existingByCode) {
      throw new AppError(`Já existe um produto com o código ${code}`, 409);
    }

    if (existingByName) {
      throw new AppError(`O produto "${existingByName.name}" já existe no catálogo`, 409);
    }

    const category = await this.#resolveCategory(data);
    const sortOrder = await ProductRepository.nextSortOrder();

    let product;
    try {
      product = await ProductRepository.create({
        ...data,
        categoryId: category.id,
        category: category.name,
        code,
        name,
        sortOrder,
        unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
        boxPrice: ProductModel.normalizeMoney(data.boxPrice),
        unitsPerBox: data.unitsPerBox === '' || data.unitsPerBox === null || data.unitsPerBox === undefined
          ? null
          : Number(data.unitsPerBox)
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new AppError('Este produto já existe no catálogo', 409);
      }
      throw error;
    }
    await clearProductCache();
    return product;
  }
   
  async update(id, payload) {
    const product = await this.findById(id);
    const data = ProductModel.validateUpdate(payload);
    const code = ProductModel.normalizeCode(data.code);
    const name = ProductModel.normalizeName(data.name);
    const [existingByCode, existingByName] = await Promise.all([
      ProductRepository.findByCode(code),
      ProductRepository.findByName(name)
    ]);

    if (existingByCode && existingByCode.id !== product.id) {
      throw new AppError(`Já existe um produto com o código ${code}`, 409);
    }

    if (existingByName && existingByName.id !== product.id) {
      throw new AppError(`O produto "${existingByName.name}" já existe no catálogo`, 409);
    }

    const category = await this.#resolveCategory(data);

    const updatedProduct = await ProductRepository.update(id, {
      ...data,
      categoryId: category.id,
      category: category.name,
      code,
      name,
      unitPrice: ProductModel.normalizeMoney(data.unitPrice) ?? 0,
      boxPrice: ProductModel.normalizeMoney(data.boxPrice),
      unitsPerBox: data.unitsPerBox === '' || data.unitsPerBox === null || data.unitsPerBox === undefined
        ? null
        : Number(data.unitsPerBox)
    });
    await clearProductCache();
    return updatedProduct;
  }

  async remove(id) {
    await this.findById(id);
    const product = await ProductRepository.softDelete(id);
    await clearProductCache();
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

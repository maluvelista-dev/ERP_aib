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

const cacheKeyFor = (filters, userId) => JSON.stringify({
  userId,
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
  async paginate(filters = {}, currentUser) {
    const userId = currentUser?.id;
    if (!userId) throw new AppError('Unauthorized', 401);
    const { page, pageSize, skip } = paginationParams(filters);
    const cacheKey = `page:${page}:${pageSize}:${cacheKeyFor(filters, userId)}`;
    const redis = await getRedis();
    const sharedKey = `catalog:${await catalogVersion()}:${cacheKey}`;
    if (redis) {
      const shared = await redis.get(sharedKey);
      if (shared) return JSON.parse(shared);
    }
    const cached = productListCache.get(cacheKey);
    if (cached) return cached;

    const visible = this.#filterProducts(this.#preferPrivateVersions(await ProductRepository.findActive(filters, userId)), filters);
    const response = { items: visible.slice(skip, skip + pageSize), pagination: paginationMeta(visible.length, page, pageSize) };
    productListCache.set(cacheKey, response);
    if (redis) await redis.set(sharedKey, JSON.stringify(response), { PX: env.catalogCacheTtlMs });
    return response;
  }

  async list(filters = {}, currentUser) {
    const userId = currentUser?.id;
    if (!userId) throw new AppError('Unauthorized', 401);
    const cacheKey = cacheKeyFor(filters, userId);
    const redis = await getRedis();
    const sharedKey = `catalog:${await catalogVersion()}:${cacheKey}`;
    if (redis) {
      const shared = await redis.get(sharedKey);
      if (shared) return JSON.parse(shared);
    }
    const cached = productListCache.get(cacheKey);
    if (cached) return cached;

    const queryFilters = {
      categoryId: filters.categoryId || null,
      search: filters.search || null,
      includeInactive: Boolean(filters.includeInactive)
    };
    const products = this.#filterProducts(
      this.#preferPrivateVersions(await ProductRepository.findActive(queryFilters, userId)),
      queryFilters
    );

    productListCache.set(cacheKey, products);
    if (redis) await redis.set(sharedKey, JSON.stringify(products), { PX: env.catalogCacheTtlMs });
    return products;
  }

  async findById(id, currentUser) {
    const product = await ProductRepository.findVisibleById(id, currentUser?.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async create(payload, currentUser) {
    if (!currentUser?.id) throw new AppError('Unauthorized', 401);
    const data = ProductModel.validateCreate(payload);
    const code = ProductModel.normalizeCode(data.code);
    const name = ProductModel.normalizeName(data.name);
    const [existingByCode, existingByName] = await Promise.all([
      ProductRepository.findByCode(code, currentUser.id),
      ProductRepository.findByName(name, currentUser.id)
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
        createdById: currentUser.id,
        sourceProductId: null,
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
   
  async update(id, payload, currentUser) {
    if (!currentUser?.id) throw new AppError('Unauthorized', 401);
    const product = await this.findById(id, currentUser);
    const data = ProductModel.validateUpdate(payload);
    const code = ProductModel.normalizeCode(data.code);
    const name = ProductModel.normalizeName(data.name);
    const [existingByCode, existingByName] = await Promise.all([
      ProductRepository.findByCode(code, currentUser.id),
      ProductRepository.findByName(name, currentUser.id)
    ]);

    if (existingByCode && existingByCode.id !== product.id && existingByCode.sourceProductId !== product.id) {
      throw new AppError(`Já existe um produto com o código ${code}`, 409);
    }

    if (existingByName && existingByName.id !== product.id && existingByName.sourceProductId !== product.id) {
      throw new AppError(`O produto "${existingByName.name}" já existe no catálogo`, 409);
    }

    const category = await this.#resolveCategory(data);

    const normalized = {
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
    };

    let updatedProduct;
    if (product.createdById === currentUser.id) {
      updatedProduct = await ProductRepository.update(product.id, normalized);
    } else {
      const existingPrivate = await ProductRepository.findPrivateVersion(product.id, currentUser.id);
      updatedProduct = existingPrivate
        ? await ProductRepository.update(existingPrivate.id, normalized)
        : await ProductRepository.create({
            ...normalized,
            createdById: currentUser.id,
            sourceProductId: product.id,
            sortOrder: product.sortOrder
          });
    }
    await clearProductCache();
    return updatedProduct;
  }

  async remove(id, currentUser) {
    const existing = await this.findById(id, currentUser);
    if (existing.createdById !== currentUser?.id) {
      throw new AppError('O produto-base não pode ser excluído', 403);
    }
    const product = await ProductRepository.softDelete(id);
    await clearProductCache();
    return product;
  }

  #preferPrivateVersions(products) {
    const overriddenIds = new Set(products.filter((item) => item.createdById && item.sourceProductId).map((item) => item.sourceProductId));
    return products.filter((item) => item.createdById || !overriddenIds.has(item.id));
  }

  #filterProducts(products, filters) {
    const search = filters.search?.trim().toLocaleLowerCase('pt-BR');
    return products.filter((product) => {
      if (!filters.includeInactive && !product.active) return false;
      if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
      if (!search) return true;
      return [product.code, product.name, product.category, product.productCategory?.name]
        .some((value) => String(value ?? '').toLocaleLowerCase('pt-BR').includes(search));
    });
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

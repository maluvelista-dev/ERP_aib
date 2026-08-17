import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(prisma.product);
  }

  async findByCode(code) {
    return this.model.findUnique({
      where: { code: code.toUpperCase() },
      include: { productCategory: true }
    });
  }

  async findActive(filters = {}, limit = 500) {
    const search = filters.search?.trim();
    const activeFilter = filters.includeInactive ? {} : { active: true };

    return this.model.findMany({
      where: {
        ...activeFilter,
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search } },
                { name: { contains: search } },
                { category: { contains: search } },
                {
                  productCategory: {
                    name: { contains: search }
                  }
                }
              ]
            }
          : {})
      },
      take: limit,
      orderBy: [
        { sortOrder: { sort: 'asc', nulls: 'last' } },
        { name: 'asc' }
      ],
      include: { productCategory: true }
    });
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
      include: { productCategory: true }
    });
  }

  async findByIds(ids) {
    if (!ids.length) return [];

    return this.model.findMany({
      where: { id: { in: ids } },
      include: { productCategory: true }
    });
  }

  async nextSortOrder() {
    const result = await this.model.aggregate({
      _max: { sortOrder: true }
    });

    return Number(result._max.sortOrder ?? 0) + 1;
  }
}

export default new ProductRepository();

import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(prisma.product);
  }

  async findByCode(code, userId) {
    return this.model.findFirst({
      where: { code: code.toUpperCase(), OR: [{ createdById: null }, { createdById: userId }] },
      orderBy: { createdById: 'desc' },
      include: { productCategory: true }
    });
  }

  async findActive(_filters = {}, userId) {
    return this.model.findMany({
      where: { OR: [{ createdById: null }, { createdById: userId }] },
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

  async findByName(name, userId) {
    return this.model.findFirst({
      where: { name, OR: [{ createdById: null }, { createdById: userId }] },
      include: { productCategory: true }
    });
  }

  async countActive(userId = null) {
    if (!userId) {
      return this.model.count({ where: { active: true, createdById: null } });
    }

    const products = await this.model.findMany({
      where: { OR: [{ createdById: null }, { createdById: userId }] },
      select: { id: true, active: true, createdById: true, sourceProductId: true }
    });
    const overriddenIds = new Set(products.filter((item) => item.createdById && item.sourceProductId).map((item) => item.sourceProductId));
    return products.filter((item) => (item.createdById || !overriddenIds.has(item.id)) && item.active).length;
  }

  async findVisibleById(id, userId) {
    return this.model.findFirst({
      where: { id, OR: [{ createdById: null }, { createdById: userId }] },
      include: { productCategory: true }
    });
  }

  async findVisibleByIds(ids, userId) {
    if (!ids.length) return [];
    return this.model.findMany({
      where: { id: { in: ids }, OR: [{ createdById: null }, { createdById: userId }] },
      include: { productCategory: true }
    });
  }

  async findPrivateVersion(sourceProductId, userId) {
    return this.model.findFirst({ where: { sourceProductId, createdById: userId }, include: { productCategory: true } });
  }

  async nextSortOrder() {
    const result = await this.model.aggregate({
      _max: { sortOrder: true }
    });

    return Number(result._max.sortOrder ?? 0) + 1;
  }
}

export default new ProductRepository();

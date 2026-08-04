import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

class ProductCategoryRepository extends BaseRepository {
  constructor() {
    super(prisma.productCategory);
  }

  async findActive(limit = 100) {
    return this.model.findMany({
      where: { active: true },
      take: limit,
      orderBy: { name: 'asc' }
    });
  }

  async findByName(name) {
    return this.model.findUnique({
      where: { name }
    });
  }

  async findBySlug(slug) {
    return this.model.findUnique({
      where: { slug }
    });
  }

  async upsertBySlug(data) {
    return this.model.upsert({
      where: { slug: data.slug },
      update: data,
      create: data
    });
  }
}

export default new ProductCategoryRepository();

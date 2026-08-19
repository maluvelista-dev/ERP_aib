import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

class CustomerRepository extends BaseRepository {
  constructor() {
    super(prisma.customer);
  }

  async findAnyById(id) {
    return this.model.findUnique({ where: { id } });
  }

  async findOwnedById(id, createdById) {
    return this.model.findFirst({ where: { id, createdById } });
  }

  async findByCnpj(cnpj, createdById) {
    return this.model.findFirst({ where: { cnpj, createdById } });
  }

  async findForOwner(createdById, { includeInactive = false, limit = 500 } = {}) {
    return this.model.findMany({
      where: {
        createdById,
        ...(includeInactive ? {} : { active: true })
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async paginateForOwner(createdById, { includeInactive = false, skip = 0, take = 25 } = {}) {
    const where = { createdById, ...(includeInactive ? {} : { active: true }) };
    const [items, total] = await Promise.all([
      this.model.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.model.count({ where })
    ]);
    return { items, total };
  }

  async countActive(createdById = null) {
    return this.model.count({ where: { active: true, ...(createdById ? { createdById } : {}) } });
  }

  async activate(id) {
    return this.update(id, { active: true, retentionUntil: null, anonymizedAt: null });
  }

  async deactivate(id, retentionUntil) {
    return this.update(id, { active: false, retentionUntil });
  }

  async search(term, createdById, limit = 20) {
    const normalized = term.toLowerCase();

    return this.model.findMany({
      where: {
        createdById,
        OR: [
          { cnpj: { contains: normalized } },
          { legalName: { contains: normalized } },
          { tradeName: { contains: normalized } },
          { email: { contains: normalized } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new CustomerRepository();

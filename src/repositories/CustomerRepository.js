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

  async activate(id) {
    return this.update(id, { active: true });
  }

  async deactivate(id) {
    return this.update(id, { active: false });
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

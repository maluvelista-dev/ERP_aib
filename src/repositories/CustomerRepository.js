import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

class CustomerRepository extends BaseRepository {

  constructor() {
    super(prisma.customer);
  }

  async findAnyById(id) {
   return this.model.findUnique({
    where: { id }
  });
}

  async activate(id) {
   return this.update(id, { active: true });
}

  async deactivate(id) {
    return this.update(id, { active: false });
  }

  async findByCnpj(cnpj) {
    return this.model.findUnique({
      where: { cnpj }
    });
  }

  async findActive(limit = 50) {
    return this.model.findMany({
      where: { active: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async search(term, limit = 20) {
    const normalized = term.toLowerCase();

    return this.model.findMany({
      where: {
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

import { prisma } from '../config/prisma.js';
import { BaseRepository } from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email) {
    return this.model.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async findActiveById(id) {
    return this.model.findFirst({
      where: {
        id,
        active: true
      }
    });
  }

  async create(data) {
    return this.model.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        role: data.role.toUpperCase()
      }
    });
  }

  async update(id, data) {
    const nextData = { ...data };

    if (nextData.email) {
      nextData.email = nextData.email.toLowerCase();
    }

    if (nextData.role) {
      nextData.role = nextData.role.toUpperCase();
    }

    return this.model.update({
      where: { id },
      data: nextData
    });
  }
}

export default new UserRepository();

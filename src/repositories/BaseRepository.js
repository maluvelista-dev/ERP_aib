export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id }
    });
  }

  async findAll(limit = 50) {
    return this.model.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data) {
    return this.model.create({ data });
  }

  async update(id, data) {
    return this.model.update({
      where: { id },
      data
    });
  }

  async softDelete(id) {
    return this.update(id, { active: false });
  }
}

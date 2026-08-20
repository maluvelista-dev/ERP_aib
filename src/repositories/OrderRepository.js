import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../config/prisma.js';

const includeOrderRelations = {
  items: {
    include: {
      product: true
    }
  },
  customer: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  }
};

const visibleOrderFilter = { archivedAt: null };

const itemCreateData = (item) => ({
  productId: item.productId,
  code: item.code,
  name: item.name,
  category: item.category,
  manualUnitType: item.manualUnitType,
  manualColor: item.manualColor,
  quantity: item.quantity,
  unitQuantity: item.unitQuantity,
  boxQuantity: item.boxQuantity,
  unitPrice: item.unitPrice,
  boxPrice: item.boxPrice,
  unitsPerBox: item.unitsPerBox,
  totalPrice: item.totalPrice
});

class OrderRepository extends BaseRepository {
  constructor() {
    super(prisma.order);
  }

  async findById(id) {
    return this.model.findFirst({
      where: { id, ...visibleOrderFilter },
      include: includeOrderRelations
    });
  }

  async create(data) {
    const { items, createdBy, ...orderData } = data;

    return this.model.create({
      data: {
        ...orderData,
        status: 'DRAFT',
        createdById: createdBy.id,
        items: {
          create: items.map(itemCreateData)
        }
      },
      include: includeOrderRelations
    });
  }

  async update(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: includeOrderRelations
    });
  }

  async findRecent(filters = {}, limit = 50) {
    return this.model.findMany({
      where: {
        ...visibleOrderFilter,
        ...(filters.createdById ? { createdById: filters.createdById } : {}),
        ...(filters.customerId ? { customerId: filters.customerId } : {}),
        ...(filters.startDate ? { createdAt: { gte: filters.startDate } } : {})
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: includeOrderRelations
    });
  }

  async countFromStartOfDay(startOfDay) {
    return this.model.count({
      where: {
        ...visibleOrderFilter,
        createdAt: {
          gte: startOfDay
        }
      }
    });
  }

  async countByCollaboratorFromDate(createdById, startDate) {
    return this.model.count({
      where: {
        ...visibleOrderFilter,
        createdById,
        createdAt: {
          gte: startDate
        }
      }
    });
  }

  async markPdfGenerated(id, pdfUrl) {
    return this.model.update({
      where: { id },
      data: { status: 'PDF_GENERATED', pdfUrl },
      select: {
        id: true,
        status: true,
        pdfUrl: true,
        updatedAt: true
      }
    });
  }

  async findBySubmissionToken(submissionToken) {
    return this.model.findUnique({
      where: { submissionToken },
      include: includeOrderRelations
    });
  }

  async paginateRecent(filters = {}, skip = 0, take = 25) {
    const where = {
      ...visibleOrderFilter,
      ...(filters.createdById ? { createdById: filters.createdById } : {}),
      ...(filters.customerId ? { customerId: filters.customerId } : {}),
      ...(filters.startDate ? { createdAt: { gte: filters.startDate } } : {})
    };
    const [items, total] = await Promise.all([
      this.model.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: includeOrderRelations }),
      this.model.count({ where })
    ]);
    return { items, total };
  }

  async countFromDate(startDate, createdById = null) {
    return this.model.count({
      where: { ...visibleOrderFilter, createdAt: { gte: startDate }, ...(createdById ? { createdById } : {}) }
    });
  }

  async countAll(createdById = null) {
    return this.model.count({ where: { ...visibleOrderFilter, ...(createdById ? { createdById } : {}) } });
  }

  async findByPdfUrl(pdfUrl) {
    return this.model.findFirst({
      where: { pdfUrl, ...visibleOrderFilter },
      include: includeOrderRelations
    });
  }

  async findOwnedById(id, createdById) {
    return this.model.findFirst({
      where: { id, createdById, ...visibleOrderFilter },
      include: includeOrderRelations
    });
  }

  async replaceItemsAndUpdate(id, data, items) {
    return prisma.$transaction(async (transaction) => {
      await transaction.orderItem.deleteMany({ where: { orderId: id } });

      return transaction.order.update({
        where: { id },
        data: {
          ...data,
          items: { create: items.map(itemCreateData) }
        },
        include: includeOrderRelations
      });
    });
  }

  async destroy(id) {
    return this.model.delete({ where: { id } });
  }

  async archive(id) {
    return this.model.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  async clearHistory(createdById = null) {
    const where = { ...visibleOrderFilter, ...(createdById ? { createdById } : {}) };
    const result = await this.model.updateMany({ where, data: { archivedAt: new Date() } });

    return {
      count: result.count,
      pdfUrls: []
    };
  }
}

export default new OrderRepository();

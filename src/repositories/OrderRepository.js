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
  totalPrice: item.totalPrice
});

class OrderRepository extends BaseRepository {
  constructor() {
    super(prisma.order);
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
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
        ...(filters.createdById ? { createdById: filters.createdById } : {}),
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
        createdAt: {
          gte: startOfDay
        }
      }
    });
  }

  async countByCollaboratorFromDate(createdById, startDate) {
    return this.model.count({
      where: {
        createdById,
        createdAt: {
          gte: startDate
        }
      }
    });
  }

  async markPdfGenerated(id, pdfUrl) {
    return this.update(id, {
      status: 'PDF_GENERATED',
      pdfUrl
    });
  }

  async markWhatsappSent(id) {
    return this.update(id, {
      status: 'WHATSAPP_SENT',
      whatsappSent: true,
      sentAt: new Date()
    });
  }

  async markWhatsappError(id, errorMessage) {
    return this.update(id, {
      status: 'WHATSAPP_ERROR',
      whatsappError: errorMessage
    });
  }

  async findOwnedById(id, createdById) {
    return this.model.findFirst({
      where: { id, createdById },
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

  async clearHistory(createdById = null) {
    const where = createdById ? { createdById } : {};
    const orders = await this.model.findMany({ where, select: { pdfUrl: true } });
    const result = await this.model.deleteMany({ where });

    return {
      count: result.count,
      pdfUrls: orders.map((order) => order.pdfUrl).filter(Boolean)
    };
  }
}

export default new OrderRepository();

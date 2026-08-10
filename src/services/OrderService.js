import CustomerRepository from '../repositories/CustomerRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import { OrderModel } from '../models/OrderModel.js';
import { AppError } from '../utils/AppError.js';
import PdfService from './PdfService.js';
import StorageService from './StorageService.js';
import WhatsappService from './WhatsappService.js';

class OrderService {
  async list(filters = {}, currentUser = null) {
    const canFilterByCollaborator = currentUser?.role === 'manager';
    const orders = await OrderRepository.findRecent({
      createdById: canFilterByCollaborator ? filters.createdById : null
    });

    return orders.map((order) => this.#withTotals(order));
  }

  async findById(id) {
    const order = await OrderRepository.findById(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return this.#withTotals(order);
  }

  async collaboratorSummary(collaboratorId) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfWeek.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);

    const startOfLastFifteenDays = new Date(startOfToday);
    startOfLastFifteenDays.setDate(startOfLastFifteenDays.getDate() - 14);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, week, lastFifteenDays, month] = await Promise.all([
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfToday),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfWeek),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfLastFifteenDays),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfMonth)
    ]);

    return {
      today,
      week,
      lastFifteenDays,
      month
    };
  }

  async create(payload, user) {
    const data = OrderModel.validateCreate(payload);
    const customer = await CustomerRepository.findById(data.customerId);

    if (!customer || customer.active === false) {
      throw new AppError('Invalid customer for order issuance', 422);
    }

    const items = await this.#buildItems(data.items);
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const discountPercent = Number(data.discountPercent ?? 0);
    const discountAmount = subtotalPrice * (discountPercent / 100);
    const bonusProductSnapshot = await this.#buildBonusProductSnapshot(data.bonusProductId);
    const order = await OrderRepository.create({
      orderNumber: OrderModel.buildOrderNumber(),
      customerId: customer.id,
      customerSnapshot: {
        cnpj: customer.cnpj,
        legalName: customer.legalName,
        tradeName: customer.tradeName,
        whatsapp: customer.whatsapp,
        zipCode: customer.zipCode,
        street: customer.street,
        number: customer.number,
        district: customer.district,
        city: customer.city,
        state: customer.state
      },
      receivedTime: data.receivedTime || null,
      deliveryDays: data.deliveryDays,
      notes: data.notes || null,
      fiscalEmail: data.fiscalEmail || null,
      contactEmail: data.contactEmail || null,
      paymentTerm: data.paymentTerm || null,
      sellerSnapshot: {
        name: user.name,
        email: user.email,
        phone: data.sellerPhone || ''
      },
      discountPercent,
      discountAmount,
      bonusProductSnapshot,
      status: 'draft',
      pdfUrl: null,
      whatsappSent: false,
      sentAt: null,
      items,
      createdBy: {
        id: user.sub,
        name: user.name,
        email: user.email
      }
    });

    if (data.sendWhatsapp) {
      return this.generatePdfAndSendWhatsapp(order.id);
    }

    return this.#withTotals(order);
  }

  async generatePdf(id) {
    const order = await this.findById(id);
    const buffer = await PdfService.generateOrderPdf(order);
    const destination = `orders/${order.id}/order_${order.orderNumber.replace('#', '')}.pdf`;
    const pdfUrl = await StorageService.uploadPdf(buffer, destination);

    return this.#withTotals(await OrderRepository.markPdfGenerated(id, pdfUrl));
  }

  async generatePdfAndSendWhatsapp(id) {
    const orderWithPdf = await this.generatePdf(id);

    try {
      await WhatsappService.sendOrderPdf({
        customer: orderWithPdf.customerSnapshot,
        order: orderWithPdf,
        pdfUrl: orderWithPdf.pdfUrl
      });

      return this.#withTotals(await OrderRepository.markWhatsappSent(id));
    } catch (error) {
      await OrderRepository.markWhatsappError(id, error.message);
      throw error;
    }
  }

  async #buildItems(requestedItems) {
    const items = [];

    for (const requestedItem of requestedItems) {
      if (!requestedItem.productId) {
        const unitQuantity = requestedItem.unitQuantity ?? requestedItem.quantity ?? 0;
        const unitPrice = Number(requestedItem.customUnitPrice ?? 0);

        items.push({
          productId: null,
          code: 'MANUAL',
          name: requestedItem.manualName,
          category: null,
          quantity: unitQuantity,
          unitQuantity,
          boxQuantity: 0,
          unitPrice,
          boxPrice: null,
          totalPrice: unitQuantity * unitPrice
        });
        continue;
      }

      const product = await ProductRepository.findById(requestedItem.productId);

      if (!product || product.active === false) {
        throw new AppError(`Invalid product: ${requestedItem.productId}`, 422);
      }

      const unitQuantity = requestedItem.unitQuantity ?? requestedItem.quantity ?? 0;
      const boxQuantity = requestedItem.boxQuantity ?? 0;
      const unitPrice = requestedItem.customUnitPrice === null || requestedItem.customUnitPrice === undefined
        ? Number(product.unitPrice ?? 0)
        : Number(requestedItem.customUnitPrice);
      const boxPrice = requestedItem.customBoxPrice === null || requestedItem.customBoxPrice === undefined
        ? (product.boxPrice === null || product.boxPrice === undefined ? null : Number(product.boxPrice))
        : Number(requestedItem.customBoxPrice);
      const totalPrice = unitQuantity * unitPrice + boxQuantity * (boxPrice ?? 0);

      items.push({
        productId: product.id,
        code: product.code,
        name: product.name,
        category: product.productCategory?.name || product.category || null,
        quantity: unitQuantity,
        unitQuantity,
        boxQuantity,
        unitPrice,
        boxPrice,
        totalPrice
      });
    }

    return items;
  }

  async #buildBonusProductSnapshot(productId) {
    if (!productId) {
      return null;
    }

    const product = await ProductRepository.findById(productId);

    if (!product || product.active === false) {
      throw new AppError(`Invalid bonus product: ${productId}`, 422);
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.productCategory?.name || product.category
    };
  }

  #withTotals(order) {
    const items = order.items ?? [];
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const discountPercent = Number(order.discountPercent ?? 0);
    const discountAmount = Number(order.discountAmount ?? subtotalPrice * (discountPercent / 100));
    const totalPrice = Math.max(subtotalPrice - discountAmount, 0);

    return {
      ...order,
      subtotalPrice,
      discountPercent,
      discountAmount,
      totalPrice
    };
  }
}

export default new OrderService();

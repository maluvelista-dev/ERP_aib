import CustomerRepository from '../repositories/CustomerRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import { OrderModel } from '../models/OrderModel.js';
import { AppError } from '../utils/AppError.js';
import PdfService from './PdfService.js';
import StorageService from './StorageService.js';
import { randomUUID } from 'node:crypto';
import { paginationMeta, paginationParams } from '../utils/pagination.js';
import { env } from '../config/env.js';
import { performance } from 'node:perf_hooks';
import PdfCoordinationService from './PdfCoordinationService.js';

const filenamePart = (value, fallback = 'cliente') => {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
};

class OrderService {
  async paginate(filters = {}, currentUser = null) {
    if (!currentUser?.id) return { items: [], pagination: paginationMeta(0, 1, 25) };
    const isAdmin = currentUser.role === 'admin';
    const createdById = isAdmin ? (filters.createdById || undefined) : currentUser.id;
    const startDate = this.#startDateForPeriod(filters.period);
    const { page, pageSize, skip } = paginationParams(filters);
    const result = await OrderRepository.paginateRecent({
      createdById,
      customerId: filters.customerId || undefined,
      startDate
    }, skip, pageSize);
    return {
      items: result.items.map((order) => this.#withTotals(order)),
      pagination: paginationMeta(result.total, page, pageSize)
    };
  }

  async list(filters = {}, currentUser = null) {
    if (!currentUser?.id) {
      return [];
    }

    const isAdmin = currentUser.role === 'admin';
    const createdById = isAdmin ? (filters.createdById || undefined) : currentUser.id;
    const startDate = this.#startDateForPeriod(filters.period);
    const orders = await OrderRepository.findRecent({ createdById, startDate }, 500);

    return orders.map((order) => this.#withTotals(order));
  }

  async findById(id, currentUser) {
    const order = currentUser.role === 'admin'
      ? await OrderRepository.findById(id)
      : await OrderRepository.findOwnedById(id, currentUser.id);

    if (!order) {
      throw new AppError('Pedido não encontrado para este usuário', 404);
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

    const startOfLastThirtyDays = new Date(startOfToday);
    startOfLastThirtyDays.setDate(startOfLastThirtyDays.getDate() - 29);

    const [today, week, lastFifteenDays, lastThirtyDays] = await Promise.all([
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfToday),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfWeek),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfLastFifteenDays),
      OrderRepository.countByCollaboratorFromDate(collaboratorId, startOfLastThirtyDays)
    ]);

    return {
      today,
      week,
      lastFifteenDays,
      lastThirtyDays
    };
  }

  async create(payload, user) {
    const data = OrderModel.validateCreate(payload);
    const submissionToken = data.submissionToken || randomUUID();
    const existingOrder = await OrderRepository.findBySubmissionToken(submissionToken);

    if (existingOrder) {
      if (existingOrder.createdById !== user.sub) {
        throw new AppError('Token de envio inválido', 409);
      }

      return this.#withTotals(existingOrder);
    }

    const customer = await CustomerRepository.findOwnedById(data.customerId, user.sub);

    if (!customer || customer.active === false) {
      throw new AppError('Invalid customer for order issuance', 422);
    }

    const items = await this.#buildItems(data.items);
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const discountPercent = Number(data.discountPercent ?? 0);
    const discountAmount = subtotalPrice * (discountPercent / 100);
    const bonusProductSnapshot = await this.#buildBonusProductSnapshot(data.bonusProductId);
    const orderData = {
      orderNumber: OrderModel.buildOrderNumber(),
      submissionToken,
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
      retentionUntil: new Date(Date.now() + env.dataRetentionDays * 86400000),
      pdfUrl: null,
      whatsappSent: false,
      sentAt: null,
      items,
      createdBy: {
        id: user.sub,
        name: user.name,
        email: user.email
      }
    };
    let order;

    try {
      order = await OrderRepository.create(orderData);
    } catch (error) {
      if (error?.code !== 'P2002') throw error;

      const concurrentlyCreated = await OrderRepository.findBySubmissionToken(submissionToken);
      if (!concurrentlyCreated || concurrentlyCreated.createdById !== user.sub) throw error;
      order = concurrentlyCreated;
    }

    return this.#withTotals(order);
  }

  async update(id, payload, currentUser) {
    const currentOrder = await this.findById(id, currentUser);
    const data = OrderModel.validateCreate(payload);
    const customer = await CustomerRepository.findOwnedById(data.customerId, currentUser.id);

    if (!customer || customer.active === false) {
      throw new AppError('Invalid customer for order issuance', 422);
    }

    const items = await this.#buildItems(data.items);
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const discountPercent = Number(data.discountPercent ?? 0);
    const discountAmount = subtotalPrice * (discountPercent / 100);
    const bonusProductSnapshot = await this.#buildBonusProductSnapshot(data.bonusProductId);
    const order = await OrderRepository.replaceItemsAndUpdate(id, {
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
        ...(currentOrder.sellerSnapshot ?? {}),
        phone: data.sellerPhone || ''
      },
      discountPercent,
      discountAmount,
      bonusProductSnapshot,
      status: 'DRAFT',
      pdfUrl: null,
      whatsappSent: false,
      sentAt: null,
      whatsappError: null
    }, items);

    await StorageService.deletePdf(currentOrder.pdfUrl);

    return this.#withTotals(order);
  }

  async generatePdf(id, currentUser, preloadedOrder = null, metrics = {}, { force = false } = {}) {
    let order;
    if (preloadedOrder) {
      order = this.#withTotals(preloadedOrder);
    } else {
      const databaseStartedAt = performance.now();
      order = await this.findById(id, currentUser);
      metrics.database_load_ms = (metrics.database_load_ms ?? 0) + performance.now() - databaseStartedAt;
    }

    if (order.pdfUrl && !force) {
      const storageStartedAt = performance.now();
      const existingPdfIsAvailable = await StorageService.pdfExists(order.pdfUrl);
      metrics.storage_ms = performance.now() - storageStartedAt;
      if (existingPdfIsAvailable) {
        metrics.reused = true;
        return order;
      }
    }

    return PdfCoordinationService.run(id, metrics, async () => {
      const buffer = await PdfService.generateOrderPdf(order, metrics);
      const customerName = order.customerSnapshot?.legalName || order.customerSnapshot?.tradeName;
      const customerFilename = filenamePart(customerName);
      const orderNumber = filenamePart(order.orderNumber, 'pedido');
      const destination = `orders/${order.id}/${customerFilename}_pedido_${orderNumber}.pdf`;
      const storageStartedAt = performance.now();
      const pdfUrl = await StorageService.uploadPdf(buffer, destination);
      metrics.storage_ms = performance.now() - storageStartedAt;

      const updateStartedAt = performance.now();
      const updatedOrder = await OrderRepository.markPdfGenerated(id, pdfUrl);
      metrics.database_update_ms = performance.now() - updateStartedAt;

      if (order.pdfUrl !== pdfUrl) {
        await StorageService.deletePdf(order.pdfUrl);
      }

      return this.#withTotals({ ...order, ...updatedOrder });
    });
  }

  async remove(id, currentUser) {
    const order = await this.findById(id, currentUser);
    await OrderRepository.archive(id);

    return order;
  }

  async clearHistory(filters = {}, currentUser) {
    const createdById = currentUser.role === 'admin'
      ? (filters.createdById || null)
      : currentUser.id;
    const result = await OrderRepository.clearHistory(createdById);

    await Promise.all(result.pdfUrls.map((pdfUrl) => StorageService.deletePdf(pdfUrl)));
    return result.count;
  }

  async #buildItems(requestedItems) {
    const items = [];
    const productIds = [...new Set(requestedItems.map((item) => item.productId).filter(Boolean))];
    const products = await ProductRepository.findByIds(productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const requestedItem of requestedItems) {
      if (!requestedItem.productId) {
        const unitQuantity = requestedItem.unitQuantity ?? requestedItem.quantity ?? 0;
        const unitPrice = Number(requestedItem.customUnitPrice ?? 0);
        const manualUnitType = requestedItem.manualUnitType === 'KG' ? 'KG' : 'UNIT';

        items.push({
          productId: null,
          code: 'MANUAL',
          name: requestedItem.manualName,
          manualUnitType,
          manualColor: requestedItem.manualColor || null,
          category: null,
          quantity: unitQuantity,
          unitQuantity,
          boxQuantity: 0,
          unitPrice,
          boxPrice: null,
          unitsPerBox: null,
          totalPrice: unitQuantity * unitPrice
        });
        continue;
      }

      const product = productsById.get(requestedItem.productId);

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
        unitsPerBox: product.unitsPerBox ?? null,
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

  #startDateForPeriod(period) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (period === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return start;
    }

    if (period === '15days') {
      start.setDate(start.getDate() - 14);
      return start;
    }

    if (period === '30days') {
      start.setDate(start.getDate() - 29);
      return start;
    }

    return undefined;
  }

  #withTotals(order) {
    const items = (order.items ?? []).map((item) => {
      const storedUnitQuantity = Number(item.unitQuantity ?? 0);
      const boxQuantity = Number(item.boxQuantity ?? 0);
      const legacyQuantity = Number(item.quantity ?? 0);
      const manualUnitType = item.manualUnitType === 'KG' ? 'KG' : 'UNIT';
      const unitQuantity = storedUnitQuantity > 0 || boxQuantity > 0
        ? storedUnitQuantity
        : legacyQuantity;
      const storedUnitPrice = Number(item.unitPrice ?? 0);
      const storedBoxPrice = Number(item.boxPrice ?? 0);
      const legacyItemWithoutPrices = Number(item.totalPrice ?? 0) === 0
        && storedUnitPrice === 0
        && storedBoxPrice === 0;
      const unitPrice = legacyItemWithoutPrices && item.product
        ? Number(item.product.unitPrice ?? 0)
        : storedUnitPrice;
      const boxPrice = legacyItemWithoutPrices && item.product
        ? Number(item.product.boxPrice ?? 0)
        : storedBoxPrice;
      const calculatedTotal = unitQuantity * unitPrice + boxQuantity * boxPrice;
      const storedTotal = Number(item.totalPrice ?? 0);

      return {
        ...item,
        manualUnitType,
        unitQuantity,
        boxQuantity,
        unitPrice,
        boxPrice: item.boxPrice === null && !item.product?.boxPrice ? null : boxPrice,
        totalPrice: calculatedTotal || storedTotal
      };
    });
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const discountPercent = Number(order.discountPercent ?? 0);
    const discountAmount = Number(order.discountAmount ?? subtotalPrice * (discountPercent / 100));
    const totalPrice = Math.max(subtotalPrice - discountAmount, 0);

    return {
      ...order,
      items,
      subtotalPrice,
      discountPercent,
      discountAmount,
      totalPrice
    };
  }
}

export default new OrderService();

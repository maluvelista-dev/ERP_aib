import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_FIELDS = new Set([
  'submissionToken', 'customerId', 'sellerPhone', 'bonusProductId', 'discountPercent',
  'deliveryDays', 'receivedTime', 'fiscalEmail', 'contactEmail', 'paymentTerm', 'notes',
  'productId', 'unitQuantity', 'boxQuantity', 'customUnitPrice', 'customBoxPrice',
  'manualProductName', 'manualUnitType', 'manualColor', 'manualQuantity', 'manualPrice'
]);

const scalarOrArray = (current, value) => current === undefined
  ? value
  : Array.isArray(current) ? [...current, value] : [current, value];

class OrderDraftService {
  fromEntries(entries) {
    if (!Array.isArray(entries) || entries.length > 1500) {
      throw new AppError('Rascunho inválido', 422);
    }

    const body = {};
    for (const entry of entries) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      const [name, rawValue] = entry;
      if (!ALLOWED_FIELDS.has(name)) continue;
      const value = String(rawValue ?? '');
      if (value.length > 2000) throw new AppError('Rascunho excede o tamanho permitido', 422);
      body[name] = scalarOrArray(body[name], value);
    }
    return body;
  }

  async save(createdById, entries, buildState) {
    const body = this.fromEntries(entries);
    const payload = buildState(body);
    return prisma.orderDraft.upsert({
      where: { createdById },
      update: { submissionToken: payload.submissionToken || null, payload },
      create: { createdById, submissionToken: payload.submissionToken || null, payload }
    });
  }

  async findForUser(createdById) {
    return prisma.orderDraft.findUnique({ where: { createdById } });
  }

  async removeForUser(createdById) {
    return prisma.orderDraft.deleteMany({ where: { createdById } });
  }
}

export default new OrderDraftService();

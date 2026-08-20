import CustomerService from '../../services/CustomerService.js';
import OrderService from '../../services/OrderService.js';
import ProductService from '../../services/ProductService.js';
import UserService from '../../services/UserService.js';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import StorageService from '../../services/StorageService.js';
import { AppError } from '../../utils/AppError.js';
import AuditService from '../../services/AuditService.js';
import OrderDraftService from '../../services/OrderDraftService.js';
import { logPdfMetrics } from '../../middlewares/pdfMetricsMiddleware.js';
import { performance } from 'node:perf_hooks';

const asArray = (value) => value === undefined ? [] : Array.isArray(value) ? value : [value];

const buildOrderPayload = (body) => {
  const productIds = asArray(body.productId);
  const unitQuantities = asArray(body.unitQuantity);
  const boxQuantities = asArray(body.boxQuantity);
  const customUnitPrices = asArray(body.customUnitPrice);
  const customBoxPrices = asArray(body.customBoxPrice);
  const items = productIds
    .map((productId, index) => ({
      productId,
      unitQuantity: Number(unitQuantities[index] ?? 0),
      boxQuantity: Number(boxQuantities[index] ?? 0),
      customUnitPrice: customUnitPrices[index] === '' || customUnitPrices[index] === undefined
        ? null
        : Number(customUnitPrices[index]),
      customBoxPrice: customBoxPrices[index] === '' || customBoxPrices[index] === undefined
        ? null
        : Number(customBoxPrices[index])
    }))
    .filter((item) => item.productId);
  const manualNames = asArray(body.manualProductName);
  const manualUnitTypes = asArray(body.manualUnitType);
  const manualColors = asArray(body.manualColor);
  const manualQuantities = asArray(body.manualQuantity);
  const manualPrices = asArray(body.manualPrice);

  manualNames.forEach((manualName, index) => {
    const unitQuantity = Number(manualQuantities[index] ?? 0);
    const manualUnitType = manualUnitTypes[index] === 'KG' ? 'KG' : 'UNIT';

    if (manualName?.trim() && unitQuantity > 0) {
      items.push({
        productId: null,
        manualName: manualName.trim(),
        manualUnitType,
        manualColor: manualColors[index]?.trim() || null,
        unitQuantity,
        boxQuantity: 0,
        customUnitPrice: manualPrices[index] === '' || manualPrices[index] === undefined
          ? null
          : Number(manualPrices[index]),
        customBoxPrice: null
      });
    }
  });

  return {
    submissionToken: body.submissionToken,
    customerId: body.customerId,
    sellerPhone: body.sellerPhone,
    receivedTime: body.receivedTime,
    deliveryDays: asArray(body.deliveryDays),
    notes: body.notes,
    fiscalEmail: body.fiscalEmail,
    contactEmail: body.contactEmail,
    paymentTerm: body.paymentTerm,
    discountPercent: body.discountPercent === '' || body.discountPercent === undefined
      ? 0
      : Number(body.discountPercent),
    bonusProductId: body.bonusProductId,
    items
  };
};

export const buildOrderFormState = (body, existingOrder = null) => {
  const productIds = asArray(body.productId);
  const unitQuantities = asArray(body.unitQuantity);
  const boxQuantities = asArray(body.boxQuantity);
  const customUnitPrices = asArray(body.customUnitPrice);
  const customBoxPrices = asArray(body.customBoxPrice);
  const manualNames = asArray(body.manualProductName);
  const manualUnitTypes = asArray(body.manualUnitType);
  const manualColors = asArray(body.manualColor);
  const manualQuantities = asArray(body.manualQuantity);
  const manualPrices = asArray(body.manualPrice);
  const catalogItems = productIds.map((productId, index) => ({
    productId,
    unitQuantity: unitQuantities[index] ?? 0,
    boxQuantity: boxQuantities[index] ?? 0,
    unitPrice: customUnitPrices[index] === '' ? null : customUnitPrices[index],
    boxPrice: customBoxPrices[index] === '' ? null : customBoxPrices[index]
  }));
  const manualItems = manualNames.map((name, index) => ({
    productId: null,
    name,
    manualUnitType: manualUnitTypes[index] === 'KG' ? 'KG' : 'UNIT',
    manualColor: manualColors[index] ?? '',
    unitQuantity: manualQuantities[index] ?? 0,
    boxQuantity: 0,
    unitPrice: manualPrices[index] === '' ? null : manualPrices[index],
    boxPrice: null
  }));

  return {
    ...(existingOrder ? { id: existingOrder.id } : {}),
    submissionToken: body.submissionToken,
    customerId: body.customerId,
    sellerPhone: body.sellerPhone,
    bonusProductId: body.bonusProductId,
    discountPercent: body.discountPercent,
    deliveryDays: asArray(body.deliveryDays),
    receivedTime: body.receivedTime,
    fiscalEmail: body.fiscalEmail,
    contactEmail: body.contactEmail,
    paymentTerm: body.paymentTerm,
    notes: body.notes,
    items: [...catalogItems, ...manualItems]
  };
};

const consumeOrderDraft = (req, mode, orderId = null) => {
  const draft = req.session.orderFormDraft;
  delete req.session.orderFormDraft;

  if (!draft || draft.mode !== mode || (orderId && draft.orderId !== orderId)) {
    return null;
  }

  return draft.order;
};

class OrderWebController {
  async openPdf(req, res) {
    const order = req.policyRecord;

    if (!order?.pdfUrl) {
      throw new AppError('PDF não encontrado', 404);
    }

    const filePath = StorageService.resolvePdfPath(order.pdfUrl);

    if (!filePath) {
      throw new AppError('Caminho do PDF inválido', 400);
    }

    await AuditService.log({ actorId: req.currentUser.id, action: 'PDF_DOWNLOADED', entityType: 'ORDER', entityId: order.id });

    const disposition = req.query.inline === '1' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${path.basename(filePath)}"`);
    await new Promise((resolve, reject) => {
      res.sendFile(filePath, (error) => {
        if (!error) {
          resolve();
          return;
        }

        reject(error.code === 'ENOENT'
          ? new AppError('Arquivo PDF não encontrado', 404)
          : error);
      });
    });
  }

  async index(req, res) {
    const canFilterByCollaborator = req.currentUser.role === 'admin';
    const selectedCollaboratorId = canFilterByCollaborator ? String(req.query.createdById ?? '') : '';
    const selectedPeriod = ['week', '15days', '30days'].includes(req.query.period)
      ? req.query.period
      : '';
    const selectedCustomerId = String(req.query.customerId ?? '');
    const selectedCustomer = selectedCustomerId
      ? await CustomerService.findById(selectedCustomerId, req.currentUser)
      : null;
    const [result, collaborators, draft] = await Promise.all([
      OrderService.paginate({
        createdById: selectedCollaboratorId,
        customerId: selectedCustomerId,
        period: selectedPeriod,
        page: req.query.page
      }, req.currentUser),
      canFilterByCollaborator ? UserService.list() : Promise.resolve([]),
      OrderDraftService.findForUser(req.currentUser.id)
    ]);

    res.render('orders/index', {
      title: 'Pedidos',
      orders: result.items,
      pagination: result.pagination,
      paginationQuery: { createdById: selectedCollaboratorId, customerId: selectedCustomerId, period: selectedPeriod },
      collaborators,
      selectedCollaboratorId,
      selectedPeriod,
      selectedCustomer,
      draft,
      canFilterByCollaborator
    });
  }

  async new(req, res) {
    const [customers, products] = await Promise.all([
      CustomerService.list(req.currentUser),
      ProductService.list({}, req.currentUser)
    ]);

    const validationDraft = consumeOrderDraft(req, 'create');
    const savedDraft = req.query.resumeDraft === '1'
      ? await OrderDraftService.findForUser(req.currentUser.id)
      : null;
    const draft = validationDraft ?? savedDraft?.payload ?? null;

    res.render('orders/new', {
      title: 'Novo Pedido',
      customers,
      products,
      order: draft,
      editMode: false,
      resumingDraft: Boolean(savedDraft),
      draftSynced: req.query.synced === '1',
      submissionToken: draft?.submissionToken || randomUUID(),
      error: res.locals.flash?.error ?? null
    });
  }

  async edit(req, res) {
    const [order, customers, products] = await Promise.all([
      OrderService.findById(req.params.id, req.currentUser),
      CustomerService.list(req.currentUser),
      ProductService.list({}, req.currentUser)
    ]);

    const draft = consumeOrderDraft(req, 'edit', req.params.id);

    res.render('orders/new', {
      title: `Editar Pedido ${order.orderNumber}`,
      customers,
      products,
      order: draft ?? order,
      editMode: true,
      resumingDraft: false,
      draftSynced: false,
      submissionToken: draft?.submissionToken || randomUUID(),
      error: res.locals.flash?.error ?? null
    });
  }

  async show(req, res) {
    const order = await OrderService.findById(req.params.id, req.currentUser);

    res.render('orders/show', {
      title: `Pedido ${order.orderNumber}`,
      order
    });
  }

  async itemRow(req, res) {
    const products = await ProductService.list({}, req.currentUser);

    res.render('orders/_item_row', {
      products
    });
  }

  manualItemRow(_req, res) {
    res.render('orders/_manual_item_row');
  }

  async productOptions(req, res) {
    const products = await ProductService.list({
      search: req.query.q
    }, req.currentUser);

    res.render('orders/_product_options', {
      products
    });
  }

  async create(req, res) {
    let order;

    try {
      order = await OrderService.create(
        buildOrderPayload(req.body),
        {
          sub: req.currentUser.id,
          name: req.currentUser.name,
          email: req.currentUser.email
        }
      );

    } catch (error) {
      const validationDetails = Array.isArray(error.details) && error.details.length
        ? ` (${error.details.join('; ')})`
        : '';
      req.session.flash = {
        error: `Não foi possível criar o pedido: ${error.message}${validationDetails}`
      };
      req.session.orderFormDraft = {
        mode: 'create',
        order: buildOrderFormState(req.body)
      };
      res.redirect('/orders/new');
      return;
    }

    await OrderDraftService.removeForUser(req.currentUser.id);
    req.session.flash = { success: `Pedido ${order.orderNumber} criado com sucesso.` };
    res.redirect('/orders?created=1');
  }

  async update(req, res) {
    let order;

    try {
      order = await OrderService.update(req.params.id, buildOrderPayload(req.body), req.currentUser);
    } catch (error) {
      const validationDetails = Array.isArray(error.details) && error.details.length
        ? ` (${error.details.join('; ')})`
        : '';
      req.session.flash = {
        error: `Não foi possível atualizar o pedido: ${error.message}${validationDetails}`
      };
      req.session.orderFormDraft = {
        mode: 'edit',
        orderId: req.params.id,
        order: buildOrderFormState(req.body, { id: req.params.id })
      };
      res.redirect(`/orders/${req.params.id}/edit`);
      return;
    }

    req.session.flash = { success: `Pedido ${order.orderNumber} atualizado. Gere um novo PDF.` };
    res.redirect(`/orders/${order.id}`);
  }

  async generatePdf(req, res) {
    const order = await OrderService.generatePdf(
      req.params.id,
      req.currentUser,
      req.policyRecord,
      req.pdfMetrics,
      { force: req.body.force === '1' }
    );
    const auditStartedAt = performance.now();
    await AuditService.log({ actorId: req.currentUser.id, action: req.pdfMetrics.reused ? 'PDF_REUSED' : 'PDF_GENERATED', entityType: 'ORDER', entityId: order.id });
    req.pdfMetrics.audit_ms = performance.now() - auditStartedAt;
    logPdfMetrics(req, order.id, req.currentUser.id);
    req.session.flash = {
      success: req.pdfMetrics.reused
        ? 'O PDF deste pedido já estava disponível.'
        : 'PDF gerado com sucesso. Use o botão Abrir PDF para visualizar.'
    };
    res.redirect(303, `/orders/${order.id}`);
  }

  async remove(req, res) {
    const order = await OrderService.remove(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: 'ORDER_ARCHIVED', entityType: 'ORDER', entityId: order.id });
    req.session.flash = { success: `Pedido ${order.orderNumber} excluído com sucesso.` };
    res.redirect('/orders');
  }

  async clearHistory(req, res) {
    const count = await OrderService.clearHistory(
      { createdById: req.body.createdById },
      req.currentUser
    );
    await AuditService.log({
      actorId: req.currentUser.id,
      action: 'ORDER_HISTORY_ARCHIVED',
      entityType: 'ORDER',
      metadata: { count, scopeUserId: req.currentUser.role === 'admin' ? (req.body.createdById || null) : req.currentUser.id }
    });
    req.session.flash = {
      success: count === 1 ? '1 pedido foi removido do histórico.' : `${count} pedidos foram removidos do histórico.`
    };
    const selectedCollaboratorId = req.currentUser.role === 'admin' && req.body.createdById
      ? String(req.body.createdById)
      : '';
    res.redirect(selectedCollaboratorId
      ? `/orders?createdById=${encodeURIComponent(selectedCollaboratorId)}`
      : '/orders');
  }

  async saveDraft(req, res) {
    const draft = await OrderDraftService.save(
      req.currentUser.id,
      req.body.entries,
      buildOrderFormState
    );
    res.status(200).json({ data: { id: draft.id, updatedAt: draft.updatedAt } });
  }

  async discardDraft(req, res) {
    await OrderDraftService.removeForUser(req.currentUser.id);
    req.session.flash = { success: 'Rascunho descartado.' };
    res.redirect('/orders');
  }
}

export default new OrderWebController();

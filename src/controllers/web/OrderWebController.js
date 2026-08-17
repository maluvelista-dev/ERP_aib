import CustomerService from '../../services/CustomerService.js';
import OrderService from '../../services/OrderService.js';
import ProductService from '../../services/ProductService.js';
import UserService from '../../services/UserService.js';

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
    .filter((item) => item.productId && item.unitQuantity + item.boxQuantity > 0);
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
    items,
    sendWhatsapp: body.sendWhatsapp === 'on'
  };
};

const buildOrderFormState = (body, existingOrder = null) => {
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
    sendWhatsapp: body.sendWhatsapp === 'on',
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
  async index(req, res) {
    const canFilterByCollaborator = req.currentUser.role === 'admin';
    const selectedCollaboratorId = canFilterByCollaborator ? String(req.query.createdById ?? '') : '';
    const selectedPeriod = ['week', '15days', '30days'].includes(req.query.period)
      ? req.query.period
      : '';
    const [orders, collaborators] = await Promise.all([
      OrderService.list({ createdById: selectedCollaboratorId, period: selectedPeriod }, req.currentUser),
      canFilterByCollaborator ? UserService.list() : Promise.resolve([])
    ]);

    res.render('orders/index', {
      title: 'Pedidos',
      orders,
      collaborators,
      selectedCollaboratorId,
      selectedPeriod,
      canFilterByCollaborator
    });
  }

  async new(req, res) {
    const [customers, products] = await Promise.all([
      CustomerService.list(req.currentUser),
      ProductService.list()
    ]);

    const draft = consumeOrderDraft(req, 'create');

    res.render('orders/new', {
      title: 'Novo Pedido',
      customers,
      products,
      order: draft,
      editMode: false,
      error: res.locals.flash?.error ?? null
    });
  }

  async edit(req, res) {
    const [order, customers, products] = await Promise.all([
      OrderService.findById(req.params.id, req.currentUser),
      CustomerService.list(req.currentUser),
      ProductService.list()
    ]);

    const draft = consumeOrderDraft(req, 'edit', req.params.id);

    res.render('orders/new', {
      title: `Editar Pedido ${order.orderNumber}`,
      customers,
      products,
      order: draft ?? order,
      editMode: true,
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

  async itemRow(_req, res) {
    const products = await ProductService.list();

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
    });

    res.render('orders/_product_options', {
      products
    });
  }

  async create(req, res) {
    try {
      const order = await OrderService.create(
        buildOrderPayload(req.body),
        {
          sub: req.currentUser.id,
          name: req.currentUser.name,
          email: req.currentUser.email
        }
      );

      req.session.flash = { success: `Pedido ${order.orderNumber} criado com sucesso.` };
      if (order.whatsappUrl) {
        res.redirect(order.whatsappUrl);
        return;
      }
      res.redirect('/orders');
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
    }
  }

  async update(req, res) {
    try {
      const order = await OrderService.update(req.params.id, buildOrderPayload(req.body), req.currentUser);
      req.session.flash = { success: `Pedido ${order.orderNumber} atualizado. Gere um novo PDF.` };
      if (order.whatsappUrl) {
        res.redirect(order.whatsappUrl);
        return;
      }
      res.redirect(`/orders/${order.id}`);
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
    }
  }

  async generatePdf(req, res) {
    const order = await OrderService.generatePdf(req.params.id, req.currentUser);
    res.redirect(order.pdfUrl);
  }

  async shareWhatsapp(req, res) {
    const order = await OrderService.generatePdfAndSendWhatsapp(req.params.id, req.currentUser);
    res.redirect(order.whatsappUrl);
  }

  async remove(req, res) {
    const order = await OrderService.remove(req.params.id, req.currentUser);
    req.session.flash = { success: `Pedido ${order.orderNumber} excluído com sucesso.` };
    res.redirect('/orders');
  }

  async clearHistory(req, res) {
    const count = await OrderService.clearHistory(
      { createdById: req.body.createdById },
      req.currentUser
    );
    req.session.flash = {
      success: count === 1 ? '1 pedido foi removido do histórico.' : `${count} pedidos foram removidos do histórico.`
    };
    res.redirect('/orders');
  }
}

export default new OrderWebController();

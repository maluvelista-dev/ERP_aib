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
  const manualQuantities = asArray(body.manualQuantity);
  const manualPrices = asArray(body.manualPrice);

  manualNames.forEach((manualName, index) => {
    const unitQuantity = Number(manualQuantities[index] ?? 0);

    if (manualName?.trim() && unitQuantity > 0) {
      items.push({
        productId: null,
        manualName: manualName.trim(),
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

class OrderWebController {
  async index(req, res) {
    const selectedCollaboratorId = req.query.createdById ?? '';
    const canFilterByCollaborator = req.currentUser.role === 'manager';
    const [orders, collaborators] = await Promise.all([
      OrderService.list({ createdById: selectedCollaboratorId }, req.currentUser),
      canFilterByCollaborator ? UserService.list() : Promise.resolve([])
    ]);

    res.render('orders/index', {
      title: 'Pedidos',
      orders,
      collaborators,
      selectedCollaboratorId,
      canFilterByCollaborator
    });
  }

  async new(_req, res) {
    const [customers, products] = await Promise.all([
      CustomerService.list(),
      ProductService.list()
    ]);

    res.render('orders/new', {
      title: 'Novo Pedido',
      customers,
      products,
      order: null,
      error: res.locals.flash?.error ?? null
    });
  }

  async edit(req, res) {
    const [order, customers, products] = await Promise.all([
      OrderService.findById(req.params.id),
      CustomerService.list(),
      ProductService.list()
    ]);

    res.render('orders/new', {
      title: `Editar Pedido ${order.orderNumber}`,
      customers,
      products,
      order,
      error: res.locals.flash?.error ?? null
    });
  }

  async show(req, res) {
    const order = await OrderService.findById(req.params.id);

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
      res.redirect('/orders');
    } catch (error) {
      const validationDetails = Array.isArray(error.details) && error.details.length
        ? ` (${error.details.join('; ')})`
        : '';
      req.session.flash = {
        error: `Não foi possível criar o pedido: ${error.message}${validationDetails}`
      };
      res.redirect('/orders/new');
    }
  }

  async update(req, res) {
    try {
      const order = await OrderService.update(req.params.id, buildOrderPayload(req.body));
      req.session.flash = { success: `Pedido ${order.orderNumber} atualizado. Gere um novo PDF.` };
      res.redirect(`/orders/${order.id}`);
    } catch (error) {
      const validationDetails = Array.isArray(error.details) && error.details.length
        ? ` (${error.details.join('; ')})`
        : '';
      req.session.flash = {
        error: `Não foi possível atualizar o pedido: ${error.message}${validationDetails}`
      };
      res.redirect(`/orders/${req.params.id}/edit`);
    }
  }

  async generatePdf(req, res) {
    const order = await OrderService.generatePdf(req.params.id);
    res.redirect(order.pdfUrl);
  }

  async remove(req, res) {
    const order = await OrderService.remove(req.params.id);
    req.session.flash = { success: `Pedido ${order.orderNumber} excluído com sucesso.` };
    res.redirect('/orders');
  }
}

export default new OrderWebController();

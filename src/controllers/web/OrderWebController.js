import CustomerService from '../../services/CustomerService.js';
import OrderService from '../../services/OrderService.js';
import ProductService from '../../services/ProductService.js';
import UserService from '../../services/UserService.js';

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
      const productIds = Array.isArray(req.body.productId) ? req.body.productId : [req.body.productId];
      const unitQuantities = Array.isArray(req.body.unitQuantity) ? req.body.unitQuantity : [req.body.unitQuantity];
      const boxQuantities = Array.isArray(req.body.boxQuantity) ? req.body.boxQuantity : [req.body.boxQuantity];
      const deliveryDays = !req.body.deliveryDays
        ? []
        : Array.isArray(req.body.deliveryDays) ? req.body.deliveryDays : [req.body.deliveryDays];
      const items = productIds
        .map((productId, index) => ({
          productId,
          unitQuantity: Number(unitQuantities[index] ?? 0),
          boxQuantity: Number(boxQuantities[index] ?? 0)
        }))
        .filter((item) => item.productId && item.unitQuantity + item.boxQuantity > 0);

      const order = await OrderService.create(
        {
          customerId: req.body.customerId,
          sellerPhone: req.body.sellerPhone,
          receivedTime: req.body.receivedTime,
          deliveryDays,
          notes: req.body.notes,
          fiscalEmail: req.body.fiscalEmail,
          contactEmail: req.body.contactEmail,
          paymentTerm: req.body.paymentTerm,
          discountPercent: req.body.applyDiscount === 'on' ? 5 : 0,
          bonusProductId: req.body.bonusProductId,
          items,
          sendWhatsapp: req.body.sendWhatsapp === 'on'
        },
        {
          sub: req.currentUser.id,
          name: req.currentUser.name,
          email: req.currentUser.email
        }
      );

      req.session.flash = { success: `Pedido ${order.orderNumber} criado com sucesso.` };
      res.redirect('/orders');
    } catch (error) {
      req.session.flash = { error: `Nao foi possivel criar o pedido: ${error.message}` };
      res.redirect('/orders/new');
    }
  }

  async generatePdf(req, res) {
    const order = await OrderService.generatePdf(req.params.id);
    req.session.flash = { success: `PDF gerado para o pedido ${order.orderNumber}.` };
    res.redirect(req.get('Referer') || '/orders');
  }
}

export default new OrderWebController();

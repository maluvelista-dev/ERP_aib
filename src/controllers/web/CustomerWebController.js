import CustomerService from '../../services/CustomerService.js';

class CustomerWebController {
  async index(req, res) {
    const customers = await CustomerService.listForUser(req.currentUser);
    res.render('customers/index', {
      title: 'Clientes',
      customers
    });
  }

  new(req, res) {
    res.render('customers/new', {
      title: 'Novo Cliente',
      customer: {},
      error: res.locals.flash?.error ?? null
    });
  }

  async edit(req, res) {
    const customer = await CustomerService.findById(req.params.id);

    res.render('customers/new', {
      title: 'Editar Cliente',
      customer,
      error: res.locals.flash?.error ?? null
    });
  }

  async create(req, res) {
    try {
      await CustomerService.create(req.body);
      req.session.flash = { success: 'Cliente criado com sucesso.' };
      res.redirect('/customers');
    } catch (error) {
      res.status(error.statusCode ?? 422).render('customers/new', {
        title: 'Novo Cliente',
        customer: req.body,
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      await CustomerService.update(req.params.id, req.body);
      req.session.flash = { success: 'Cliente atualizado com sucesso.' };
      res.redirect('/customers');
    } catch (error) {
      res.status(error.statusCode ?? 422).render('customers/new', {
        title: 'Editar Cliente',
        customer: { ...req.body, id: req.params.id },
        error: error.message
      });
    }
  }

  async activate(req, res) {
    await CustomerService.activate(req.params.id);
    req.session.flash = { success: 'Cliente reativado com sucesso.' };
    res.redirect('/customers');
  }

  async toggleActive(req, res) {
    const customer = await CustomerService.toggleActive(req.params.id);
    req.session.flash = {
      success: customer.active ? 'Cliente ativado com sucesso.' : 'Cliente desativado com sucesso.'
    };
    res.redirect('/customers');
  }
}

export default new CustomerWebController();

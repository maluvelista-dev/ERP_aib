import UserService from '../../services/UserService.js';
import OrderService from '../../services/OrderService.js';

class UserWebController {
  async index(_req, res) {
    const users = await UserService.list();

    res.render('users/index', {
      title: 'Colaboradores',
      users
    });
  }

  async show(req, res) {
    const [user, summary, orders] = await Promise.all([
      UserService.findById(req.params.id),
      OrderService.collaboratorSummary(req.params.id),
      OrderService.list({ createdById: req.params.id }, { role: 'admin' })
    ]);

    res.render('users/show', {
      title: 'Perfil do Colaborador',
      user,
      summary,
      orders
    });
  }

  async toggleActive(req, res) {
    try {
      const user = await UserService.toggleActive(req.params.id, req.currentUser);
      req.session.flash = {
        success: `${user.name} ${user.active ? 'ativado' : 'desativado'} com sucesso.`
      };
    } catch (error) {
      req.session.flash = { error: `Não foi possível alterar o colaborador: ${error.message}` };
    }

    res.redirect('/collaborators');
  }

  async approve(req, res) {
    try {
      const user = await UserService.approve(req.params.id, req.currentUser);
      req.session.flash = { success: `${user.name} foi aprovado e já pode entrar no sistema.` };
    } catch (error) {
      req.session.flash = { error: `Não foi possível aprovar o cadastro: ${error.message}` };
    }
    res.redirect('/collaborators');
  }

  async reject(req, res) {
    try {
      const user = await UserService.reject(req.params.id, req.currentUser);
      req.session.flash = { success: `O cadastro de ${user.name} foi recusado e excluído.` };
    } catch (error) {
      req.session.flash = { error: `Não foi possível recusar o cadastro: ${error.message}` };
    }
    res.redirect('/collaborators');
  }
}

export default new UserWebController();

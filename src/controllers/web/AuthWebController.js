import AuthService from '../../services/AuthService.js';

class AuthWebController {
  loginForm(req, res) {
    res.render('auth/login', {
      title: 'Login',
      error: req.session.flash?.error ?? null
    });
  }

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      req.session.userId = result.user.id;
      res.redirect('/dashboard');
    } catch (_error) {
      req.session.flash = { error: 'E-mail ou senha inválidos.' };
      res.redirect('/login');
    }
  }

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

export default new AuthWebController();

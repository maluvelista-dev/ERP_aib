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
    } catch (error) {
      const invalidCredentials = error?.statusCode === 401 || error?.statusCode === 422;

      if (!invalidCredentials) {
        console.error('Falha ao acessar o banco durante o login:', error);
      }

      req.session.flash = {
        error: invalidCredentials
          ? 'E-mail ou senha inválidos.'
          : 'O banco de dados está temporariamente indisponível. Aguarde alguns segundos e tente novamente.'
      };
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

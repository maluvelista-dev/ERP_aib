import AuthService from '../../services/AuthService.js';

class AuthWebController {
  loginForm(req, res) {
    res.render('auth/login', { title: 'Login', error: res.locals.flash?.error ?? null });
  }

  registerForm(req, res) {
    res.render('auth/register', {
      title: 'Criar cadastro',
      error: res.locals.flash?.error ?? null,
      success: res.locals.flash?.success ?? null,
      form: req.session.registrationForm ?? {}
    });
    delete req.session.registrationForm;
  }

  async register(req, res) {
    try {
      await AuthService.register(req.body);
      req.session.flash = { success: 'Cadastro enviado. Aguarde a aprovação do administrador para entrar.' };
      res.redirect('/register');
    } catch (error) {
      req.session.registrationForm = { name: req.body.name, email: req.body.email };
      req.session.flash = { error: error.message };
      res.redirect('/register');
    }
  }

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      await new Promise((resolve, reject) => {
        req.session.regenerate((error) => error ? reject(error) : resolve());
      });
      req.session.userId = result.user.id;
      await new Promise((resolve, reject) => {
        req.session.save((error) => error ? reject(error) : resolve());
      });
      res.redirect('/dashboard');
    } catch (error) {
      const invalidCredentials = error?.statusCode === 401 || error?.statusCode === 422;
      const accessMessage = error?.message === 'Registration pending approval'
        ? 'Seu cadastro ainda está aguardando aprovação do administrador.'
        : error?.message === 'User inactive'
          ? 'Seu acesso está desativado. Procure o administrador.'
          : null;

      if (!invalidCredentials && !accessMessage) {
        console.error('Falha ao acessar o banco durante o login:', error);
      }

      req.session.flash = {
        error: accessMessage ?? (invalidCredentials
          ? 'E-mail ou senha inválidos.'
          : 'O banco de dados está temporariamente indisponível. Aguarde alguns segundos e tente novamente.')
      };
      res.redirect('/login');
    }
  }

  logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  }
}

export default new AuthWebController();

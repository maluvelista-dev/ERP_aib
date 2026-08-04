import UserRepository from '../repositories/UserRepository.js';

export const loadCurrentUser = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    const user = userId ? await UserRepository.findActiveById(userId) : null;

    req.currentUser = user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          active: user.active
        }
      : null;

    res.locals.currentUser = req.currentUser;
    res.locals.flash = req.session?.flash ?? null;

    if (req.session) {
      delete req.session.flash;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWebAuth = (req, res, next) => {
  if (!req.currentUser) {
    res.redirect('/login');
    return;
  }

  next();
};

export const redirectAuthenticated = (req, res, next) => {
  if (req.currentUser) {
    res.redirect('/dashboard');
    return;
  }

  next();
};

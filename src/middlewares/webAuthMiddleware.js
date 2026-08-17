import UserRepository from '../repositories/UserRepository.js';
import { TtlCache } from '../utils/TtlCache.js';

const activeUserCache = new TtlCache({ ttlMs: 15000, maxEntries: 500 });

const serializeCurrentUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.toLowerCase(),
  active: user.active
});

export const loadCurrentUser = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    let currentUser = userId ? activeUserCache.get(userId) : null;

    if (userId && !currentUser) {
      const user = await UserRepository.findActiveById(userId);
      currentUser = user ? activeUserCache.set(userId, serializeCurrentUser(user)) : null;
    }

    req.currentUser = currentUser;

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

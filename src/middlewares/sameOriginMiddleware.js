import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export const requireSameOrigin = (req, _res, next) => {
  if (env.nodeEnv !== 'production' || SAFE_METHODS.has(req.method) || req.path.startsWith('/api/')) {
    next();
    return;
  }

  const source = req.get('origin') || req.get('referer');
  if (!source) {
    next();
    return;
  }

  try {
    const sourceUrl = new URL(source);
    const requestUrl = new URL(`${req.protocol}://${req.get('host')}`);
    const allowedOrigins = new Set([requestUrl.origin, ...env.allowedOrigins]);
    if (!allowedOrigins.has(sourceUrl.origin)) {
      next(new AppError('Origem da requisição não autorizada', 403));
      return;
    }
  } catch {
    next(new AppError('Origem da requisição inválida', 403));
    return;
  }

  next();
};

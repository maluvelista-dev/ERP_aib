import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

export const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication token was not provided', 401);
    }

    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await UserRepository.findActiveById(payload.sub);

    if (!user) {
      throw new AppError('Authenticated user is inactive or no longer exists', 401);
    }

    const role = user.role.toLowerCase();

    req.user = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role
    };
    req.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      active: user.active
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError('Authentication token is invalid or expired', 401));
  }
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthModel } from '../models/AuthModel.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

class AuthService {
  async login(payload) {
    const data = AuthModel.validateLogin(payload);
    const user = await UserRepository.findByEmail(data.email);

    if (!user || user.active === false) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 401);
    }

    const role = user.role.toLowerCase();
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    };
  }
}

export default new AuthService();

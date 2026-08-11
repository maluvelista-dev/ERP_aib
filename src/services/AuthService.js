import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthModel } from '../models/AuthModel.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

class AuthService {
  async login(payload) {
    const data = AuthModel.validateLogin(payload);
    const user = await this.#findUserWithWakeRetry(data.email);

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

  async #findUserWithWakeRetry(email) {
    const retryDelays = [2000, 4000, 6000, 8000];

    for (let attempt = 0; ; attempt += 1) {
      try {
        return await UserRepository.findByEmail(email);
      } catch (error) {
        if (attempt >= retryDelays.length || !this.#isTransientDatabaseError(error)) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
      }
    }
  }

  #isTransientDatabaseError(error) {
    const code = error?.code ?? error?.cause?.code;
    const message = String(error?.message ?? '').toLowerCase();

    return ['P1001', 'P2039', '45028', 'ECONNREFUSED', 'ETIMEDOUT'].includes(String(code))
      || message.includes("can't reach database server")
      || message.includes('connection timeout')
      || message.includes('pool timeout')
      || message.includes('failed to retrieve a connection from pool')
      || message.includes('failed to create socket')
      || message.includes('econnrefused');
  }
}

export default new AuthService();

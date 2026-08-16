import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { UserModel } from '../models/UserModel.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.toLowerCase(),
  active: user.active,
  approvalStatus: user.approvalStatus.toLowerCase(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

class UserService {
  async register(payload) {
    const data = UserModel.validateRegistration(payload);
    const existingUser = await UserRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('Já existe um cadastro com este e-mail', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, env.bcryptSaltRounds);
    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'seller',
      active: false,
      approvalStatus: 'PENDING'
    });

    return serializeUser(user);
  }

  async list() {
    const users = await UserRepository.findAll(100);
    return users
      .filter((user) => user.role === 'SELLER')
      .map(serializeUser);
  }

  async findById(id) {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return serializeUser(user);
  }

  async create(payload) {
    const data = UserModel.validateCreate(payload);
    const existingUser = await UserRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, env.bcryptSaltRounds);
    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      active: data.active
    });

    return serializeUser(user);
  }

  async update(id, payload) {
    await this.findById(id);
    const data = UserModel.validateUpdate(payload);
    const nextData = { ...data };

    if (nextData.email) {
      const existingUser = await UserRepository.findByEmail(nextData.email);

      if (existingUser && existingUser.id !== id) {
        throw new AppError('A user with this email already exists', 409);
      }
    }

    if (nextData.password) {
      nextData.passwordHash = await bcrypt.hash(nextData.password, env.bcryptSaltRounds);
      delete nextData.password;
    }

    const user = await UserRepository.update(id, nextData);
    return serializeUser(user);
  }

  async remove(id, currentUser) {
    if (currentUser.id === id) {
      throw new AppError('You cannot deactivate your own user', 422);
    }

    const user = await UserRepository.softDelete(id);
    return serializeUser(user);
  }

  async activate(id, currentUser) {
    if (currentUser.id === id) {
      throw new AppError('You cannot activate your own user through this action', 422);
    }

    const user = await UserRepository.update(id, { active: true });
    return serializeUser(user);
  }

  async toggleActive(id, currentUser) {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (currentUser.id === id) {
      throw new AppError('You cannot change your own active status', 422);
    }

    const updatedUser = await UserRepository.update(id, { active: !user.active });
    return serializeUser(updatedUser);
  }

  async approve(id, currentUser) {
    const user = await UserRepository.findById(id);

    if (!user || user.role !== 'SELLER') {
      throw new AppError('Cadastro de colaborador não encontrado', 404);
    }

    if (currentUser.id === id) {
      throw new AppError('Você não pode aprovar a própria conta', 422);
    }

    const updatedUser = await UserRepository.update(id, {
      approvalStatus: 'APPROVED',
      active: true
    });
    return serializeUser(updatedUser);
  }

  async reject(id, currentUser) {
    const user = await UserRepository.findById(id);

    if (!user || user.role !== 'SELLER' || user.approvalStatus !== 'PENDING') {
      throw new AppError('Cadastro pendente não encontrado', 404);
    }

    if (currentUser.id === id) {
      throw new AppError('Você não pode recusar a própria conta', 422);
    }

    await UserRepository.delete(id);
    return user;
  }
}

export default new UserService();

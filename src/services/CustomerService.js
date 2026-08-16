import { CustomerModel } from '../models/CustomerModel.js';
import CustomerRepository from '../repositories/CustomerRepository.js';
import { AppError } from '../utils/AppError.js';

class CustomerService {
  async list(currentUser, options = {}) {
    return CustomerRepository.findForOwner(currentUser.id, options);
  }

  async listForUser(currentUser) {
    return this.list(currentUser, { includeInactive: currentUser.role === 'admin' });
  }

  async findById(id, currentUser) {
    const customer = await CustomerRepository.findOwnedById(id, currentUser.id);

    if (!customer) {
      throw new AppError('Cliente não encontrado para este usuário', 404);
    }

    return customer;
  }

  async create(payload, currentUser) {
    const data = CustomerModel.validateCreate(payload);
    const cnpj = CustomerModel.normalizeCnpj(data.cnpj);
    const existing = cnpj ? await CustomerRepository.findByCnpj(cnpj, currentUser.id) : null;

    if (existing) {
      throw new AppError('Já existe um cliente com este CPF/CNPJ no seu cadastro', 409);
    }

    return CustomerRepository.create({
      ...this.#nullifyEmptyFields(data),
      cnpj,
      createdById: currentUser.id,
      active: true,
      searchKeywords: CustomerModel.buildSearchKeywords({ ...data, cnpj })
    });
  }

  async update(id, payload, currentUser) {
    await this.findById(id, currentUser);
    const data = CustomerModel.validateUpdate(payload);
    const cnpj = CustomerModel.normalizeCnpj(data.cnpj);
    const existing = cnpj ? await CustomerRepository.findByCnpj(cnpj, currentUser.id) : null;

    if (existing && existing.id !== id) {
      throw new AppError('Já existe um cliente com este CPF/CNPJ no seu cadastro', 409);
    }

    return CustomerRepository.update(id, {
      ...this.#nullifyEmptyFields(data),
      cnpj,
      searchKeywords: CustomerModel.buildSearchKeywords({ ...data, cnpj })
    });
  }

  async activate(id, currentUser) {
    const customer = await this.findById(id, currentUser);
    return customer.active ? customer : CustomerRepository.activate(id);
  }

  async toggleActive(id, currentUser) {
    const customer = await this.findById(id, currentUser);
    return customer.active
      ? CustomerRepository.deactivate(id)
      : CustomerRepository.activate(id);
  }

  async remove(id, currentUser) {
    await this.findById(id, currentUser);
    return CustomerRepository.softDelete(id);
  }

  #nullifyEmptyFields(data) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
    );
  }
}

export default new CustomerService();

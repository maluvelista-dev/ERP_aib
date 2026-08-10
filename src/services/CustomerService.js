import { CustomerModel } from '../models/CustomerModel.js';
import CustomerRepository from '../repositories/CustomerRepository.js';
import { AppError } from '../utils/AppError.js';

class CustomerService {
  async list() {
    return CustomerRepository.findActive();
  }
  async activate(id) {
  const customer = await CustomerRepository.findAnyById(id);

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  if (customer.active) {
    return customer;
  }

  return CustomerRepository.activate(id);
}

  async toggleActive(id) {
    const customer = await CustomerRepository.findAnyById(id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    if (customer.active) {
      return CustomerRepository.deactivate(id);
    }

    return CustomerRepository.activate(id);
  }
  async findById(id) {
    const customer = await CustomerRepository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  async create(payload) {
    const data = CustomerModel.validateCreate(payload);
    const cnpj = CustomerModel.normalizeCnpj(data.cnpj);
    const existing = cnpj ? await CustomerRepository.findByCnpj(cnpj) : null;

    if (existing) {
      throw new AppError('A customer with this CNPJ already exists', 409);
    }

    return CustomerRepository.create({
      ...this.#nullifyEmptyFields(data),
      cnpj,
      active: true,
      searchKeywords: CustomerModel.buildSearchKeywords({ ...data, cnpj })
    });
  }

  async update(id, payload) {
    await this.findById(id);
    const data = CustomerModel.validateUpdate(payload);
    const cnpj = CustomerModel.normalizeCnpj(data.cnpj);
    const existing = cnpj ? await CustomerRepository.findByCnpj(cnpj) : null;

    if (existing && existing.id !== id) {
      throw new AppError('A customer with this CNPJ already exists', 409);
    }

    return CustomerRepository.update(id, {
      ...this.#nullifyEmptyFields(data),
      cnpj,
      searchKeywords: CustomerModel.buildSearchKeywords({ ...data, cnpj })
    });
  }

  async remove(id) {
    await this.findById(id);
    return CustomerRepository.softDelete(id);
  }
  async listForUser(user) {
  if (user.role === 'admin') {
    return CustomerRepository.findAll();
  }

  return CustomerRepository.findActive();
}

  #nullifyEmptyFields(data) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
    );
  }
}

export default new CustomerService();

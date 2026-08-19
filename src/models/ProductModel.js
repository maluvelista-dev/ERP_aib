import Joi from 'joi';
import { BaseModel } from './BaseModel.js';
import { AppError } from '../utils/AppError.js';

const productSchema = Joi.object({
  code: Joi.string().min(2).required(),
  name: Joi.string().min(2).required(),
  categoryId: Joi.string().allow('', null),
  category: Joi.string().min(2).default('Velas Comuns'),
  description: Joi.string().allow('', null),
  unitPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).default(0),
  boxPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).allow(null),
  unitsPerBox: Joi.alternatives().try(Joi.number().integer().min(1), Joi.string().allow('', null)).allow(null),
  active: Joi.boolean().default(true)
});

export class ProductModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(productSchema, payload);
  }

  static validateUpdate(payload) {
    return this.validate(productSchema, payload);
  }

  static normalizeCode(code) {
    return code.trim().toUpperCase();
  }

  static normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ');
  }

  static normalizeMoney(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value) || value < 0) {
        throw new AppError('Informe um preço válido', 422);
      }

      return value;
    }

    const sanitized = String(value).trim().replace(/[^\d,.-]/g, '');
    if (!/\d/.test(sanitized)) {
      throw new AppError('Informe um preço válido', 422);
    }

    const decimalSeparator = sanitized.lastIndexOf(',') > sanitized.lastIndexOf('.') ? ',' : '.';
    const normalized = decimalSeparator === ','
      ? sanitized.replace(/\./g, '').replace(',', '.')
      : sanitized.replace(/,/g, '');
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount < 0) {
      throw new AppError('Informe um preço válido', 422);
    }

    return amount;
  }
}

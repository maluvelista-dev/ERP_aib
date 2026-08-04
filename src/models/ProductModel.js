import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const productSchema = Joi.object({
  code: Joi.string().min(2).required(),
  name: Joi.string().min(2).required(),
  categoryId: Joi.string().allow('', null),
  category: Joi.string().min(2).default('Velas Comuns'),
  description: Joi.string().allow('', null),
  unitPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).default(0),
  boxPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).allow(null),
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
    return code.toUpperCase();
  }

  static normalizeMoney(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    return Number(value.replace(/\./g, '').replace(',', '.'));
  }
}

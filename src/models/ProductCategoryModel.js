import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const categorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().min(2),
  description: Joi.string().allow('', null),
  active: Joi.boolean().default(true)
});

export class ProductCategoryModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(categorySchema, payload);
  }

  static normalizeSlug(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const customerSchema = Joi.object({
  cnpj: Joi.string().min(14).max(18).required(),
  legalName: Joi.string().min(2).required(),
  tradeName: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  whatsapp: Joi.string().min(10).required(),
  email: Joi.string().email().allow('', null),
  zipCode: Joi.string().allow('', null),
  street: Joi.string().required(),
  number: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().length(2).uppercase().required()
});

export class CustomerModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(customerSchema, payload);
  }

  static validateUpdate(payload) {
    return this.validate(customerSchema, payload);
  }

  static normalizeCnpj(cnpj) {
    return cnpj.replace(/\D/g, '');
  }

  static buildSearchKeywords(customer) {
    return [customer.cnpj, customer.legalName, customer.tradeName, customer.email]
      .filter(Boolean)
      .flatMap((value) => value.toLowerCase().split(/\s+/))
      .filter(Boolean);
  }
}

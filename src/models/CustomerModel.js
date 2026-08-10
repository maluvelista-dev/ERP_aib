import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const customerSchema = Joi.object({
  cnpj: Joi.string().min(14).max(18).allow('', null),
  legalName: Joi.string().min(2).allow('', null),
  tradeName: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  whatsapp: Joi.string().min(10).allow('', null),
  email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
  zipCode: Joi.string().allow('', null),
  street: Joi.string().allow('', null),
  number: Joi.string().allow('', null),
  district: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().length(2).uppercase().allow('', null)
});

export class CustomerModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(customerSchema, payload);
  }

  static validateUpdate(payload) {
    return this.validate(customerSchema, payload);
  }

  static normalizeCnpj(cnpj) {
    return cnpj ? cnpj.replace(/\D/g, '') : null;
  }

  static buildSearchKeywords(customer) {
    return [customer.cnpj, customer.legalName, customer.tradeName, customer.email]
      .filter(Boolean)
      .flatMap((value) => value.toLowerCase().split(/\s+/))
      .filter(Boolean);
  }
}

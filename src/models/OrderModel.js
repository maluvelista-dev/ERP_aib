import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  sellerPhone: Joi.string().allow('', null),
  receivedTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).allow('', null),
  deliveryDays: Joi.array()
    .items(Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'))
    .unique()
    .default([]),
  notes: Joi.string().trim().max(1000).allow('', null),
  fiscalEmail: Joi.string().trim().email({ tlds: { allow: false } }).max(191).allow('', null),
  contactEmail: Joi.string().trim().email({ tlds: { allow: false } }).max(191).allow('', null),
  paymentTerm: Joi.string().trim().max(191).allow('', null),
  discountPercent: Joi.number().valid(0, 5).default(0),
  bonusProductId: Joi.string().allow('', null),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1),
        unitQuantity: Joi.number().integer().min(0).default(0),
        boxQuantity: Joi.number().integer().min(0).default(0)
      })
        .or('quantity', 'unitQuantity', 'boxQuantity')
        .custom((item, helpers) => {
          const unitQuantity = Number(item.unitQuantity ?? item.quantity ?? 0);
          const boxQuantity = Number(item.boxQuantity ?? 0);

          if (unitQuantity + boxQuantity < 1) {
            return helpers.error('any.invalid');
          }

          return item;
        })
    )
    .min(1)
    .required(),
  sendWhatsapp: Joi.boolean().default(false)
});

export class OrderModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(orderSchema, payload);
  }

  static buildOrderNumber() {
    return `#${Date.now().toString().slice(-6)}`;
  }
}

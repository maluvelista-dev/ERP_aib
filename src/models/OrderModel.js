import Joi from 'joi';
import { randomInt } from 'node:crypto';
import { BaseModel } from './BaseModel.js';

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  sellerPhone: Joi.string().allow('', null),
  receivedTime: Joi.string()
    .valid('BUSINESS_HOURS', 'MORNING', 'AFTERNOON')
    .allow('', null),
  deliveryDays: Joi.array()
    .items(Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'))
    .unique()
    .default([]),
  notes: Joi.string().trim().max(1000).allow('', null),
  fiscalEmail: Joi.string().trim().email({ tlds: { allow: false } }).max(191).allow('', null)
    .messages({ 'string.email': 'O e-mail para documentos fiscais é inválido' }),
  contactEmail: Joi.string().trim().email({ tlds: { allow: false } }).max(191).allow('', null)
    .messages({ 'string.email': 'O e-mail de contato é inválido' }),
  paymentTerm: Joi.string().trim().max(191).allow('', null),
  discountPercent: Joi.number().min(0).max(100).precision(2).default(0),
  bonusProductId: Joi.string().allow('', null),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().allow('', null),
        manualName: Joi.string().trim().max(191).allow('', null),
        manualUnitType: Joi.string().valid('UNIT', 'KG').default('UNIT'),
        manualColor: Joi.string().trim().max(80).allow('', null),
        quantity: Joi.number().integer().min(1),
        unitQuantity: Joi.number().integer().min(0).default(0),
        boxQuantity: Joi.number().integer().min(0).default(0),
        customUnitPrice: Joi.number().min(0).precision(2).allow(null),
        customBoxPrice: Joi.number().min(0).precision(2).allow(null)
      })
        .or('quantity', 'unitQuantity', 'boxQuantity')
        .custom((item, helpers) => {
          const unitQuantity = Number(item.unitQuantity ?? item.quantity ?? 0);
          const boxQuantity = Number(item.boxQuantity ?? 0);

          if (unitQuantity + boxQuantity < 1) {
            return helpers.error('any.invalid');
          }

          if (!item.productId && !item.manualName) {
            return helpers.message({ custom: 'Informe um produto do catálogo ou o nome do produto manual' });
          }

          if (!item.productId && (item.customUnitPrice === null || item.customUnitPrice === undefined)) {
            return helpers.message({ custom: 'Informe o preço do produto manual' });
          }

          if (!item.productId && item.manualUnitType === 'KG' && unitQuantity <= 0) {
            return helpers.message({ custom: 'Informe a quantidade em kg do produto manual' });
          }

          return item;
        })
    )
    .min(1)
    .required()
    .messages({ 'array.min': 'Adicione ao menos um produto com quantidade maior que zero' }),
  sendWhatsapp: Joi.boolean().default(false)
});

export class OrderModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(orderSchema, payload);
  }

  static buildOrderNumber() {
    const timePart = Date.now().toString().slice(-7);
    const randomPart = randomInt(100, 1000);
    return `#${timePart}${randomPart}`;
  }
}

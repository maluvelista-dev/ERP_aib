import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const roleSchema = Joi.string().valid('admin', 'manager', 'seller').default('seller');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: roleSchema,
  active: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  role: roleSchema,
  active: Joi.boolean()
}).min(1);

export class UserModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(createUserSchema, payload);
  }

  static validateUpdate(payload) {
    return this.validate(updateUserSchema, payload);
  }
}

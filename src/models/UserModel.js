import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const roleSchema = Joi.string().valid('admin', 'seller').default('seller');

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

const registrationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().max(191).required(),
  password: Joi.string().min(8).max(128).required()
});

export class UserModel extends BaseModel {
  static validateCreate(payload) {
    return this.validate(createUserSchema, payload);
  }

  static validateUpdate(payload) {
    return this.validate(updateUserSchema, payload);
  }

  static validateRegistration(payload) {
    return this.validate(registrationSchema, payload);
  }
}

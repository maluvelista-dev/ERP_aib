import Joi from 'joi';
import { BaseModel } from './BaseModel.js';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export class AuthModel extends BaseModel {
  static validateLogin(payload) {
    return this.validate(loginSchema, payload);
  }
}

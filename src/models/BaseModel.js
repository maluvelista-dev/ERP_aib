import { AppError } from '../utils/AppError.js';

export class BaseModel {
  static validate(schema, payload) {
    const { value, error } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail) => detail.message);
      throw new AppError('Invalid payload', 422, details);
    }

    return value;
  }
}

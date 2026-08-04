import { AppError } from '../utils/AppError.js';

export const webAuthorize = (PolicyClass, action, resolveRecord = null) => {
  return async (req, res, next) => {
    try {
      const record = resolveRecord ? await resolveRecord(req) : null;
      const policy = new PolicyClass(req.currentUser, record);

      if (typeof policy[action] !== 'function' || !policy[action]()) {
        throw new AppError('You are not authorized to perform this action', 403);
      }

      req.policyRecord = record;
      next();
    } catch (error) {
      next(error);
    }
  };
};

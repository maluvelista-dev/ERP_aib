import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

class AuthController {
  login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    return ok(res, result);
  });

  me = asyncHandler(async (req, res) => {
    return ok(res, { user: req.currentUser });
  });
}

export default new AuthController();

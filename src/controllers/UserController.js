import UserService from '../services/UserService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';

class UserController {
  list = asyncHandler(async (_req, res) => {
    return ok(res, await UserService.list());
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await UserService.findById(req.params.id));
  });

  create = asyncHandler(async (req, res) => {
    return created(res, await UserService.create(req.body));
  });

  update = asyncHandler(async (req, res) => {
    return ok(res, await UserService.update(req.params.id, req.body));
  });

  remove = asyncHandler(async (req, res) => {
    return ok(res, await UserService.remove(req.params.id, req.currentUser));
  });

  activate = asyncHandler(async (req, res) => {
    return ok(res, await UserService.activate(req.params.id, req.currentUser));
  });

  toggleActive = asyncHandler(async (req, res) => {
    return ok(res, await UserService.toggleActive(req.params.id, req.currentUser));
  });
}

export default new UserController();

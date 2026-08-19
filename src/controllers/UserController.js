import UserService from '../services/UserService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import AuditService from '../services/AuditService.js';

class UserController {
  list = asyncHandler(async (_req, res) => {
    return ok(res, await UserService.list());
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await UserService.findById(req.params.id));
  });

  create = asyncHandler(async (req, res) => {
    const user = await UserService.create(req.body);
    await AuditService.log({ actorId: req.currentUser.id, action: 'USER_CREATED', entityType: 'USER', entityId: user.id });
    return created(res, user);
  });

  update = asyncHandler(async (req, res) => {
    const user = await UserService.update(req.params.id, req.body);
    await AuditService.log({ actorId: req.currentUser.id, action: 'USER_UPDATED', entityType: 'USER', entityId: user.id });
    return ok(res, user);
  });

  remove = asyncHandler(async (req, res) => {
    const user = await UserService.remove(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: 'USER_DEACTIVATED', entityType: 'USER', entityId: user.id });
    return ok(res, user);
  });

  activate = asyncHandler(async (req, res) => {
    const user = await UserService.activate(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: 'USER_ACTIVATED', entityType: 'USER', entityId: user.id });
    return ok(res, user);
  });

  toggleActive = asyncHandler(async (req, res) => {
    const user = await UserService.toggleActive(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: user.active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', entityType: 'USER', entityId: user.id });
    return ok(res, user);
  });
}

export default new UserController();

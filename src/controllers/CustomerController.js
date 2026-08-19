import CustomerService from '../services/CustomerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import AuditService from '../services/AuditService.js';

class CustomerController {
  list = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.list(req.currentUser));
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.findById(req.params.id, req.currentUser));
  });

  create = asyncHandler(async (req, res) => {
    return created(res, await CustomerService.create(req.body, req.currentUser));
  });

  update = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.update(req.params.id, req.body, req.currentUser));
  });

  remove = asyncHandler(async (req, res) => {
    const customer = await CustomerService.remove(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: 'CUSTOMER_ARCHIVED', entityType: 'CUSTOMER', entityId: customer.id });
    return ok(res, customer);
  });
  activate = asyncHandler(async (req, res) => {
  return ok(res, await CustomerService.activate(req.params.id, req.currentUser));
});

  toggleActive = asyncHandler(async (req, res) => {
    const customer = await CustomerService.toggleActive(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: customer.active ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED', entityType: 'CUSTOMER', entityId: customer.id });
    return ok(res, customer);
  });
}

export default new CustomerController();

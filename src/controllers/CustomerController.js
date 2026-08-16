import CustomerService from '../services/CustomerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';

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
    return ok(res, await CustomerService.remove(req.params.id, req.currentUser));
  });
  activate = asyncHandler(async (req, res) => {
  return ok(res, await CustomerService.activate(req.params.id, req.currentUser));
});

  toggleActive = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.toggleActive(req.params.id, req.currentUser));
  });
}

export default new CustomerController();

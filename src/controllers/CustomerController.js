import CustomerService from '../services/CustomerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';

class CustomerController {
  list = asyncHandler(async (_req, res) => {
    return ok(res, await CustomerService.list());
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.findById(req.params.id));
  });

  create = asyncHandler(async (req, res) => {
    return created(res, await CustomerService.create(req.body));
  });

  update = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.update(req.params.id, req.body));
  });

  remove = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.remove(req.params.id));
  });
  activate = asyncHandler(async (req, res) => {
  return ok(res, await CustomerService.activate(req.params.id));
});

  toggleActive = asyncHandler(async (req, res) => {
    return ok(res, await CustomerService.toggleActive(req.params.id));
  });
}

export default new CustomerController();

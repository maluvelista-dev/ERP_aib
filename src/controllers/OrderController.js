import OrderService from '../services/OrderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import AuditService from '../services/AuditService.js';

class OrderController {
  list = asyncHandler(async (req, res) => {
    return ok(res, await OrderService.list(
      { createdById: req.query.createdById },
      req.currentUser
    ));
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await OrderService.findById(req.params.id, req.currentUser));
  });

  create = asyncHandler(async (req, res) => {
    return created(res, await OrderService.create(req.body, req.user));
  });

  generatePdf = asyncHandler(async (req, res) => {
    const order = await OrderService.generatePdf(req.params.id, req.currentUser);
    await AuditService.log({ actorId: req.currentUser.id, action: 'PDF_GENERATED', entityType: 'ORDER', entityId: order.id });
    return ok(res, order);
  });

}

export default new OrderController();

import OrderService from '../services/OrderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';

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
    return ok(res, await OrderService.generatePdf(req.params.id, req.currentUser));
  });

  sendWhatsapp = asyncHandler(async (req, res) => {
    return ok(res, await OrderService.generatePdfAndSendWhatsapp(req.params.id, req.currentUser));
  });
}

export default new OrderController();

import ProductService from '../services/ProductService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import AuditService from '../services/AuditService.js';

class ProductController {
  list = asyncHandler(async (req, res) => {
    return ok(res, await ProductService.list({
      categoryId: req.query.categoryId,
      search: req.query.q
    }));
  });

  findById = asyncHandler(async (req, res) => {
    return ok(res, await ProductService.findById(req.params.id));
  });

  create = asyncHandler(async (req, res) => {
    const product = await ProductService.create(req.body);
    await AuditService.log({ actorId: req.currentUser.id, action: 'PRODUCT_CREATED', entityType: 'PRODUCT', entityId: product.id });
    return created(res, product);
  });

  update = asyncHandler(async (req, res) => {
    const product = await ProductService.update(req.params.id, req.body);
    await AuditService.log({ actorId: req.currentUser.id, action: 'PRODUCT_UPDATED', entityType: 'PRODUCT', entityId: product.id });
    return ok(res, product);
  });

  remove = asyncHandler(async (req, res) => {
    const product = await ProductService.remove(req.params.id);
    await AuditService.log({ actorId: req.currentUser.id, action: 'PRODUCT_ARCHIVED', entityType: 'PRODUCT', entityId: product.id });
    return ok(res, product);
  });
}

export default new ProductController();

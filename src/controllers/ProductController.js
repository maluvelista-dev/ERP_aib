import ProductService from '../services/ProductService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';

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
    return created(res, await ProductService.create(req.body));
  });

  update = asyncHandler(async (req, res) => {
    return ok(res, await ProductService.update(req.params.id, req.body));
  });

  remove = asyncHandler(async (req, res) => {
    return ok(res, await ProductService.remove(req.params.id));
  });
}

export default new ProductController();

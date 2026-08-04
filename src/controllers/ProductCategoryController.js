import ProductCategoryService from '../services/ProductCategoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

class ProductCategoryController {
  list = asyncHandler(async (_req, res) => {
    return ok(res, await ProductCategoryService.list());
  });
}

export default new ProductCategoryController();

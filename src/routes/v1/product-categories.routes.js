import { Router } from 'express';
import ProductCategoryController from '../../controllers/ProductCategoryController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { ProductCategoryPolicy } from '../../policies/ProductCategoryPolicy.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(ProductCategoryPolicy, 'index'), ProductCategoryController.list);

export default router;

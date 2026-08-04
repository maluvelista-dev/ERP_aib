import { Router } from 'express';
import ProductController from '../../controllers/ProductController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { ProductPolicy } from '../../policies/ProductPolicy.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(ProductPolicy, 'index'), ProductController.list);
router.get('/:id', authorize(ProductPolicy, 'show'), ProductController.findById);
router.post('/', authorize(ProductPolicy, 'create'), ProductController.create);
router.put('/:id', authorize(ProductPolicy, 'update'), ProductController.update);
router.delete('/:id', authorize(ProductPolicy, 'destroy'), ProductController.remove);

export default router;

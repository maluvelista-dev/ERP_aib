import { Router } from 'express';
import CustomerController from '../../controllers/CustomerController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { CustomerPolicy } from '../../policies/CustomerPolicy.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(CustomerPolicy, 'index'), CustomerController.list);
router.get('/:id', authorize(CustomerPolicy, 'show'), CustomerController.findById);
router.post('/', authorize(CustomerPolicy, 'create'), CustomerController.create);
router.put('/:id', authorize(CustomerPolicy, 'update'), CustomerController.update);
router.delete('/:id', authorize(CustomerPolicy, 'destroy'), CustomerController.remove);
router.patch( '/:id/activate', authorize(CustomerPolicy, 'activate'), CustomerController.activate);
router.patch('/:id/toggle-active', authorize(CustomerPolicy, 'toggleActive'), CustomerController.toggleActive);
export default router;

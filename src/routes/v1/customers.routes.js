import { Router } from 'express';
import CustomerController from '../../controllers/CustomerController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { CustomerPolicy } from '../../policies/CustomerPolicy.js';
import CustomerRepository from '../../repositories/CustomerRepository.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(CustomerPolicy, 'index'), CustomerController.list);
router.get('/:id', authorize(CustomerPolicy, 'show', (req) => CustomerRepository.findAnyById(req.params.id)), CustomerController.findById);
router.post('/', authorize(CustomerPolicy, 'create'), CustomerController.create);
router.put('/:id', authorize(CustomerPolicy, 'update', (req) => CustomerRepository.findAnyById(req.params.id)), CustomerController.update);
router.delete('/:id', authorize(CustomerPolicy, 'destroy', (req) => CustomerRepository.findAnyById(req.params.id)), CustomerController.remove);
router.patch('/:id/activate', authorize(CustomerPolicy, 'activate', (req) => CustomerRepository.findAnyById(req.params.id)), CustomerController.activate);
router.patch('/:id/toggle-active', authorize(CustomerPolicy, 'toggleActive', (req) => CustomerRepository.findAnyById(req.params.id)), CustomerController.toggleActive);
export default router;

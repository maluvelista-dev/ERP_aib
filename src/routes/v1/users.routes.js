import { Router } from 'express';
import UserController from '../../controllers/UserController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { UserPolicy } from '../../policies/UserPolicy.js';
import UserRepository from '../../repositories/UserRepository.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(UserPolicy, 'index'), UserController.list);
router.get(
  '/:id',
  authorize(UserPolicy, 'show', (req) => UserRepository.findById(req.params.id)),
  UserController.findById
);
router.post('/', authorize(UserPolicy, 'create'), UserController.create);
router.put(
  '/:id',
  authorize(UserPolicy, 'update', (req) => UserRepository.findById(req.params.id)),
  UserController.update
);
router.delete(
  '/:id',
  authorize(UserPolicy, 'destroy', (req) => UserRepository.findById(req.params.id)),
  UserController.remove
);
router.post(
  '/:id/activate',
  authorize(UserPolicy, 'activate', (req) => UserRepository.findById(req.params.id)),
  UserController.activate
);
router.post(
  '/:id/toggle-active',
  authorize(UserPolicy, 'toggleActive', (req) => UserRepository.findById(req.params.id)),
  UserController.toggleActive
);

export default router;

import { Router } from 'express';
import OrderController from '../../controllers/OrderController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { OrderPolicy } from '../../policies/OrderPolicy.js';
import OrderRepository from '../../repositories/OrderRepository.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize(OrderPolicy, 'index'), OrderController.list);
router.get('/:id', authorize(OrderPolicy, 'show', (req) => OrderRepository.findById(req.params.id)), OrderController.findById);
router.post('/', authorize(OrderPolicy, 'create'), OrderController.create);
router.post('/:id/pdf', authorize(OrderPolicy, 'generatePdf', (req) => OrderRepository.findById(req.params.id)), OrderController.generatePdf);
router.post('/:id/send-whatsapp', authorize(OrderPolicy, 'sendWhatsapp', (req) => OrderRepository.findById(req.params.id)), OrderController.sendWhatsapp);
router.post('/:id/resend-whatsapp', authorize(OrderPolicy, 'sendWhatsapp', (req) => OrderRepository.findById(req.params.id)), OrderController.sendWhatsapp);

export default router;

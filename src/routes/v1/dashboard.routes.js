import { Router } from 'express';
import DashboardController from '../../controllers/DashboardController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';
import { DashboardPolicy } from '../../policies/DashboardPolicy.js';

const router = Router();

router.get('/', authMiddleware, authorize(DashboardPolicy, 'show'), DashboardController.summary);

export default router;

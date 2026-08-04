import { Router } from 'express';
import authRoutes from './auth.routes.js';
import customersRoutes from './customers.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import ordersRoutes from './orders.routes.js';
import productCategoriesRoutes from './product-categories.routes.js';
import productsRoutes from './products.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customersRoutes);
router.use('/product-categories', productCategoriesRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);

export default router;

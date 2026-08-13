import { Router } from 'express';
import AuthWebController from '../../controllers/web/AuthWebController.js';
import CustomerWebController from '../../controllers/web/CustomerWebController.js';
import DashboardWebController from '../../controllers/web/DashboardWebController.js';
import OrderWebController from '../../controllers/web/OrderWebController.js';
import ProductWebController from '../../controllers/web/ProductWebController.js';
import UserWebController from '../../controllers/web/UserWebController.js';
import { loadCurrentUser, redirectAuthenticated, requireWebAuth } from '../../middlewares/webAuthMiddleware.js';
import { webAuthorize } from '../../middlewares/webAuthorizeMiddleware.js';
import { CustomerPolicy } from '../../policies/CustomerPolicy.js';
import { DashboardPolicy } from '../../policies/DashboardPolicy.js';
import { OrderPolicy } from '../../policies/OrderPolicy.js';
import { ProductPolicy } from '../../policies/ProductPolicy.js';
import { UserPolicy } from '../../policies/UserPolicy.js';
import UserRepository from '../../repositories/UserRepository.js';
import OrderRepository from '../../repositories/OrderRepository.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(loadCurrentUser);

router.get('/', (_req, res) => res.redirect('/dashboard'));
router.get('/login', redirectAuthenticated, AuthWebController.loginForm);
router.post('/login', redirectAuthenticated, asyncHandler((req, res) => AuthWebController.login(req, res)));
router.post('/logout', requireWebAuth, AuthWebController.logout);

router.get(
  '/dashboard',
  requireWebAuth,
  webAuthorize(DashboardPolicy, 'show'),
  asyncHandler((req, res) => DashboardWebController.show(req, res))
);

router.get(
  '/customers',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'index'),
  asyncHandler((req, res) => CustomerWebController.index(req, res))
);
router.get(
  '/customers/new',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'create'),
  (req, res) => CustomerWebController.new(req, res)
);
router.post(
  '/customers',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'create'),
  asyncHandler((req, res) => CustomerWebController.create(req, res))
);
router.get(
  '/customers/:id/edit',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'update'),
  asyncHandler((req, res) => CustomerWebController.edit(req, res))
);
router.post(
  '/customers/:id',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'update'),
  asyncHandler((req, res) => CustomerWebController.update(req, res))
);

router.get(
  '/products',
  requireWebAuth,
  webAuthorize(ProductPolicy, 'index'),
  asyncHandler((req, res) => ProductWebController.index(req, res))
);
router.get(
  '/products/new',
  requireWebAuth,
  webAuthorize(ProductPolicy, 'create'),
  asyncHandler((req, res) => ProductWebController.new(req, res))
);
router.post(
  '/products',
  requireWebAuth,
  webAuthorize(ProductPolicy, 'create'),
  asyncHandler((req, res) => ProductWebController.create(req, res))
);
router.post(
  '/products/:id',
  requireWebAuth,
  webAuthorize(ProductPolicy, 'update'),
  asyncHandler((req, res) => ProductWebController.update(req, res))
);

router.get(
  '/collaborators',
  requireWebAuth,
  webAuthorize(UserPolicy, 'index'),
  asyncHandler((req, res) => UserWebController.index(req, res))
);
router.get(
  '/collaborators/:id',
  requireWebAuth,
  webAuthorize(UserPolicy, 'show', (req) => UserRepository.findById(req.params.id)),
  asyncHandler((req, res) => UserWebController.show(req, res))
);
router.post(
  '/collaborators/:id/toggle-active',
  requireWebAuth,
  webAuthorize(UserPolicy, 'toggleActive', (req) => UserRepository.findById(req.params.id)),
  asyncHandler((req, res) => UserWebController.toggleActive(req, res))
);

router.get(
  '/orders',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'index'),
  asyncHandler((req, res) => OrderWebController.index(req, res))
);
router.get(
  '/orders/new',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'create'),
  asyncHandler((req, res) => OrderWebController.new(req, res))
);
router.get(
  '/orders/:id/edit',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'update', (req) => OrderRepository.findById(req.params.id)),
  asyncHandler((req, res) => OrderWebController.edit(req, res))
);
router.get(
  '/orders/item-row',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'create'),
  asyncHandler((req, res) => OrderWebController.itemRow(req, res))
);
router.get(
  '/orders/manual-item-row',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'create'),
  (req, res) => OrderWebController.manualItemRow(req, res)
);
router.get(
  '/orders/product-options',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'create'),
  asyncHandler((req, res) => OrderWebController.productOptions(req, res))
);
router.get(
  '/orders/:id',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'show'),
  asyncHandler((req, res) => OrderWebController.show(req, res))
);
router.post(
  '/orders',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'create'),
  asyncHandler((req, res) => OrderWebController.create(req, res))
);
router.post(
  '/orders/:id',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'update', (req) => OrderRepository.findById(req.params.id)),
  asyncHandler((req, res) => OrderWebController.update(req, res))
);
router.post(
  '/orders/:id/pdf',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'generatePdf'),
  asyncHandler((req, res) => OrderWebController.generatePdf(req, res))
);
router.post(
  '/orders/:id/delete',
  requireWebAuth,
  webAuthorize(OrderPolicy, 'destroy', (req) => OrderRepository.findById(req.params.id)),
  asyncHandler((req, res) => OrderWebController.remove(req, res))
);
router.post(
  '/customers/:id/activate',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'activate'),
  asyncHandler((req, res) => CustomerWebController.activate(req, res))
);
router.post(
  '/customers/:id/toggle-active',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'toggleActive'),
  asyncHandler((req, res) => CustomerWebController.toggleActive(req, res))
);
router.post(
  '/customers/:id/delete',
  requireWebAuth,
  webAuthorize(CustomerPolicy, 'destroy'),
  asyncHandler((req, res) => CustomerWebController.remove(req, res))
);
export default router;

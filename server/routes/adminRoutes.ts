import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJwt } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();

router.use(authenticateJwt, adminOnly);

// Dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Products
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Orders
router.get('/orders', AdminController.getAllOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);
router.post('/orders/:id/return-action', AdminController.handleReturnRequest);

// Customers
router.get('/customers', AdminController.getAllCustomers);
router.patch('/customers/:id/toggle-active', AdminController.toggleCustomerActive);

// Coupons
router.get('/coupons', AdminController.getAllCoupons);
router.post('/coupons', AdminController.createCoupon);
router.put('/coupons/:id', AdminController.updateCoupon);

// Q&A
router.get('/questions', AdminController.getAllQuestions);
router.put('/questions/:id/answer', AdminController.answerQuestion);

// Reviews
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

export default router;

import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);
router.post('/:id/return', OrderController.requestReturn);
router.post('/:id/reorder', OrderController.reorder);
router.get('/:id/invoice', OrderController.getInvoice);

export default router;

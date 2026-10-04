import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.post('/create-order', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);
router.post('/sandbox-signature', PaymentController.getSandboxSignature);

export default router;

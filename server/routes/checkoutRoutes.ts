import { Router } from 'express';
import { CheckoutController } from '../controllers/checkoutController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.post('/calculate', CheckoutController.calculate);

export default router;

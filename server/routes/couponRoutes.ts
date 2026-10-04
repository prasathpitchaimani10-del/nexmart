import { Router } from 'express';
import { CouponController } from '../controllers/couponController';

const router = Router();

router.get('/available', CouponController.getAvailableCoupons);
router.post('/validate', CouponController.validateCoupon);

export default router;

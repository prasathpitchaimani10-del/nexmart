import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/', authenticateJwt, ReviewController.createReview);

export default router;

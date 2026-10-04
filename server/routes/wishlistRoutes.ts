import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);

export default router;

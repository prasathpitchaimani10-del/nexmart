import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/', CartController.getCart);
router.post('/add', CartController.addItem);
router.put('/quantity', CartController.updateQuantity);
router.delete('/remove', CartController.removeItem);
router.post('/save-for-later', CartController.toggleSaveForLater);
router.delete('/clear', CartController.clearCart);

export default router;

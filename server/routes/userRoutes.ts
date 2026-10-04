import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/change-password', UserController.changePassword);

// Delivery addresses
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);
router.put('/addresses/:id', UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);
router.patch('/addresses/:id/default', UserController.setDefaultAddress);

export default router;

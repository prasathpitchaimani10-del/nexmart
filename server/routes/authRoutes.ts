import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', rateLimiter({ maxRequests: 20, windowMs: 15 * 60 * 1000 }), AuthController.register);
router.post('/login', rateLimiter({ maxRequests: 30, windowMs: 15 * 60 * 1000 }), AuthController.login);
router.post('/verify-otp', rateLimiter({ maxRequests: 15, windowMs: 15 * 60 * 1000 }), AuthController.verifyOtp);
router.post('/resend-otp', rateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 }), AuthController.resendOtp);
router.post('/forgot-password', rateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000 }), AuthController.forgotPassword);
router.post('/reset-password', rateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000 }), AuthController.resetPassword);
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;

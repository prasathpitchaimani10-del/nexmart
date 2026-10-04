import express, { Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import couponRoutes from './routes/couponRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import questionRoutes from './routes/questionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import { globalErrorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    ENV.CLIENT_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.onrender.com')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/sandbox
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mandatory Render-compatible Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: 'API is running',
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
};

import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  HOST: '0.0.0.0',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'nexmart_enterprise_jwt_secure_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  PAYMENT_PROVIDER_KEY: process.env.PAYMENT_PROVIDER_KEY || 'test_key_nexmart_sandbox',
  PAYMENT_PROVIDER_SECRET: process.env.PAYMENT_PROVIDER_SECRET || 'test_secret_nexmart_sandbox',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 2525,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
};

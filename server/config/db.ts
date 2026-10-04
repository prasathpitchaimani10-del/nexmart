import mongoose from 'mongoose';
import { ENV } from './env';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  if (!ENV.MONGODB_URI) {
    console.info('[Database] No MONGODB_URI provided in environment. Operating in memory-backed hybrid mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.info(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB Atlas connection warning (${error.message}). Falling back to local data store.`);
    return false;
  }
};

export const getDbStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'local/in-memory store',
    name: mongoose.connection.name || 'nexmart_db',
  };
};

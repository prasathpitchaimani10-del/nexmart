import { createApp } from './app';
import { connectDB } from './config/db';
import { DbService } from './services/dbService';
import { ENV } from './config/env';

const startServer = async () => {
  try {
    await connectDB();
    await DbService.initialize();

    const app = createApp();
    const port = ENV.PORT;
    const host = ENV.HOST;

    app.listen(port, host, () => {
      console.info(`[Server] NexMart API Web Service listening on http://${host}:${port}`);
      console.info(`[Server] Health check endpoint ready at http://${host}:${port}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();

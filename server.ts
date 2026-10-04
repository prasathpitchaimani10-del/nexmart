import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { connectDB } from './server/config/db';
import { DbService } from './server/services/dbService';
import { ENV } from './server/config/env';

async function bootstrap() {
  await connectDB();
  await DbService.initialize();

  const app = createApp();
  const port = ENV.PORT;
  const host = '0.0.0.0';

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    console.info(`[NexMart Platform] Server operational on http://${host}:${port}`);
    console.info(`[NexMart Platform] Health Check: http://${host}:${port}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('[NexMart Platform] Startup error:', err);
  process.exit(1);
});

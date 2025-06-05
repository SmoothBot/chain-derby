import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import Router from '@koa/router';
import { errorHandler, notFoundHandler } from './middleware';
import registerRoutes from './routes';
import config from './config';

// Create Koa application
const app = new Koa();

// Create base router
const router = new Router({ prefix: '/api' });

// Apply global middleware
app.use(helmet());
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));
app.use(bodyParser());
app.use(logger());
app.use(errorHandler);

// Health check endpoint (outside /api prefix)
app.use(async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    };
    return;
  }
  await next();
});

// Register routes
registerRoutes(router);
app.use(router.routes());
app.use(router.allowedMethods());

// Handle 404 errors
app.use(notFoundHandler);

// Handle server errors
app.on('error', (err, ctx) => {
  console.error('Server error', err, ctx);
});

// Start server if not imported for testing
if (!module.parent) {
  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  // Handle server shutdown
  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  };

  // Handle termination signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Export app instance for testing
export default app;
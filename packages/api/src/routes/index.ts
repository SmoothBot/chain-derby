import Router from '@koa/router';
import raceSessionRoutes from './raceSession.routes';
import chainResultRoutes from './chainResult.routes';

// Create a base router
const router = new Router({ prefix: '/api' });

// Health check route
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  };
});

// Register all routes
export default function registerRoutes(app: Router) {
  // Mount all route groups onto the base router
  app.use(raceSessionRoutes.routes(), raceSessionRoutes.allowedMethods());
  app.use(chainResultRoutes.routes(), chainResultRoutes.allowedMethods());
  
  return app;
}
import Router from '@koa/router';
import raceSessionRoutes from './raceSession.routes';
import chainResultRoutes from './chainResult.routes';

// Register all routes
export default function registerRoutes(app: Router) {
  // Mount all route groups onto the base router
  app.use(raceSessionRoutes.routes(), raceSessionRoutes.allowedMethods());
  app.use(chainResultRoutes.routes(), chainResultRoutes.allowedMethods());
  
  return app;
}
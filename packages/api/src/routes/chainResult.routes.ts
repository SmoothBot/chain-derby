import Router from '@koa/router';
import { ChainResultController } from '../controllers';

const router = new Router({ prefix: '/chain-results' });

// No GET routes - API is write-only for analytics data

export default router;
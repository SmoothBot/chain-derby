import Router from '@koa/router';
import { ChainResultController } from '../controllers';

const router = new Router({ prefix: '/chain-results' });

// GET /chain-results/session/:sessionId - Get chain results for a specific race session
router.get('/session/:sessionId', ChainResultController.getBySessionId);

// GET /chain-results/stats - Get statistics across all race sessions
router.get('/stats', ChainResultController.getStats);

export default router;
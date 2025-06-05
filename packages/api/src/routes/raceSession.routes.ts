import Router from '@koa/router';
import { RaceSessionController } from '../controllers';

const router = new Router({ prefix: '/race-sessions' });

// POST /race-sessions - Create a new race session
router.post('/', RaceSessionController.create);

export default router;
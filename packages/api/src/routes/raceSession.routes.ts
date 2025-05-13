import Router from '@koa/router';
import { RaceSessionController } from '../controllers';

const router = new Router({ prefix: '/race-sessions' });

// GET /race-sessions - Get all race sessions with optional filtering
router.get('/', RaceSessionController.getAll);

// GET /race-sessions/:id - Get a race session by ID
router.get('/:id', RaceSessionController.getById);

// POST /race-sessions - Create a new race session
router.post('/', RaceSessionController.create);

// DELETE /race-sessions/:id - Delete a race session
router.delete('/:id', RaceSessionController.delete);

export default router;
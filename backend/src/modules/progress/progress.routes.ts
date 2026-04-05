import { Router } from 'express';
import { body, param } from 'express-validator';
import { updateProgress, getProgressSummary } from './progress.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);

router.put(
  '/:lessonId',
  [
    param('lessonId').isUUID(),
    body('status').optional().isIn(['not_started', 'in_progress', 'completed']),
    body('timeSpent').optional().isInt(),
    body('score').optional().isFloat({ min: 0, max: 100 }),
    validate,
  ],
  updateProgress
);

router.get('/summary', getProgressSummary);

export default router;

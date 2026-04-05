import { Router } from 'express';
import { body } from 'express-validator';
import {
  generateQuiz,
  tutorHelp,
  generateContent,
  getTaskStatus,
} from './agent.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/generate-quiz',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('topic').trim().notEmpty(),
    body('grade').isInt({ min: 0, max: 12 }),
    body('subject').trim().notEmpty(),
    validate,
  ],
  generateQuiz
);

router.post(
  '/tutor-help',
  [
    body('question').trim().notEmpty(),
    body('grade').isInt({ min: 0, max: 12 }),
    validate,
  ],
  tutorHelp
);

router.post(
  '/generate-content',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('topic').trim().notEmpty(),
    body('grade').isInt({ min: 0, max: 12 }),
    body('contentType').isIn(['lesson', 'activity', 'explanation']),
    validate,
  ],
  generateContent
);

router.get('/task/:taskId', getTaskStatus);

export default router;

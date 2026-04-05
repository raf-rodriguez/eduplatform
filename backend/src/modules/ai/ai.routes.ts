import { Router } from 'express';
import { body } from 'express-validator';
import { generateContent, chatWithAgent } from './ai.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);
router.use(authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'));

// Generate structured content (quiz, exam, lesson-plan, etc.)
router.post(
  '/generate',
  [
    body('task').isIn(['quiz', 'exam', 'lesson-plan', 'worksheet', 'rubric', 'pdf-content', 'pptx-outline', 'study-guide']),
    body('subject').notEmpty(),
    body('grade').notEmpty(),
    body('topic').notEmpty(),
    validate,
  ],
  generateContent
);

// Freeform chat with AI
router.post(
  '/chat',
  [body('message').notEmpty()],
  chatWithAgent
);

export default router;

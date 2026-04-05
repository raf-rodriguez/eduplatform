import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAssessment,
  startAssessment,
  submitAnswer,
  completeAssessment,
  getAssessmentResults,
  createAssessment,
} from './assessment.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// Public routes
router.get('/:id', [param('id').isUUID(), validate], getAssessment);

// Protected routes
router.use(authenticate);

// Student routes
router.post(
  '/:id/start',
  [param('id').isUUID(), validate],
  startAssessment
);

router.post(
  '/submit-answer',
  [
    body('attemptId').isUUID(),
    body('questionId').isUUID(),
    body('answer').notEmpty(),
    validate,
  ],
  submitAnswer
);

router.post(
  '/complete',
  [body('attemptId').isUUID(), validate],
  completeAssessment
);

router.get(
  '/:id/results',
  [param('id').isUUID(), validate],
  getAssessmentResults
);

// Teacher/Admin routes
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('lessonId').isUUID(),
    body('type').isIn(['quiz', 'module_exam', 'final_exam', 'practice']),
    body('title').trim().notEmpty(),
    body('maxScore').isInt({ min: 1 }),
    body('passingScore').isInt({ min: 1 }),
    body('questions').isArray({ min: 1 }),
    validate,
  ],
  createAssessment
);

export default router;

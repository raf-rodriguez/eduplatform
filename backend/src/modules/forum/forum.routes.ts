import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getThreads,
  getThreadById,
  createThread,
  createReply,
  incrementViewCount,
  deleteThread,
} from './forum.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/forum/threads - List threads
router.get(
  '/threads',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('subjectId').optional().isUUID(),
    query('lessonId').optional().isUUID(),
    query('search').optional().isString(),
    validate,
  ],
  getThreads
);

// POST /api/forum/threads - Create new thread
router.post(
  '/threads',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('subjectId').optional().isUUID(),
    body('lessonId').optional().isUUID(),
    validate,
  ],
  createThread
);

// PUT /api/forum/threads/:id/view - Increment view count
router.put(
  '/threads/:id/view',
  [
    param('id').isUUID(),
    validate,
  ],
  incrementViewCount
);

// GET /api/forum/threads/:id - Get thread with replies
router.get(
  '/threads/:id',
  [
    param('id').isUUID(),
    validate,
  ],
  getThreadById
);

// DELETE /api/forum/threads/:id - Delete thread
router.delete(
  '/threads/:id',
  [
    param('id').isUUID(),
    validate,
  ],
  deleteThread
);

// POST /api/forum/threads/:id/replies - Add reply
router.post(
  '/threads/:id/replies',
  [
    param('id').isUUID(),
    body('content').trim().notEmpty().withMessage('Content is required'),
    validate,
  ],
  createReply
);

export default router;

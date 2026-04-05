import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesByLesson,
} from './studyNotes.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notes - List user's notes
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().isString(),
    query('tags').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    validate,
  ],
  getNotes
);

// GET /api/notes/lesson/:lessonId - Get notes for specific lesson
router.get(
  '/lesson/:lessonId',
  [
    param('lessonId').isUUID(),
    validate,
  ],
  getNotesByLesson
);

// GET /api/notes/:id - Get single note
router.get(
  '/:id',
  [
    param('id').isUUID(),
    validate,
  ],
  getNoteById
);

// POST /api/notes - Create note
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('color').optional().isString().isIn(['yellow', 'blue', 'green', 'pink', 'purple']),
    body('isPinned').optional().isBoolean(),
    body('tags').optional().isArray(),
    body('lessonId').optional().isUUID(),
    body('subjectId').optional().isUUID(),
    validate,
  ],
  createNote
);

// PUT /api/notes/:id - Update note
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('color').optional().isString().isIn(['yellow', 'blue', 'green', 'pink', 'purple']),
    body('isPinned').optional().isBoolean(),
    body('tags').optional().isArray(),
    body('lessonId').optional().isUUID(),
    body('subjectId').optional().isUUID(),
    validate,
  ],
  updateNote
);

// DELETE /api/notes/:id - Delete note
router.delete(
  '/:id',
  [
    param('id').isUUID(),
    validate,
  ],
  deleteNote
);

export default router;

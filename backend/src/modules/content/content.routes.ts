import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getGrades,
  getSubjectsByGrade,
  getModulesBySubject,
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  createGrade,
  createSubject,
  createModule,
  getStudentCurriculum,
} from './content.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// Public routes (with optional auth)
router.get('/grades', getGrades);
router.get('/grades/:gradeId/subjects', getSubjectsByGrade);
router.get('/subjects/:subjectId/modules', getModulesBySubject);
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/lessons/:id', getLessonById);

// Protected routes
router.use(authenticate);

// Student curriculum
router.get('/my-curriculum', getStudentCurriculum);

// Content creation (teacher/admin only)
router.post(
  '/grades',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('level').isInt({ min: 0, max: 12 }),
    body('orderIndex').isInt(),
    validate,
  ],
  createGrade
);

router.post(
  '/subjects',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('gradeId').isUUID(),
    body('name').trim().notEmpty(),
    body('code').trim().notEmpty(),
    validate,
  ],
  createSubject
);

router.post(
  '/modules',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('subjectId').isUUID(),
    body('name').trim().notEmpty(),
    body('orderIndex').isInt(),
    validate,
  ],
  createModule
);

router.post(
  '/lessons',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    body('moduleId').isUUID(),
    body('title').trim().notEmpty(),
    body('orderIndex').isInt(),
    validate,
  ],
  createLesson
);

router.put(
  '/lessons/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    param('id').isUUID(),
    validate,
  ],
  updateLesson
);

export default router;

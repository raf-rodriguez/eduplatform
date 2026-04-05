import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTeacherAssignments,
  getMyAssignments,
  createAssignment,
  deleteAssignment,
  getTeacherStudents,
} from './teacher.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// Teacher's own assignments
router.get('/my', authenticate, getMyAssignments);
router.get('/my/students', authenticate, authorize('TEACHER'), getTeacherStudents);

// Admin routes
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/assignments', getTeacherAssignments);

router.post(
  '/assignments',
  [
    body('teacherId').isUUID(),
    body('subjectId').isUUID(),
    body('gradeId').isUUID(),
    validate,
  ],
  createAssignment
);

router.delete(
  '/assignments/:id',
  [param('id').isUUID(), validate],
  deleteAssignment
);

export default router;

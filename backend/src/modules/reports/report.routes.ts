import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getStudentReport,
  getClassReport,
  getDashboardStats,
} from './report.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);

router.get(
  '/student/:studentId',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PARENT'),
  [param('studentId').isUUID(), validate],
  getStudentReport
);

router.get(
  '/class',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    query('gradeId').optional().isInt(),
    query('subjectId').optional().isUUID(),
    validate,
  ],
  getClassReport
);

router.get(
  '/dashboard',
  authorize('ADMIN', 'SUPER_ADMIN'),
  getDashboardStats
);

export default router;

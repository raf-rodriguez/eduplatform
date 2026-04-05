import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProgress,
  getUserAssessments,
  getMyAssessments,
  adminResetPassword,
  getStudents,
  getTeachers,
  changeUserRole,
  bulkImportUsers,
} from './user.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my assessments
router.get(
  '/me/assessments',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['in_progress', 'completed', 'passed', 'failed']),
    validate,
  ],
  getMyAssessments
);

// Get all users (admin only)
router.get(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('role').optional().isString(),
    query('gradeLevel').optional().isInt({ min: 0, max: 12 }),
    query('isActive').optional().isBoolean(),
    validate,
  ],
  getAllUsers
);

// *** SPECIFIC ROUTES MUST BE BEFORE /:id ***
// Get all students
router.get(
  '/students',
  authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('gradeLevel').optional().isInt({ min: 0, max: 13 }),
    query('isActive').optional().isBoolean(),
    validate,
  ],
  getStudents
);

// Get all teachers
router.get(
  '/teachers',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
    validate,
  ],
  getTeachers
);

// Get user by ID
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    validate,
  ],
  getUserById
);

// Update user
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('gradeLevel').optional().isInt({ min: 0, max: 12 }),
    body('avatarUrl').optional().isURL(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  updateUser
);

// Delete user
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    validate,
  ],
  deleteUser
);

// Get user progress
router.get(
  '/:id/progress',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  getUserProgress
);

// Get user assessments
router.get(
  '/:id/assessments',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['in_progress', 'completed', 'passed', 'failed']),
    validate,
  ],
  getUserAssessments
);

// Admin reset password
router.post(
  '/:id/reset-password',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  adminResetPassword
);

// Change user role
router.put(
  '/:id/role',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID(),
    body('newRole').isIn(['STUDENT', 'TEACHER', 'ADMIN', 'PARENT']),
    validate,
  ],
  changeUserRole
);

// Bulk import users
router.post(
  '/bulk-import',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('users').isArray({ min: 1 }).withMessage('Array of users required'),
    validate,
  ],
  bulkImportUsers
);

export default router;

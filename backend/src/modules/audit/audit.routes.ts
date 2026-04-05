import { Router } from 'express';
import { param, query, body } from 'express-validator';
import {
  getAuditLogs,
  getAuditStats,
  deleteAuditLog,
  bulkDeleteAuditLogs,
} from './audit.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Get audit logs with pagination
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
    query('entityType').optional().isString(),
    query('userId').optional().isUUID(),
    query('search').optional().isString(),
    validate,
  ],
  getAuditLogs
);

// Get audit statistics
router.get('/stats', getAuditStats);

// Delete single audit log
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid audit log ID required'),
    validate,
  ],
  deleteAuditLog
);

// Bulk delete audit logs
router.post(
  '/bulk-delete',
  [
    body('ids').isArray({ min: 1 }).withMessage('Array of IDs required'),
    body('ids.*').isUUID().withMessage('Valid audit log IDs required'),
    validate,
  ],
  bulkDeleteAuditLogs
);

export default router;

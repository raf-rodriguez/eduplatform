import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from './notification.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('unreadOnly').optional().isBoolean(),
    validate,
  ],
  getNotifications
);

router.put(
  '/:id/read',
  [param('id').isUUID(), validate],
  markAsRead
);

router.put('/read-all', markAllAsRead);

export default router;

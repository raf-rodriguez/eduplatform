import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getConversations,
  createConversation,
  getConversation,
  sendMessage,
  markAsRead,
} from './messaging.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authenticate);

// List conversations
router.get(
  '/conversations',
  getConversations
);

// Create conversation
router.post(
  '/conversations',
  [
    body('participantId').isUUID().withMessage('Valid participantId is required'),
    body('title').optional().isString(),
    body('type').optional().isIn(['direct', 'group']),
    validate,
  ],
  createConversation
);

// Get conversation with messages
router.get(
  '/conversations/:id',
  [
    param('id').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  getConversation
);

// Send message
router.post(
  '/conversations/:id/messages',
  [
    param('id').isUUID(),
    body('content').isString().notEmpty().withMessage('Message content is required'),
    body('type').optional().isIn(['text', 'file', 'system']),
    body('attachments').optional().isObject(),
    validate,
  ],
  sendMessage
);

// Mark as read
router.put(
  '/conversations/:id/read',
  [
    param('id').isUUID(),
    validate,
  ],
  markAsRead
);

export default router;

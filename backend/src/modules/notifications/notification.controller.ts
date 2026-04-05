import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../shared/middleware/errorHandler';

// Get user notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { userId };
  if (unreadOnly === 'true') {
    where.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

// Mark all as read
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// Create notification (internal)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data,
    },
  });
};

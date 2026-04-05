import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';
import { logger } from '../../config/logger';

// Get all audit logs with pagination and filters
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 50,
    action,
    entityType,
    userId,
    severity,
    startDate,
    endDate,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (action && action !== 'ALL') {
    where.action = action;
  }

  if (entityType && entityType !== 'ALL') {
    where.entityType = entityType;
  }

  if (userId) {
    where.userId = userId;
  }

  if (severity && severity !== 'ALL') {
    // Map severity to the data (stored in metadata or we filter by action type)
    // For now, we'll filter by action patterns
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  if (search) {
    where.OR = [
      { ipAddress: { contains: search as string, mode: 'insensitive' } },
      { userAgent: { contains: search as string, mode: 'insensitive' } },
      { action: { contains: search as string, mode: 'insensitive' } },
      { entityType: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Get audit logs with pagination
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get audit log statistics
export const getAuditStats = asyncHandler(async (req: Request, res: Response) => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalLogs,
    logsLast24h,
    uniqueUsers,
    actionBreakdown,
    entityTypeBreakdown,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: last24h,
        },
      },
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      _count: true,
    }),
    prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ['entityType'],
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalLogs,
      logsLast24h,
      uniqueUsers: uniqueUsers.length,
      actionBreakdown,
      entityTypeBreakdown,
    },
  });
});

// Delete audit log by ID (admin only)
export const deleteAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  // Check if log exists
  const existingLog = await prisma.auditLog.findUnique({
    where: { id },
  });

  if (!existingLog) {
    throw new AppError('Audit log not found', 404);
  }

  // Delete the log
  await prisma.auditLog.delete({
    where: { id },
  });

  logger.info(`Audit log deleted: ${id} by user ${req.user!.id}`);

  res.json({
    success: true,
    message: 'Audit log deleted successfully',
  });
});

// Delete multiple audit logs (bulk delete)
export const bulkDeleteAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const ids = req.body.ids as string[];

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Array of IDs required', 400);
  }

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  logger.info(`Bulk deleted ${deleted.count} audit logs by user ${req.user!.id}`);

  res.json({
    success: true,
    message: `${deleted.count} audit logs deleted successfully`,
    count: deleted.count,
  });
});

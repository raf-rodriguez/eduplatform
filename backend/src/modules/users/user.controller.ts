import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';
import { logger } from '../../config/logger';

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    gradeLevel,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (gradeLevel) {
    where.gradeLevel = Number(gradeLevel);
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  if (role) {
    where.roles = {
      some: {
        role: {
          name: role as string,
        },
      },
    };
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        gradeLevel: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      gamificationProfile: true,
      progress: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove sensitive data
  const { password, ...userWithoutPassword } = user as any;

  res.json({
    success: true,
    data: userWithoutPassword,
  });
});

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, gradeLevel, avatarUrl, isActive } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      gradeLevel: gradeLevel !== undefined ? Number(gradeLevel) : undefined,
      avatarUrl: avatarUrl || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      gradeLevel: true,
      avatarUrl: true,
      isActive: true,
      updatedAt: true,
    },
  });

  logger.info(`User updated: ${id}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});

// Delete user (soft delete)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Soft delete by deactivating
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  logger.info(`User deactivated: ${id}`);

  res.json({
    success: true,
    message: 'User deactivated successfully',
  });
});

// Get user progress
export const getUserProgress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const progress = await prisma.progress.findMany({
    where: { studentId: id },
    skip,
    take: Number(limit),
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      lesson: {
        select: {
          title: true,
          module: {
            select: {
              name: true,
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const total = await prisma.progress.count({
    where: { studentId: id },
  });

  // Calculate statistics
  const stats = await prisma.progress.groupBy({
    by: ['status'],
    where: { studentId: id },
    _count: {
      status: true,
    },
  });

  const statusCounts = stats.reduce((acc: any, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      progress,
      stats: statusCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get user assessments
export const getUserAssessments = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { studentId: id };
  if (status) {
    where.status = status;
  }

  const assessments = await prisma.studentAssessment.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      assessment: {
        select: {
          title: true,
          type: true,
          maxScore: true,
          passingScore: true,
          lesson: {
            select: {
              title: true,
              module: {
                select: {
                  name: true,
                  subject: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const total = await prisma.studentAssessment.count({ where });

  // Calculate average score
  const avgScore = await prisma.studentAssessment.aggregate({
    where: { studentId: id, score: { not: null } },
    _avg: {
      score: true,
    },
  });

  res.json({
    success: true,
    data: {
      assessments,
      averageScore: avgScore._avg.score,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get my assessments (authenticated user)
export const getMyAssessments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 100, status } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { studentId: userId };
  if (status) {
    where.status = status;
  }

  const assessments = await prisma.studentAssessment.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      assessment: {
        select: {
          title: true,
          type: true,
          maxScore: true,
          passingScore: true,
          lesson: {
            select: {
              title: true,
              module: {
                select: {
                  name: true,
                  subject: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const total = await prisma.studentAssessment.count({ where });

  res.json({
    success: true,
    data: {
      assessments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// ==================== ADMIN ENDPOINTS ====================

// Admin reset user password
export const adminResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId: id } });

  logger.info(`Admin reset password for user: ${id} by ${req.user!.id}`);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

// Get students with pagination
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, gradeLevel, isActive: active } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    roles: { some: { role: { name: 'STUDENT' } } },
  };

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (gradeLevel) {
    where.gradeLevel = Number(gradeLevel);
  }

  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        gradeLevel: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        progress: { select: { id: true } },
        studentAssessments: { select: { id: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const studentsWithStats = students.map((s) => ({
    ...s,
    completedLessons: 0,
    totalAssessments: s.studentAssessments.length,
    name: `${s.firstName} ${s.lastName}`,
  }));

  res.json({
    success: true,
    data: {
      students: studentsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get teachers with pagination
export const getTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, isActive: active } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    roles: { some: { role: { name: 'TEACHER' } } },
  };

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  const [teachers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const teachersWithStats = teachers.map((t) => ({
    ...t,
    name: `${t.firstName} ${t.lastName}`,
  }));

  res.json({
    success: true,
    data: {
      teachers: teachersWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Admin change user role
export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newRole } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const targetRole = await prisma.role.findUnique({
    where: { name: newRole },
  });

  if (!targetRole) {
    throw new AppError('Invalid role', 400);
  }

  // Remove existing roles and add new one
  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: id } }),
    prisma.userRole.create({
      data: { userId: id, roleId: targetRole.id },
    }),
  ]);

  logger.info(`User role changed: ${id} to ${newRole} by ${req.user!.id}`);

  res.json({
    success: true,
    message: `User role changed to ${newRole}`,
  });
});

// Bulk import users from CSV
export const bulkImportUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users } = req.body; // Array of { firstName, lastName, email, gradeLevel, phone }

  if (!Array.isArray(users) || users.length === 0) {
    throw new AppError('Array of users required', 400);
  }

  const imported = [];
  const errors = [];

  for (const u of users) {
    try {
      // Check if exists
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) { errors.push({ email: u.email, reason: 'Already exists' }); continue; }

      const hashed = await bcrypt.hash('TempPass123!', 12);
      const studentRole = await prisma.role.findUnique({ where: { name: u.role || 'STUDENT' } });

      const created = await prisma.user.create({
        data: {
          email: u.email,
          password: hashed,
          firstName: u.firstName,
          lastName: u.lastName,
          gradeLevel: u.gradeLevel ? Number(u.gradeLevel) : undefined,
          phone: u.phone,
          roles: { create: { roleId: studentRole?.id } },
        },
      });

      // Create gamification profile for students
      if (u.role === 'STUDENT') {
        await prisma.gamificationProfile.create({ data: { userId: created.id } });
      }

      imported.push({ id: created.id, email: created.email });
    } catch (e: any) {
      errors.push({ email: u.email, reason: e.message });
    }
  }

  res.json({
    success: true,
    message: `${imported.length} users imported, ${errors.length} errors`,
    data: { imported, errors },
  });
});

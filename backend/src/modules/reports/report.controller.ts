import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// Get student progress report
export const getStudentReport = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  const student: any = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      gamificationProfile: true,
      progress: {
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
          },
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
      },
      studentAssessments: {
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
          },
        },
        include: {
          assessment: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Calculate statistics
  const completedLessons = student.progress.filter((p) => p.status === 'completed');
  const averageScore =
    student.studentAssessments.length > 0
      ? student.studentAssessments.reduce((sum, a) => sum + (a.score || 0), 0) /
      student.studentAssessments.length
      : 0;

  const passedAssessments = student.studentAssessments.filter((a) => a.status === 'passed');

  res.json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        gradeLevel: student.gradeLevel,
      },
      summary: {
        totalLessons: student.progress.length,
        completedLessons: completedLessons.length,
        totalAssessments: student.studentAssessments.length,
        passedAssessments: passedAssessments.length,
        averageScore: Math.round(averageScore),
        currentLevel: student.gamificationProfile?.level,
        totalXp: student.gamificationProfile?.totalXp,
      },
      progress: student.progress,
      assessments: student.studentAssessments,
    },
  });
});

// Get class report (teacher/admin)
export const getClassReport = asyncHandler(async (req: Request, res: Response) => {
  const { gradeId, subjectId } = req.query;

  const where: any = {};
  if (gradeId) {
    where.gradeLevel = Number(gradeId);
  }

  const students: any = await prisma.user.findMany({
    where: {
      ...where,
      roles: {
        some: {
          role: {
            name: 'STUDENT',
          },
        },
      },
      isActive: true,
    },
    include: {
      gamificationProfile: true,
      progress: {
        include: {
          lesson: {
            include: {
              module: {
                where: subjectId ? { subjectId: subjectId as string } : undefined,
              },
            },
          },
        },
      },
      studentAssessments: true,
    },
    take: 100,
  });

  const report = students.map((student) => {
    const completedLessons = student.progress.filter((p) => p.status === 'completed');
    const avgScore =
      student.studentAssessments.length > 0
        ? student.studentAssessments.reduce((sum, a) => sum + (a.score || 0), 0) /
        student.studentAssessments.length
        : 0;

    return {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      gradeLevel: student.gradeLevel,
      completedLessons: completedLessons.length,
      totalLessons: student.progress.length,
      averageScore: Math.round(avgScore),
      level: student.gamificationProfile?.level,
      totalXp: student.gamificationProfile?.totalXp,
    };
  });

  // Sort by XP
  report.sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));

  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      averageCompletion: Math.round(
        report.reduce((sum, s) => sum + (s.completedLessons / (s.totalLessons || 1)) * 100, 0) /
        report.length
      ),
      averageScore: Math.round(report.reduce((sum, s) => sum + s.averageScore, 0) / report.length),
      students: report,
    },
  });
});

// Get dashboard stats (admin)
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalParents,
    activeStudents,
    activeTeachers,
    studentsThisWeek,
    studentsThisMonth,
    totalLessons,
    totalAssessments,
    recentProgress,
    recentAssessments,
    recentUsers,
    totalAuditLogs,
    todayLogins,
    failedLoginsToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userRole.count({ where: { role: { name: 'STUDENT' } } }),
    prisma.userRole.count({ where: { role: { name: 'TEACHER' } } }),
    prisma.userRole.count({ where: { role: { name: 'PARENT' } } }),
    prisma.user.count({ where: { isActive: true, roles: { some: { role: { name: 'STUDENT' } } } } }),
    prisma.user.count({ where: { isActive: true, roles: { some: { role: { name: 'TEACHER' } } } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo }, roles: { some: { role: { name: 'STUDENT' } } } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo }, roles: { some: { role: { name: 'STUDENT' } } } } }),
    prisma.lesson.count(),
    prisma.assessment.count(),
    prisma.progress.count({ where: { updatedAt: { gte: weekAgo } } }),
    prisma.studentAssessment.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { roles: { include: { role: { select: { name: true } } } } },
    }),
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: today }, action: 'LOGIN' } }),
    prisma.auditLog.count({ where: { createdAt: { gte: today }, action: 'LOGIN' } }),
  ]);

  // Recent activity from audit logs (no user relation in schema)
  const recentActivity = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Students by grade
  const studentsByGrade = await prisma.user.groupBy({
    by: ['gradeLevel'],
    _count: true,
    where: { isActive: true, roles: { some: { role: { name: 'STUDENT' } } } },
  });

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        activeStudents,
        activeTeachers,
        studentsThisWeek,
        studentsThisMonth,
      },
      content: {
        lessons: totalLessons,
        assessments: totalAssessments,
        progressThisWeek: recentProgress,
        assessmentsThisWeek: recentAssessments,
      },
      security: {
        todayLogins,
        failedLoginsToday,
        totalAuditLogs,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.roles[0]?.role.name || 'STUDENT',
        createdAt: u.createdAt,
      })),
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        userName: 'Usuario',
        action: a.action,
        entityType: a.entityType,
        entityName: a.entityId || '-',
        timestamp: a.createdAt,
        ipAddress: a.ipAddress || '-',
      })),
      studentsByGrade: studentsByGrade.map((g) => ({
        grade: g.gradeLevel ?? -1,
        count: g._count,
      })),
    },
  });
});

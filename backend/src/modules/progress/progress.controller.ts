import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// Update lesson progress
export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { status, timeSpent, score } = req.body;
  const userId = req.user!.id;

  const progress = await prisma.progress.upsert({
    where: {
      studentId_lessonId: {
        studentId: userId,
        lessonId,
      },
    },
    update: {
      status: status || undefined,
      timeSpent: timeSpent ? { increment: timeSpent } : undefined,
      score: score || undefined,
      completedAt: status === 'completed' ? new Date() : undefined,
    },
    create: {
      studentId: userId,
      lessonId,
      status: status || 'in_progress',
      timeSpent: timeSpent || 0,
      score: score || null,
      startedAt: new Date(),
    },
  });

  res.json({
    success: true,
    data: progress,
  });
});

// Get student progress summary
export const getProgressSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gamificationProfile: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user has no grade level, return empty summary
  if (!user.gradeLevel) {
    return res.json({
      success: true,
      data: {
        overall: {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          percentage: 0,
        },
        bySubject: [],
        xpSummary: {
          totalXp: user.gamificationProfile?.totalXp || 0,
          level: user.gamificationProfile?.level || 1,
          streak: user.gamificationProfile?.currentStreak || 0,
        },
      },
    });
  }

  // Get grade with subjects and their modules/lessons
  const grade = await prisma.grade.findFirst({
    where: { level: user.gradeLevel, isActive: true },
    include: {
      subjects: {
        where: { isActive: true },
        include: {
          modules: {
            where: { isActive: true },
            include: {
              lessons: {
                where: { isActive: true },
                include: {
                  progress: {
                    where: { studentId: userId },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!grade) {
    return res.json({
      success: true,
      data: {
        overall: {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          percentage: 0,
        },
        bySubject: [],
        xpSummary: {
          totalXp: user.gamificationProfile?.totalXp || 0,
          level: user.gamificationProfile?.level || 1,
          streak: user.gamificationProfile?.currentStreak || 0,
        },
      },
    });
  }

  let totalLessons = 0;
  let completedLessons = 0;
  let inProgressLessons = 0;
  const bySubject: any[] = [];

  for (const subject of grade.subjects) {
    let subjectTotal = 0;
    let subjectCompleted = 0;
    let subjectInProgress = 0;

    for (const module of subject.modules) {
      for (const lesson of module.lessons) {
        subjectTotal++;
        const progress = lesson.progress[0];

        if (progress?.status === 'completed') {
          subjectCompleted++;
        } else if (progress?.status === 'in_progress') {
          subjectInProgress++;
        }
      }
    }

    totalLessons += subjectTotal;
    completedLessons += subjectCompleted;
    inProgressLessons += subjectInProgress;

    bySubject.push({
      subject: subject.name,
      code: subject.code,
      total: subjectTotal,
      completed: subjectCompleted,
      inProgress: subjectInProgress,
      notStarted: subjectTotal - subjectCompleted - subjectInProgress,
      percentage: subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0,
    });
  }

  res.json({
    success: true,
    data: {
      overall: {
        total: totalLessons,
        completed: completedLessons,
        inProgress: inProgressLessons,
        notStarted: totalLessons - completedLessons - inProgressLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
      bySubject,
      xpSummary: {
        totalXp: user.gamificationProfile?.totalXp || 0,
        level: user.gamificationProfile?.level || 1,
        streak: user.gamificationProfile?.currentStreak || 0,
      },
    },
  });
});

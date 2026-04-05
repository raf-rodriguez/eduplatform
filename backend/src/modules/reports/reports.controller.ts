import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// Get teacher dashboard stats
export const getTeacherDashboard = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = req.user!.id;

  // Get all grades and subjects this teacher handles
  const grades = await prisma.grade.findMany({
    where: { isActive: true },
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
                  assessments: {
                    where: { isActive: true },
                    include: {
                      studentAssessments: {
                        where: { status: { not: 'in_progress' } },
                      },
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

  // Calculate stats
  let totalStudents = 0;
  let totalAssessments = 0;
  let totalScore = 0;
  let scoreCount = 0;

  grades.forEach((grade) => {
    grade.subjects.forEach((subject) => {
      subject.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          lesson.assessments.forEach((assessment) => {
            totalAssessments += 1;
            assessment.studentAssessments.forEach((attempt) => {
              if (attempt.score) {
                totalScore += attempt.score;
                scoreCount += 1;
              }
            });
          });
        });
      });
    });
  });

  // Get unique students from progress
  const allProgress = await prisma.progress.findMany({
    distinct: ['studentId'],
  });
  totalStudents = allProgress.length;

  // Get students at risk (average score < 60)
  const studentAverages = await prisma.studentAssessment.groupBy({
    by: ['studentId'],
    _avg: { score: true },
    where: { status: { not: 'in_progress' } },
  });

  const atRiskCount = studentAverages.filter((s) => (s._avg.score || 0) < 60).length;

  // Get pending assessments to grade
  const pendingAssessments = await prisma.studentAssessment.count({
    where: { status: 'in_progress' },
  });

  // Get recent activity
  const recentSubmissions = await prisma.studentAssessment.findMany({
    take: 10,
    orderBy: { completedAt: 'desc' },
    where: { status: { not: 'in_progress' } },
    include: {
      student: {
        select: { firstName: true, lastName: true },
      },
      assessment: {
        select: { title: true, type: true },
      },
    },
  });

  const recentActivity = recentSubmissions.map((submission) => ({
    type: submission.status === 'passed' ? 'success' : 'submission',
    message: `${submission.student.firstName} ${submission.student.lastName} completó ${submission.assessment.title}`,
    time: new Date(submission.completedAt!).toLocaleString(),
    score: submission.score,
  }));

  // Get subject performance
  const subjectPerformance = await prisma.assessment.groupBy({
    by: ['id'],
    _avg: { maxScore: true },
    include: {
      studentAssessments: {
        where: { status: { not: 'in_progress' } },
        select: { score: true },
      },
      lesson: {
        select: {
          module: {
            select: {
              subject: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  const subjectStats: Record<string, { total: number; count: number }> = {};
  subjectPerformance.forEach((assessment) => {
    const subjectName = assessment.lesson?.module?.subject?.name || 'General';
    if (!subjectStats[subjectName]) {
      subjectStats[subjectName] = { total: 0, count: 0 };
    }
    assessment.studentAssessments.forEach((attempt) => {
      if (attempt.score) {
        subjectStats[subjectName].total += attempt.score;
        subjectStats[subjectName].count += 1;
      }
    });
  });

  const subjectAverages = Object.entries(subjectStats).map(([name, data]) => ({
    name,
    score: data.count > 0 ? Math.round(data.total / data.count) : 0,
  }));

  res.json({
    success: true,
    data: {
      totalStudents,
      totalAssessments,
      averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      atRisk: atRiskCount,
      pendingAssessments,
      recentActivity,
      subjectPerformance: subjectAverages,
      grades: grades.map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        subjects: g.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          modulesCount: s.modules.length,
        })),
      })),
    },
  });
});

// Get students by grade/subject
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { gradeId, subjectId } = req.query;

  const students: any = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: { name: 'ESTUDIANTE' },
        },
      },
      isActive: true,
    },
    include: {
      progress: {
        where: gradeId
          ? {
            lesson: {
              module: {
                subject: {
                  gradeId: gradeId as string,
                },
              },
            },
          }
          : undefined,
      },
      studentAssessments: {
        where: subjectId
          ? {
            assessment: {
              lesson: {
                module: {
                  subjectId: subjectId as string,
                },
              },
            },
          }
          : undefined,
        select: { score: true, status: true },
      },
    },
  });

  const studentsWithStats = students.map((student) => {
    const scores = student.studentAssessments
      .filter((a) => a.score !== null && a.status !== 'in_progress')
      .map((a) => a.score as number);
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const completedLessons = student.progress.filter((p) => p.status === 'completed').length;
    const totalLessons = student.progress.length;

    return {
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      avatarUrl: student.avatarUrl,
      averageScore: avgScore,
      completedLessons,
      totalLessons,
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      lastLoginAt: student.lastLoginAt,
    };
  });

  res.json({
    success: true,
    data: studentsWithStats,
  });
});

// Get student detail with full progress
export const getStudentDetail = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;

  const student: any = await prisma.user.findFirst({
    where: { id: studentId, isActive: true },
    include: {
      progress: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  subject: {
                    select: { name: true, code: true },
                  },
                },
              },
            },
          },
        },
      },
      studentAssessments: {
        include: {
          assessment: {
            select: { title: true, type: true, maxScore: true },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 20,
      },
      gamificationProfile: true,
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const scores = student.studentAssessments
    .filter((a) => a.score !== null && a.status !== 'in_progress')
    .map((a) => a.score as number);

  res.json({
    success: true,
    data: {
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      avatarUrl: student.avatarUrl,
      averageScore:
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      totalAssessments: student.studentAssessments.length,
      passedAssessments: student.studentAssessments.filter((a) => a.status === 'passed').length,
      failedAssessments: student.studentAssessments.filter((a) => a.status === 'failed').length,
      completedLessons: student.progress.filter((p) => p.status === 'completed').length,
      inProgressLessons: student.progress.filter((p) => p.status === 'in_progress').length,
      level: student.gamificationProfile?.level || 1,
      totalXp: student.gamificationProfile?.totalXp || 0,
      progress: student.progress.map((p) => ({
        lessonId: p.lesson.id,
        lessonTitle: p.lesson.title,
        subject: p.lesson.module.subject.name,
        status: p.status,
        score: p.score,
        completedAt: p.completedAt,
      })),
      recentAssessments: student.studentAssessments.map((a) => ({
        id: a.id,
        title: a.assessment.title,
        type: a.assessment.type,
        score: a.score,
        maxScore: a.assessment.maxScore,
        status: a.status,
        completedAt: a.completedAt,
      })),
    },
  });
});

// Get all grades with subjects
export const getGrades = asyncHandler(async (req: Request, res: Response) => {
  const grades = await prisma.grade.findMany({
    where: { isActive: true },
    include: {
      subjects: {
        where: { isActive: true },
        include: {
          modules: {
            where: { isActive: true },
            include: {
              lessons: {
                where: { isActive: true },
                select: { id: true, title: true, orderIndex: true },
              },
            },
          },
        },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  res.json({
    success: true,
    data: grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      level: grade.level,
      description: grade.description,
      hasStemTrack: grade.hasStemTrack,
      subjectsCount: grade.subjects.length,
      subjects: grade.subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        modulesCount: subject.modules.length,
        isStem: subject.isStem,
        modules: subject.modules.map((module) => ({
          id: module.id,
          name: module.name,
          orderIndex: module.orderIndex,
          difficulty: module.difficulty,
          estimatedHours: module.estimatedHours,
          lessonsCount: module.lessons.length,
        })),
      })),
    })),
  });
});

// Create grade
export const createGrade = asyncHandler(async (req: Request, res: Response) => {
  const { name, level, description, hasStemTrack, orderIndex } = req.body;

  const grade = await prisma.grade.create({
    data: {
      name,
      level,
      description,
      hasStemTrack: hasStemTrack || false,
      orderIndex: orderIndex || 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Grade created successfully',
    data: grade,
  });
});

// Update grade
export const updateGrade = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, level, description, hasStemTrack, orderIndex } = req.body;

  const grade = await prisma.grade.update({
    where: { id },
    data: {
      name,
      level,
      description,
      hasStemTrack,
      orderIndex,
    },
  });

  res.json({
    success: true,
    message: 'Grade updated successfully',
    data: grade,
  });
});

// Delete grade (soft delete)
export const deleteGrade = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.grade.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Grade deleted successfully',
  });
});

// Create subject
export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { gradeId, name, code, description, isStem } = req.body;

  const subject = await prisma.subject.create({
    data: {
      gradeId,
      name,
      code,
      description,
      isStem: isStem || false,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: subject,
  });
});

// Update subject
export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, description, isStem } = req.body;

  const subject = await prisma.subject.update({
    where: { id },
    data: {
      name,
      code,
      description,
      isStem,
    },
  });

  res.json({
    success: true,
    message: 'Subject updated successfully',
    data: subject,
  });
});

// Delete subject (soft delete)
export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.subject.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Subject deleted successfully',
  });
});

// Create module
export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId, name, description, orderIndex, estimatedHours, difficulty } = req.body;

  const module = await prisma.module.create({
    data: {
      subjectId,
      name,
      description,
      orderIndex: orderIndex || 0,
      estimatedHours,
      difficulty: difficulty || 'beginner',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: module,
  });
});

// Create lesson
export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId, title, description, orderIndex, duration, content, videoUrl } = req.body;

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description,
      orderIndex: orderIndex || 0,
      duration,
      content,
      videoUrl,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: lesson,
  });
});

// Get lessons by module
export const getLessonsByModule = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const lessons = await prisma.lesson.findMany({
    where: { moduleId, isActive: true },
    include: {
      resources: true,
      activities: true,
      assessments: {
        include: {
          studentAssessments: {
            select: { score: true, status: true },
          },
        },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  res.json({
    success: true,
    data: lessons,
  });
});

import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// Get all grades
export const getGrades = asyncHandler(async (req: Request, res: Response) => {
  const grades = await prisma.grade.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
  });

  res.json({
    success: true,
    data: grades,
  });
});

// Get subjects by grade
export const getSubjectsByGrade = asyncHandler(async (req: Request, res: Response) => {
  const { gradeId } = req.params;

  const subjects = await prisma.subject.findMany({
    where: {
      gradeId,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: subjects,
  });
});

// Get modules by subject
export const getModulesBySubject = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;

  const modules = await prisma.module.findMany({
    where: {
      subjectId,
      isActive: true,
    },
    orderBy: { orderIndex: 'asc' },
  });

  res.json({
    success: true,
    data: modules,
  });
});

// Get lessons by module
export const getLessonsByModule = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const userId = req.user?.id;

  const lessons = await prisma.lesson.findMany({
    where: {
      moduleId,
      isActive: true,
    },
    orderBy: { orderIndex: 'asc' },
    include: {
      resources: true,
      activities: true,
      assessments: {
        select: {
          id: true,
          title: true,
          type: true,
          maxScore: true,
          passingScore: true,
        },
      },
      progress: userId ? {
        where: {
          studentId: userId,
        },
      } : false,
    },
  });

  res.json({
    success: true,
    data: lessons,
  });
});

// Get lesson by ID
export const getLessonById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      resources: true,
      activities: true,
      assessments: {
        include: {
          quizzes: {
            include: {
              questions: {
                select: {
                  id: true,
                  type: true,
                  question: true,
                  options: true,
                  points: true,
                },
              },
            },
          },
        },
      },
      module: {
        select: {
          name: true,
          subject: {
            select: {
              name: true,
              code: true,
              grade: {
                select: {
                  name: true,
                  level: true,
                },
              },
            },
          },
        },
      },
      progress: userId ? {
        where: {
          studentId: userId,
        },
      } : false,
    },
  });

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  res.json({
    success: true,
    data: lesson,
  });
});

// Create lesson (teacher/admin only)
export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const {
    moduleId,
    title,
    description,
    content,
    videoUrl,
    videoDuration,
    duration,
    orderIndex,
  } = req.body;

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description,
      content,
      videoUrl,
      videoDuration,
      duration,
      orderIndex,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: lesson,
  });
});

// Update lesson
export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    content,
    videoUrl,
    videoDuration,
    duration,
    isActive,
  } = req.body;

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: title || undefined,
      description: description || undefined,
      content: content || undefined,
      videoUrl: videoUrl || undefined,
      videoDuration: videoDuration || undefined,
      duration: duration || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
  });

  res.json({
    success: true,
    message: 'Lesson updated successfully',
    data: lesson,
  });
});

// Create grade (admin only)
export const createGrade = asyncHandler(async (req: Request, res: Response) => {
  const { name, level, orderIndex, description, hasStemTrack } = req.body;

  const grade = await prisma.grade.create({
    data: {
      name,
      level,
      orderIndex,
      description,
      hasStemTrack,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Grade created successfully',
    data: grade,
  });
});

// Create subject (admin only)
export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { gradeId, name, code, description, isStem } = req.body;

  const subject = await prisma.subject.create({
    data: {
      gradeId,
      name,
      code,
      description,
      isStem,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: subject,
  });
});

// Create module (teacher/admin only)
export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId, name, description, orderIndex, estimatedHours, difficulty } = req.body;

  const moduleData = await prisma.module.create({
    data: {
      subjectId,
      name,
      description,
      orderIndex,
      estimatedHours,
      difficulty,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: moduleData,
  });
});

// Get student curriculum (personalized)
export const getStudentCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gamificationProfile: true,
    },
  });

  if (!user || !user.gradeLevel) {
    throw new AppError('User grade level not set', 400);
  }

  // Get grade with subjects
  const grade = await prisma.grade.findFirst({
    where: {
      level: user.gradeLevel,
      isActive: true,
    },
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
    throw new AppError('Grade not found', 404);
  }

  // Calculate progress for each subject
  const subjectsWithProgress = grade.subjects.map((subject: any) => {
    const totalLessons = subject.modules.reduce(
      (acc: number, m: any) => acc + m.lessons.length,
      0
    );
    const completedLessons = subject.modules.reduce(
      (acc: number, m: any) =>
        acc +
        m.lessons.filter((l: any) =>
          l.progress.some((p: any) => p.status === 'completed')
        ).length,
      0
    );

    return {
      ...subject,
      progress: {
        total: totalLessons,
        completed: completedLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
    };
  });

  res.json({
    success: true,
    data: {
      grade: {
        id: grade.id,
        name: grade.name,
        level: grade.level,
      },
      subjects: subjectsWithProgress,
    },
  });
});

import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// Get assessment by ID
export const getAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
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
      lesson: {
        select: {
          title: true,
          module: {
            select: {
              name: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    throw new AppError('Assessment not found', 404);
  }

  // Check if student has previous attempts
  const previousAttempts = userId
    ? await prisma.studentAssessment.findMany({
        where: {
          studentId: userId,
          assessmentId: id,
        },
        orderBy: {
          attemptNumber: 'desc',
        },
        take: 1,
      })
    : [];

  const lastAttempt = previousAttempts[0];
  const canAttempt =
    !lastAttempt ||
    (lastAttempt.status !== 'in_progress' &&
      lastAttempt.attemptNumber < assessment.maxAttempts);

  res.json({
    success: true,
    data: {
      assessment,
      previousAttempts: previousAttempts.length,
      lastAttempt: lastAttempt
        ? {
            attemptNumber: lastAttempt.attemptNumber,
            score: lastAttempt.score,
            status: lastAttempt.status,
            completedAt: lastAttempt.completedAt,
          }
        : null,
      canAttempt,
      remainingAttempts: lastAttempt
        ? assessment.maxAttempts - lastAttempt.attemptNumber
        : assessment.maxAttempts,
    },
  });
});

// Start assessment attempt
export const startAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    throw new AppError('Assessment not found', 404);
  }

  // Check if previous lessons are completed (if required)
  if (assessment.requiresPrevious) {
    const lessonIndex = assessment.lesson.module.lessons.findIndex(
      (l) => l.id === assessment.lessonId
    );

    const previousLessons = assessment.lesson.module.lessons.slice(0, lessonIndex);

    for (const lesson of previousLessons) {
      const progress = await prisma.progress.findUnique({
        where: {
          studentId_lessonId: {
            studentId: userId,
            lessonId: lesson.id,
          },
        },
      });

      if (!progress || progress.status !== 'completed') {
        throw new AppError(
          'You must complete all previous lessons before taking this assessment',
          403
        );
      }
    }
  }

  // Get last attempt number
  const lastAttempt = await prisma.studentAssessment.findFirst({
    where: {
      studentId: userId,
      assessmentId: id,
    },
    orderBy: {
      attemptNumber: 'desc',
    },
  });

  // Check if max attempts reached
  if (lastAttempt && lastAttempt.attemptNumber >= assessment.maxAttempts) {
    throw new AppError('Maximum attempts reached for this assessment', 403);
  }

  // Check if there's an in-progress attempt
  if (lastAttempt && lastAttempt.status === 'in_progress') {
    return res.json({
      success: true,
      data: {
        attemptId: lastAttempt.id,
        attemptNumber: lastAttempt.attemptNumber,
        startedAt: lastAttempt.startedAt,
        message: 'Continuing existing attempt',
      },
    });
  }

  // Create new attempt
  const newAttempt = await prisma.studentAssessment.create({
    data: {
      studentId: userId,
      assessmentId: id,
      attemptNumber: (lastAttempt?.attemptNumber || 0) + 1,
    },
  });

  res.json({
    success: true,
    data: {
      attemptId: newAttempt.id,
      attemptNumber: newAttempt.attemptNumber,
      startedAt: newAttempt.startedAt,
      message: 'New attempt started',
    },
  });
});

// Submit answer
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { attemptId, questionId, answer } = req.body;
  const userId = req.user!.id;

  // Verify attempt belongs to user
  const attempt = await prisma.studentAssessment.findFirst({
    where: {
      id: attemptId,
      studentId: userId,
      status: 'in_progress',
    },
    include: {
      assessment: true,
    },
  });

  if (!attempt) {
    throw new AppError('Assessment attempt not found or already completed', 404);
  }

  // Get question
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  // Auto-grade if possible
  let isCorrect: boolean | null = null;
  let points: number | null = null;

  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    const correctOption = question.options?.find((opt: any) => opt.isCorrect);
    isCorrect = correctOption?.text === answer;
    points = isCorrect ? question.points : 0;
  } else if (question.type === 'short_answer' && question.correctAnswer) {
    // Simple string comparison (can be enhanced with fuzzy matching)
    isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    points = isCorrect ? question.points : 0;
  }
  // For essay and code questions, leave for manual/AI grading

  // Save answer
  const studentAnswer = await prisma.studentAnswer.create({
    data: {
      attemptId,
      questionId,
      answer,
      isCorrect,
      points,
    },
  });

  res.json({
    success: true,
    data: {
      answerId: studentAnswer.id,
      isCorrect,
      points,
      message: isCorrect !== null ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Answer submitted for review',
    },
  });
});

// Complete assessment
export const completeAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { attemptId } = req.body;
  const userId = req.user!.id;

  // Verify attempt
  const attempt = await prisma.studentAssessment.findFirst({
    where: {
      id: attemptId,
      studentId: userId,
      status: 'in_progress',
    },
    include: {
      assessment: true,
      answers: true,
    },
  });

  if (!attempt) {
    throw new AppError('Assessment attempt not found or already completed', 404);
  }

  // Calculate score
  const totalPoints = attempt.answers.reduce((sum, ans) => sum + (ans.points || 0), 0);
  const maxPoints = await prisma.quizQuestion.aggregate({
    where: {
      quiz: {
        assessmentId: attempt.assessmentId,
      },
    },
    _sum: {
      points: true,
    },
  });

  const score = maxPoints._sum.points
    ? Math.round((totalPoints / maxPoints._sum.points) * 100)
    : 0;

  const passed = score >= attempt.assessment.passingScore;

  // Update attempt
  const updatedAttempt = await prisma.studentAssessment.update({
    where: { id: attemptId },
    data: {
      score,
      status: passed ? 'passed' : 'failed',
      completedAt: new Date(),
    },
  });

  // Update lesson progress if passed
  if (passed) {
    await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId: attempt.assessment.lessonId,
        },
      },
      update: {
        status: 'completed',
        score,
        completedAt: new Date(),
      },
      create: {
        studentId: userId,
        lessonId: attempt.assessment.lessonId,
        status: 'completed',
        score,
        completedAt: new Date(),
      },
    });
  }

  res.json({
    success: true,
    data: {
      attemptId: updatedAttempt.id,
      score,
      status: updatedAttempt.status,
      passed,
      completedAt: updatedAttempt.completedAt,
    },
  });
});

// Get assessment results
export const getAssessmentResults = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const attempt = await prisma.studentAssessment.findFirst({
    where: {
      assessmentId: id,
      studentId: userId,
    },
    orderBy: {
      attemptNumber: 'desc',
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
      assessment: {
        include: {
          lesson: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError('No attempts found for this assessment', 404);
  }

  res.json({
    success: true,
    data: {
      attempt: {
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
      },
      answers: attempt.answers.map((ans) => ({
        questionId: ans.questionId,
        question: ans.question.question,
        yourAnswer: ans.answer,
        correctAnswer: ans.question.correctAnswer,
        isCorrect: ans.isCorrect,
        points: ans.points,
        maxPoints: ans.question.points,
        explanation: ans.question.explanation,
      })),
    },
  });
});

// Create assessment (teacher/admin)
export const createAssessment = asyncHandler(async (req: Request, res: Response) => {
  const {
    lessonId,
    type,
    title,
    description,
    maxScore,
    passingScore,
    timeLimit,
    maxAttempts,
    questions,
  } = req.body;

  const assessment = await prisma.assessment.create({
    data: {
      lessonId,
      type,
      title,
      description,
      maxScore,
      passingScore,
      timeLimit,
      maxAttempts,
      createdBy: req.user!.id,
      quizzes: {
        create: [
          {
            title: `${title} - Quiz`,
            timeLimit,
            questions: {
              create: questions.map((q: any, index: number) => ({
                type: q.type,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                points: q.points || 10,
                orderIndex: index,
                aiGradable: q.type === 'multiple_choice' || q.type === 'true_false',
              })),
            },
          },
        ],
      },
    },
    include: {
      quizzes: {
        include: {
          questions: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Assessment created successfully',
    data: assessment,
  });
});

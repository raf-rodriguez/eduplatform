import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

// ============================================
// FORUM THREADS
// ============================================

// GET /api/forum/threads - List threads (by subject, paginated)
export const getThreads = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const subjectId = (req.query.subjectId as string) || null;
  const lessonId = (req.query.lessonId as string) || null;
  const search = (req.query.search as string) || '';

  const where: any = {};
  if (subjectId) where.subjectId = subjectId;
  if (lessonId) where.lessonId = lessonId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Pinned threads first, then by createdAt descending
  const [threads, total] = await Promise.all([
    prisma.forumThread.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    }),
    prisma.forumThread.count({ where }),
  ]);

  const formattedThreads = threads.map((thread: any) => ({
    id: thread.id,
    subjectId: thread.subjectId,
    lessonId: thread.lessonId,
    title: thread.title,
    content: thread.content,
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    viewCount: thread.viewCount,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    author: thread.author,
    replyCount: thread._count.replies,
  }));

  res.json({
    success: true,
    data: {
      threads: formattedThreads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// GET /api/forum/threads/:id - Get thread with replies
export const getThreadById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const thread = await prisma.forumThread.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  res.json({
    success: true,
    data: {
      ...thread,
      replyCount: thread._count.replies,
    },
  });
});

// POST /api/forum/threads - Create new thread
export const createThread = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, content, subjectId, lessonId } = req.body;

  if (!title || !title.trim()) {
    throw new AppError('Title is required', 400);
  }

  if (!content || !content.trim()) {
    throw new AppError('Content is required', 400);
  }

  const thread = await prisma.forumThread.create({
    data: {
      authorId: userId,
      title: title.trim(),
      content: content.trim(),
      subjectId: subjectId || null,
      lessonId: lessonId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Thread created successfully',
    data: thread,
  });
});

// PUT /api/forum/threads/:id/view - Increment view count
export const incrementViewCount = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const thread = await prisma.forumThread.findUnique({ where: { id } });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  await prisma.forumThread.update({
    where: { id },
    data: { viewCount: thread.viewCount + 1 },
  });

  res.json({
    success: true,
    message: 'View count updated',
  });
});

// DELETE /api/forum/threads/:id - Delete thread (author only)
export const deleteThread = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const thread = await prisma.forumThread.findUnique({ where: { id } });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  if (thread.authorId !== userId) {
    throw new AppError('Access denied. Only the author can delete this thread.', 403);
  }

  await prisma.forumThread.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Thread deleted successfully',
  });
});

// ============================================
// FORUM REPLIES
// ============================================

// POST /api/forum/threads/:id/replies - Add reply
export const createReply = asyncHandler(async (req: Request, res: Response) => {
  const threadId = req.params.id as string;
  const userId = req.user!.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new AppError('Content is required', 400);
  }

  // Verify thread exists and is not locked
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  if (thread.isLocked) {
    throw new AppError('This thread is locked and cannot receive replies.', 400);
  }

  const reply = await prisma.forumReply.create({
    data: {
      threadId,
      authorId: userId,
      content: content.trim(),
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Reply posted successfully',
    data: reply,
  });
});

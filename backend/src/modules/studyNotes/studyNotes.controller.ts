import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

const VALID_COLORS = ['yellow', 'blue', 'green', 'pink', 'purple'];

// GET /api/notes - List user's notes (paginated, searchable, filterable by tags)
export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const search = (req.query.search as string) || '';
  const tags = (req.query.tags as string) || '';
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  const where: any = { studentId: userId };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length > 0) {
      where.tags = { hasSome: tagList };
    }
  }

  const [notes, total] = await Promise.all([
    prisma.studyNote.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.studyNote.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// GET /api/notes/:id - Get single note
export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const note = await prisma.studyNote.findUnique({
    where: { id },
  });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.studentId !== userId) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: note,
  });
});

// POST /api/notes - Create note
export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, content, color, isPinned, tags, lessonId, subjectId } = req.body;

  if (!title || !title.trim()) {
    throw new AppError('Title is required', 400);
  }

  if (!content || !content.trim()) {
    throw new AppError('Content is required', 400);
  }

  const noteColor = color && VALID_COLORS.includes(color) ? color : 'yellow';
  const noteTags = Array.isArray(tags) ? tags : [];
  const noteLessonId = lessonId || null;
  const noteSubjectId = subjectId || null;

  const note = await prisma.studyNote.create({
    data: {
      studentId: userId,
      title: title.trim(),
      content: content.trim(),
      color: noteColor,
      isPinned: isPinned || false,
      tags: noteTags,
      lessonId: noteLessonId,
      subjectId: noteSubjectId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

// PUT /api/notes/:id - Update note
export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const existing = await prisma.studyNote.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Note not found', 404);
  }

  if (existing.studentId !== userId) {
    throw new AppError('Access denied', 403);
  }

  const { title, content, color, isPinned, tags, lessonId, subjectId } = req.body;

  const updateData: any = {};

  if (title !== undefined) updateData.title = title.trim();
  if (content !== undefined) updateData.content = content.trim();
  if (color !== undefined) {
    updateData.color = VALID_COLORS.includes(color) ? color : existing.color;
  }
  if (isPinned !== undefined) updateData.isPinned = isPinned;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
  if (lessonId !== undefined) updateData.lessonId = lessonId || null;
  if (subjectId !== undefined) updateData.subjectId = subjectId || null;

  const note = await prisma.studyNote.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
});

// DELETE /api/notes/:id - Delete note
export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const existing = await prisma.studyNote.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Note not found', 404);
  }

  if (existing.studentId !== userId) {
    throw new AppError('Access denied', 403);
  }

  await prisma.studyNote.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
});

// GET /api/notes/lesson/:lessonId - Get notes for specific lesson
export const getNotesByLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId as string;
  const userId = req.user!.id;

  const notes = await prisma.studyNote.findMany({
    where: {
      studentId: userId,
      lessonId,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: notes,
  });
});

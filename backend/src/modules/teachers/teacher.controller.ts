import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';
import { logger } from '../../config/logger';

// Get all teacher assignments (admin only)
export const getTeacherAssignments = asyncHandler(async (req: Request, res: Response) => {
  const assignments = await prisma.teacherSubject.findMany({
    include: {
      teacher: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      subject: {
        select: { id: true, name: true, code: true },
      },
      grade: {
        select: { id: true, name: true, level: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: assignments,
  });
});

// Get assignments for current teacher
export const getMyAssignments = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = req.user!.id;

  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      grade: { select: { id: true, name: true, level: true } },
    },
  });

  // Get students for this teacher's assignments
  const gradeLevels = assignments.map(a => a.grade.level);
  const students = await prisma.user.findMany({
    where: {
      gradeLevel: { in: gradeLevels },
      isActive: true,
      roles: { some: { role: { name: 'STUDENT' } } },
    },
    select: {
      id: true, firstName: true, lastName: true, email: true, gradeLevel: true,
    },
  });

  res.json({
    success: true,
    data: { assignments, students },
  });
});

// Create teacher assignment (admin only)
export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { teacherId, subjectId, gradeId } = req.body;

  if (!teacherId || !subjectId || !gradeId) {
    throw new AppError('teacherId, subjectId, y gradeId son requeridos', 400);
  }

  // Verify teacher exists
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    include: { roles: { include: { role: true } } },
  });

  if (!teacher || !teacher.roles.some(r => r.role.name === 'TEACHER')) {
    throw new AppError('El usuario no es un maestro válido', 400);
  }

  // Check if already exists
  const existing = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId_gradeId: { teacherId, subjectId, gradeId },
    },
  });

  if (existing) {
    throw new AppError('Esta asignación ya existe', 409);
  }

  const assignment = await prisma.teacherSubject.create({
    data: { teacherId, subjectId, gradeId },
    include: {
      teacher: { select: { firstName: true, lastName: true, email: true } },
      subject: { select: { name: true, code: true } },
      grade: { select: { name: true, level: true } },
    },
  });

  logger.info(`Teacher assigned: ${teacher.firstName} ${teacher.lastName} → ${assignment.subject.name} (${assignment.grade.name}) by admin ${req.user!.id}`);

  res.status(201).json({
    success: true,
    message: 'Maestro asignado correctamente',
    data: assignment,
  });
});

// Delete teacher assignment (admin only)
export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const existing: any = await prisma.teacherSubject.findUnique({
    where: { id },
    include: { teacher: { select: { firstName: true, lastName: true } }, subject: { select: { name: true } }, grade: { select: { name: true } } },
  });

  if (!existing) {
    throw new AppError('Asignación no encontrada', 404);
  }

  await prisma.teacherSubject.delete({ where: { id } });

  logger.info(`Teacher assignment removed: ${existing.teacher.firstName} → ${existing.subject.name} (${existing.grade.name}) by admin ${req.user!.id}`);

  res.json({
    success: true,
    message: 'Asignación eliminada',
  });
});

// Get students by teacher (for teacher's own view)
export const getTeacherStudents = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = req.user!.id;

  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId },
    select: { grade: { select: { level: true } }, subject: { select: { id: true, name: true } } },
  });

  if (!assignments.length) {
    return res.json({ success: true, data: { students: [], assignments: [] } });
  }

  const gradeLevels = assignments.map(a => a.grade.level);
  const students = await prisma.user.findMany({
    where: {
      gradeLevel: { in: gradeLevels },
      isActive: true,
      roles: { some: { role: { name: 'STUDENT' } } },
    },
    select: {
      id: true, firstName: true, lastName: true, email: true, gradeLevel: true,
      progress: { select: { id: true, status: true } },
    },
  });

  res.json({
    success: true,
    data: { students, assignments },
  });
});

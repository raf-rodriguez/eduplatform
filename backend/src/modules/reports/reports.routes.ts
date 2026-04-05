import { Router } from 'express';
import {
  getTeacherDashboard,
  getStudents,
  getStudentDetail,
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  createSubject,
  updateSubject,
  deleteSubject,
  createModule,
  createLesson,
  getLessonsByModule,
} from '../reports/reports.controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', getTeacherDashboard);

// Students
router.get('/students', getStudents);
router.get('/students/:studentId', getStudentDetail);

// Grades & Subjects
router.get('/grades', getGrades);
router.post('/grades', createGrade);
router.put('/grades/:id', updateGrade);
router.delete('/grades/:id', deleteGrade);

// Subjects
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Modules
router.post('/modules', createModule);

// Lessons
router.post('/lessons', createLesson);
router.get('/modules/:moduleId/lessons', getLessonsByModule);

export default router;

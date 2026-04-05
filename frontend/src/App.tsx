import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

// Layouts
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public pages
import Home from '@/pages/public/Home'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Pricing from '@/pages/public/Pricing'

// Student pages
import StudentDashboard from '@/pages/student/Dashboard'
import Curriculum from '@/pages/student/Curriculum'
import SubjectDetail from '@/pages/student/SubjectDetail'
import Lesson from '@/pages/student/Lesson'
import Assessment from '@/pages/student/Assessment'
import Progress from '@/pages/student/Progress'
import Gamification from '@/pages/student/Gamification'
import Achievements from '@/pages/student/Achievements'
import Leaderboard from '@/pages/student/Leaderboard'
import XpHistory from '@/pages/student/XpHistory'
import StreakTracker from '@/pages/student/StreakTracker'
import DailyChallenges from '@/pages/student/DailyChallenges'
import StudyTimer from '@/pages/student/StudyTimer'
import Profile from '@/pages/student/Profile'
import Settings from '@/pages/student/Settings'
import StudySchedule from '@/pages/student/StudySchedule'
import StudyNotes from '@/pages/student/StudyNotes'
import Analytics from '@/pages/student/Analytics'
import StudyAnalytics from '@/pages/student/StudyAnalytics'
import Calendar from '@/pages/student/Calendar'
import Forum from '@/pages/student/Forum'
import Messages from '@/pages/student/Messages'
import Notifications from '@/pages/student/Notifications'
import Help from '@/pages/student/Help'
import ReportCard from '@/pages/student/ReportCard'
import WeaknessAnalysis from '@/pages/student/WeaknessAnalysis'

// Teacher pages
import TeacherDashboard from '@/pages/teacher/Dashboard'
import ManageContent from '@/pages/teacher/ManageContent'
import CreateAssessment from '@/pages/teacher/CreateAssessment'
import StudentProgress from '@/pages/teacher/StudentProgress'
import GradesPage from '@/pages/teacher/GradesPage'
import StudentsPage from '@/pages/teacher/StudentsPage'
import StudentDetailPage from '@/pages/teacher/StudentDetailPage'
import Attendance from '@/pages/teacher/Attendance'
import ClassCalendar from '@/pages/teacher/ClassCalendar'
import StudentFeedback from '@/pages/teacher/StudentFeedback'
import Reports from '@/pages/teacher/Reports'
import TeacherMessages from '@/pages/teacher/TeacherMessages'
import LessonEditor from '@/pages/teacher/LessonEditor'
import QuestionBank from '@/pages/teacher/QuestionBank'
import AssessmentTemplates from '@/pages/teacher/AssessmentTemplates'
import ClassAnalytics from '@/pages/teacher/ClassAnalytics'
import ProfileSettings from '@/pages/teacher/ProfileSettings'
import BadgeManagement from '@/pages/teacher/BadgeManagement'
import ForumModeration from '@/pages/teacher/ForumModeration'
import ParentIntegration from '@/pages/teacher/ParentIntegration'
import AITeacherAgent from '@/pages/teacher/AIAgent'
import TeacherSubject from '@/pages/teacher/TeacherSubject'

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard'
import UserManagement from '@/pages/admin/UserManagement'
import ManageStudents from '@/pages/admin/ManageStudents'
import ManageTeachers from '@/pages/admin/ManageTeachers'
import TeacherAssignments from '@/pages/admin/TeacherAssignments'
import ContentManagement from '@/pages/admin/ContentManagement'
import SystemSettings from '@/pages/admin/SystemSettings'
import AuditLogs from '@/pages/admin/AuditLogs'
import RolesManagement from '@/pages/admin/RolesManagement'
import GradesOverview from '@/pages/admin/GradesOverview'
import AdminProfile from '@/pages/admin/Profile'

// Protected Route
import ProtectedRoute from '@/components/common/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/curriculum" element={<Curriculum />} />
            <Route path="/student/subject/:subjectId" element={<SubjectDetail />} />
            <Route path="/student/lesson/:id" element={<Lesson />} />
            <Route path="/student/assessment/:id" element={<Assessment />} />
            <Route path="/student/progress" element={<Progress />} />
            <Route path="/student/gamification" element={<Gamification />} />
            <Route path="/student/achievements" element={<Achievements />} />
            <Route path="/student/leaderboard" element={<Leaderboard />} />
            <Route path="/student/xp-history" element={<XpHistory />} />
            <Route path="/student/streak" element={<StreakTracker />} />
            <Route path="/student/daily-challenges" element={<DailyChallenges />} />
            <Route path="/student/study-timer" element={<StudyTimer />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/settings" element={<Settings />} />
            <Route path="/student/schedule" element={<StudySchedule />} />
            <Route path="/student/calendar" element={<Calendar />} />
            <Route path="/student/notes" element={<StudyNotes />} />
            <Route path="/student/analytics" element={<Analytics />} />
            <Route path="/student/study-analytics" element={<StudyAnalytics />} />
            <Route path="/student/forum" element={<Forum />} />
            <Route path="/student/forum/:threadId" element={<Forum />} />
            <Route path="/student/messages" element={<Messages />} />
            <Route path="/student/notifications" element={<Notifications />} />
            <Route path="/student/help" element={<Help />} />
            <Route path="/student/report-card" element={<ReportCard />} />
            <Route path="/student/weakness-analysis" element={<WeaknessAnalysis />} />
          </Route>
        </Route>

        {/* Teacher routes */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/content" element={<ManageContent />} />
            <Route path="/teacher/content/lesson/:id?" element={<LessonEditor />} />
            <Route path="/teacher/assessment/create" element={<CreateAssessment />} />
            <Route path="/teacher/assessment/templates" element={<AssessmentTemplates />} />
            <Route path="/teacher/assessment/question-bank" element={<QuestionBank />} />
            <Route path="/teacher/students" element={<StudentsPage />} />
            <Route path="/teacher/students/:studentId" element={<StudentDetailPage />} />
            <Route path="/teacher/students/progress" element={<StudentProgress />} />
            <Route path="/teacher/students/feedback" element={<StudentFeedback />} />
            <Route path="/teacher/students/grades" element={<GradesPage />} />
            <Route path="/teacher/attendance" element={<Attendance />} />
            <Route path="/teacher/calendar" element={<ClassCalendar />} />
            <Route path="/teacher/messages" element={<TeacherMessages />} />
            <Route path="/teacher/analytics" element={<ClassAnalytics />} />
            <Route path="/teacher/reports" element={<Reports />} />
            <Route path="/teacher/badges" element={<BadgeManagement />} />
            <Route path="/teacher/forum" element={<ForumModeration />} />
            <Route path="/teacher/parents" element={<ParentIntegration />} />
            <Route path="/teacher/profile" element={<ProfileSettings />} />
            <Route path="/teacher/ai-agent" element={<AITeacherAgent />} />
            <Route path="/teacher/subject" element={<TeacherSubject />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/teachers" element={<ManageTeachers />} />
            <Route path="/admin/teachers/assignments" element={<TeacherAssignments />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/grades" element={<GradesOverview />} />
            <Route path="/admin/users/roles" element={<RolesManagement />} />
            <Route path="/admin/content" element={<ContentManagement />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App

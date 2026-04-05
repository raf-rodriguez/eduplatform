import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  Users,
  FileText,
  Menu,
  LogOut,
  User,
  Sun,
  Moon,
  StickyNote,
  LineChart,
  MessageSquare,
  Timer,
  Target,
  Flame,
  Zap,
  Medal,
  MessageCircle,
  Brain,
  CheckCircle,
  FileBarChart,
  HelpCircle,
  CalendarDays,
  Database,
  ClipboardList,
  Mail,
  Shield,
  Award,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import { getInitials } from '@/lib/utils'
import NotificationCenter from '@/components/common/NotificationCenter'

// Helper functions for role-aware navigation
const getProfilePath = (roles: string[]): string => {
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return '/admin/profile'
  if (roles.includes('TEACHER')) return '/teacher/profile'
  return '/student/profile'
}

const getSettingsPath = (roles: string[]): string => {
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return '/admin/settings'
  if (roles.includes('TEACHER')) return '/teacher/profile'
  return '/student/settings'
}

// Section translation labels
const studentNavKeys = [
  { section: 'nav_principal' },
  { name: 'dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'my_curriculum', href: '/student/curriculum', icon: BookOpen },
  { name: 'calendar', href: '/student/calendar', icon: CalendarDays },
  { name: 'progress', href: '/student/progress', icon: BarChart3 },

  { section: 'nav_learning' },
  { name: 'notes', href: '/student/notes', icon: StickyNote },
  { name: 'timer', href: '/student/study-timer', icon: Timer },
  { name: 'daily_challenges', href: '/student/daily-challenges', icon: Target },
  { name: 'ai_analysis', href: '/student/weakness-analysis', icon: Brain },

  { section: 'nav_gamification' },
  { name: 'achievements', href: '/student/gamification', icon: Trophy },
  { name: 'badges', href: '/student/achievements', icon: Medal },
  { name: 'leaderboard', href: '/student/leaderboard', icon: Flame },
  { name: 'xp_history', href: '/student/xp-history', icon: Zap },
  { name: 'streak', href: '/student/streak', icon: Flame },

  { section: 'nav_communication' },
  { name: 'messages', href: '/student/messages', icon: MessageCircle },
  { name: 'forum', href: '/student/forum', icon: MessageSquare },

  { section: 'nav_analytics' },
  { name: 'analytics', href: '/student/study-analytics', icon: LineChart },
  { name: 'report_card', href: '/student/report-card', icon: FileBarChart },

  { section: 'nav_support' },
  { name: 'help', href: '/student/help', icon: HelpCircle },
]

const sectionLabels: Record<string, { es: string; en: string }> = {
  nav_principal: { es: 'Principal', en: 'Main' },
  nav_learning: { es: 'Aprendizaje', en: 'Learning' },
  nav_gamification: { es: 'Gamificación', en: 'Gamification' },
  nav_communication: { es: 'Comunicación', en: 'Communication' },
  nav_analytics: { es: 'Analíticas', en: 'Analytics' },
  nav_support: { es: 'Soporte', en: 'Support' },
}

const navItemLabels: Record<string, { es: string; en: string }> = {
  dashboard: { es: 'Dashboard', en: 'Dashboard' },
  'Maestros': { es: 'Maestros', en: 'Teachers' },
  'Estudiantes': { es: 'Estudiantes', en: 'Students' },
  my_curriculum: { es: 'Mi Currículo', en: 'My Curriculum' },
  calendar: { es: 'Calendario', en: 'Calendar' },
  progress: { es: 'Progreso', en: 'Progress' },
  notes: { es: 'Notas', en: 'Notes' },
  timer: { es: 'Temporizador', en: 'Study Timer' },
  daily_challenges: { es: 'Desafíos Diarios', en: 'Daily Challenges' },
  ai_analysis: { es: 'Análisis IA', en: 'AI Analysis' },
  achievements: { es: 'Logros', en: 'Achievements' },
  badges: { es: 'Medallas', en: 'Badges' },
  leaderboard: { es: 'Ranking', en: 'Leaderboard' },
  xp_history: { es: 'Historial XP', en: 'XP History' },
  streak: { es: 'Racha', en: 'Streak' },
  messages: { es: 'Mensajes', en: 'Messages' },
  forum: { es: 'Forum', en: 'Forum' },
  analytics: { es: 'Estudio', en: 'Study Analytics' },
  report_card: { es: 'Boletín', en: 'Report Card' },
  help: { es: 'Ayuda', en: 'Help' },
  'Asistente IA': { es: 'Asistente IA', en: 'AI Assistant' },
  'Mi Materia': { es: 'Mi Materia', en: 'My Subject' },
}

const teacherNav = [
  // Principal
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard, section: 'principal' },
  { name: 'Contenido', href: '/teacher/content', icon: BookOpen, section: 'principal' },
  { name: 'Asistente IA', href: '/teacher/ai-agent', icon: Brain, section: 'principal' },
  { name: 'Calendario', href: '/teacher/calendar', icon: CalendarDays, section: 'principal' },
  { name: 'Estadísticas', href: '/teacher/analytics', icon: BarChart3, section: 'principal' },
  { name: 'Reportes', href: '/teacher/reports', icon: FileBarChart, section: 'principal' },

  // Estudiantes
  { name: 'Lista Estudiantes', href: '/teacher/students', icon: Users, section: 'students' },
  { name: 'Progreso', href: '/teacher/students/progress', icon: LineChart, section: 'students' },
  { name: 'Feedback', href: '/teacher/students/feedback', icon: MessageSquare, section: 'students' },

  // Materia
  { name: 'Mi Materia', href: '/teacher/subject', icon: ClipboardList, section: 'subject' },

  // Evaluaciones
  { name: 'Crear Evaluación', href: '/teacher/assessment/create', icon: FileText, section: 'assessments' },
  { name: 'Plantillas', href: '/teacher/assessment/templates', icon: ClipboardList, section: 'assessments' },
  { name: 'Banco Preguntas', href: '/teacher/assessment/question-bank', icon: Database, section: 'assessments' },

  // Comunicación
  { name: 'Mensajes', href: '/teacher/messages', icon: MessageCircle, section: 'communication' },
  { name: 'Foro', href: '/teacher/forum', icon: Shield, section: 'communication' },
  { name: 'Padres', href: '/teacher/parents', icon: Mail, section: 'communication' },

  // Gestión
  { name: 'Asistencia', href: '/teacher/attendance', icon: CheckCircle, section: 'management' },
  { name: 'Badges', href: '/teacher/badges', icon: Award, section: 'management' },

  // Perfil
  { name: 'Mi Perfil', href: '/teacher/profile', icon: User, section: 'profile' },
]

const teacherSections: Record<string, string> = {
  principal: 'Principal',
  students: 'Estudiantes',
  subject: 'Materia',
  assessments: 'Evaluaciones',
  communication: 'Comunicación',
  management: 'Gestión',
  profile: 'Perfil',
}

const adminNav = [
  // Principal
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, section: 'principal' },

  // Gestión de Usuarios
  { name: 'Estudiantes', href: '/admin/students', icon: GraduationCap, section: 'users' },
  { name: 'Maestros', href: '/admin/teachers', icon: Users, section: 'users' },
  { name: 'Asignar Maestros', href: '/admin/teachers/assignments', icon: ClipboardList, section: 'users' },

  // Académico
  { name: 'Contenido', href: '/admin/content', icon: BookOpen, section: 'academic' },
  { name: 'Grados', href: '/admin/users/grades', icon: GraduationCap, section: 'academic' },
  { name: 'Roles y Permisos', href: '/admin/users/roles', icon: Shield, section: 'academic' },

  // Auditoría
  { name: 'Auditoría', href: '/admin/audit', icon: Activity, section: 'audit' },
]

const adminSections: Record<string, string> = {
  principal: 'General',
  users: 'Gestión de Usuarios',
  academic: 'Académico',
  audit: 'Auditoría',
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const { language } = useLanguage()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const t = (key: string): string => {
    const section = sectionLabels[key]
    if (section) return section[language] || section.es
    const nav = navItemLabels[key]
    return nav?.[language] || nav?.es || key
  }

  const navItems = location.pathname.startsWith('/student')
    ? studentNavKeys
    : location.pathname.startsWith('/teacher')
      ? teacherNav
      : adminNav

  const renderNav = (items: typeof navItems) => {
    const isTeacher = location.pathname.startsWith('/teacher')
    const isAdmin = location.pathname.startsWith('/admin')
    const renderedSections = new Set<string>()
    const sectionMap = isTeacher ? teacherSections : isAdmin ? adminSections : sectionLabels

    return items.flatMap((item: any) => {
      // For teacher/admin nav, show section headers
      if ((isTeacher || isAdmin) && item.section) {
        const elements: React.ReactNode[] = []

        // Add section header if not yet rendered
        if (!renderedSections.has(item.section)) {
          renderedSections.add(item.section)
          const sectionLabel = sectionMap[item.section] || item.section
          elements.push(
            <div key={`section-${item.section}`} className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {sectionLabel}
              </p>
            </div>
          )
        }

        // Add the actual nav link
        const Icon = item.icon
        const isActive = location.pathname === item.href
        elements.push(
          <Link
            key={item.name || item.href}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            <Icon className="h-5 w-5" />
            {isTeacher || isAdmin ? item.name : (t(item.name) || item.name)}
          </Link>
        )

        return elements
      }

      // For student nav section headers (original behavior)
      if (item.section && !isTeacher && !isAdmin) {
        return (
          <div key={item.section} className="pt-4 pb-1 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t(item.section)}
            </p>
          </div>
        )
      }

      const Icon = item.icon
      const isActive = location.pathname === item.href
      return (
        <Link
          key={item.name || item.href}
          to={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
        >
          <Icon className="h-5 w-5" />
          {t(item.name)}
        </Link>
      )
    }).filter(Boolean)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">EduPlatform</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {renderNav(navItems)}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden border-b bg-background px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold">EduPlatform</span>
          </Link>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="mt-8 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
                  {renderNav(navItems)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex border-b bg-background px-6 h-16 items-center justify-between">
          <h1 className="text-xl font-semibold">
            {(() => {
              const currentItem = navItems.find((item: any) => item.href === location.pathname)
              if (!currentItem?.name) return 'Dashboard'
              const isTeacherNav = location.pathname.startsWith('/teacher')
              const isAdminNav = location.pathname.startsWith('/admin')
              return (isTeacherNav || isAdminNav) ? currentItem.name : (t(currentItem.name) || currentItem.name)
            })()}
          </h1>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getProfilePath(user?.roles || []))}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(getSettingsPath(user?.roles || []))}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

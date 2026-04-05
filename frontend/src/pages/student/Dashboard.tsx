import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Trophy, Flame, Target, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import DailyChallenge from '@/components/common/DailyChallenge'

interface Lesson {
  id: string
  title: string
  orderIndex: number
  progress?: Array<{ status: string }>
  module?: {
    name: string
    subject: { name: string; code: string }
  }
}

interface DashboardData {
  progress: {
    total: number
    completed: number
    percentage: number
  }
  gamification: {
    level: number
    totalXp: number
    currentStreak: number
  }
  inProgressLessons: Lesson[]
}

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [progressRes, gamificationRes, curriculumRes] = await Promise.all([
          api.get('/progress/summary').catch(() => ({ data: { data: { overall: { total: 0, completed: 0, percentage: 0 } } } })),
          api.get('/gamification/profile').catch(() => ({ data: { data: { profile: { level: 1, totalXp: 0, currentStreak: 0 } } } })),
          api.get('/content/my-curriculum').catch(() => ({ data: { data: { grade: null, subjects: [] } } })),
        ])

        // Extract in-progress lessons from curriculum
        const subjects = curriculumRes.data.data?.subjects || []
        const inProgressLessons: Lesson[] = []

        for (const subject of subjects) {
          for (const mod of subject.modules || []) {
            for (const lesson of mod.lessons || []) {
              const isProgress = lesson.progress?.some((p: any) => p.status === 'in_progress')
              const isNotCompleted = !lesson.progress?.some((p: any) => p.status === 'completed')
              if (isProgress || isNotCompleted) {
                inProgressLessons.push({
                  ...lesson,
                  module: {
                    name: mod.name,
                    subject: { name: subject.name, code: subject.code },
                  },
                })
              }
              if (inProgressLessons.length >= 3) break
            }
            if (inProgressLessons.length >= 3) break
          }
          if (inProgressLessons.length >= 3) break
        }

        setData({
          progress: progressRes.data.data?.overall || { total: 0, completed: 0, percentage: 0 },
          gamification: gamificationRes.data.data?.profile || { level: 1, totalXp: 0, currentStreak: 0 },
          inProgressLessons,
        })
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          ¡Hola, {user?.firstName || 'Estudiante'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje donde lo dejaste.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nivel</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.gamification?.level || 1}</div>
            <p className="text-xs text-muted-foreground">
              {data?.gamification?.totalXp || 0} XP total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.gamification?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.progress?.percentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {data?.progress?.completed || 0} de {data?.progress?.total || 0} lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Continuar aprendiendo</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.inProgressLessons && data.inProgressLessons.length > 0 ? (
              <div className="space-y-4">
                {data.inProgressLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lesson.module?.subject.name} • {lesson.module?.name}
                      </p>
                    </div>
                    <Link to={`/student/lesson/${lesson.id}`}>
                      <Button>Continuar</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay lecciones en progreso</p>
                <Link to="/student/curriculum">
                  <Button variant="link" className="mt-2">Ver mi currículo</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <DailyChallenge />

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/student/leaderboard">
                <Button variant="outline" className="w-full justify-start">
                  <Flame className="mr-2 h-4 w-4" /> Ranking
                </Button>
              </Link>
              <Link to="/student/calendar">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" /> Calendario
                </Button>
              </Link>
              <Link to="/student/messages">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" /> Mensajes
                </Button>
              </Link>
              <Link to="/student/study-timer">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" /> Temporizador
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/student/curriculum">
          <Button size="lg">
            <BookOpen className="mr-2 h-5 w-5" />
            Ver mi currículo
          </Button>
        </Link>
        <Link to="/student/progress">
          <Button size="lg" variant="outline">
            <TrendingUp className="mr-2 h-5 w-5" />
            Ver progreso
          </Button>
        </Link>
        <Link to="/student/gamification">
          <Button size="lg" variant="outline">
            <Trophy className="mr-2 h-5 w-5" />
            Mis logros
          </Button>
        </Link>
      </div>
    </div>
  )
}

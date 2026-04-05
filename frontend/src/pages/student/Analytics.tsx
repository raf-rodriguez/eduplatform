import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, TrendingDown, Clock, Target, Award, BookOpen } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316']

const COLORS_MAP: Record<string, string> = {
  'Español': '#3b82f6',
  'Matemáticas': '#22c55e',
  'Ciencia': '#f59e0b',
  'Historia': '#ef4444',
  'Inglés': '#8b5cf6',
  'Inglés Conversacional': '#06b6d4',
  'Robótica': '#ec4899',
  'Finanzas': '#84cc16',
  'Salud': '#f97316',
}

interface SubjectProgress {
  subject: string
  progress: number
  score: number
  lessonsCompleted: number
  lessonsTotal: number
}

export default function LearningAnalytics() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [overallStats, setOverallStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    averageScore: 0,
    studyTime: 0,
    currentStreak: 0,
    level: 1,
    totalXp: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [progressRes, gamifRes] = await Promise.all([
        api.get('/progress/summary'),
        api.get('/gamification/profile'),
      ])

      const progressData = progressRes.data
      setSubjectProgress(progressData.bySubject || [])
      setOverallStats({
        completedLessons: progressData.completed || 0,
        totalLessons: progressData.total || 0,
        averageScore: progressData.averageScore || 0,
        studyTime: progressData.studyTime || 0,
        currentStreak: gamifRes.data.currentStreak || 0,
        level: gamifRes.data.level || 1,
        totalXp: gamifRes.data.totalXp || 0,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las analíticas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStrengthAreas = () => {
    if (subjectProgress.length === 0) return []
    return [...subjectProgress]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
      .map((s) => s.subject)
  }

  const getWeakAreas = () => {
    if (subjectProgress.length === 0) return []
    return [...subjectProgress]
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3)
      .map((s) => s.subject)
  }

  const radarData = subjectProgress.map((s) => ({
    subject: s.subject.length > 12 ? s.subject.substring(0, 12) + '...' : s.subject,
    Progreso: s.progress,
    Rendimiento: s.score,
  }))

  const pieData = subjectProgress.map((s) => ({
    name: s.subject,
    value: s.lessonsCompleted,
  })).filter((d) => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BarChart3 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const strengths = getStrengthAreas()
  const weaknesses = getWeakAreas()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analíticas de Aprendizaje</h1>
        <p className="text-muted-foreground">Visualiza tu rendimiento y áreas de mejora</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Lecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallStats.completedLessons}</p>
            <p className="text-xs text-muted-foreground">de {overallStats.totalLessons} totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" /> Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallStats.averageScore.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {overallStats.averageScore >= 80 ? '¡Excelente!' : overallStats.averageScore >= 60 ? 'Buen trabajo' : 'Sigue practicando'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Racha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallStats.currentStreak} 🔥</p>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" /> Nivel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallStats.totalXp} XP</p>
            <p className="text-xs text-muted-foreground">Nivel {overallStats.level}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" /> Áreas Fuertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {strengths.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-4 w-4" /> Áreas a Mejorar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {subjectProgress.length > 0 && (
        <>
          {/* Subject Progress Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso por Materia</CardTitle>
              <CardDescription>Porcentaje de avance en cada materia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" name="Progreso %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score vs Progress Radar */}
          {radarData.length >= 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Radar de Rendimiento</CardTitle>
                <CardDescription>Comparación de progreso vs rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Progreso" dataKey="Progreso" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Rendimiento" dataKey="Rendimiento" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Lessons Distribution Pie Chart */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Lecciones Completadas</CardTitle>
                <CardDescription>Lecciones completadas por materia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Detailed Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle por Materia</CardTitle>
              <CardDescription>Progreso y rendimiento detallado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgress.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-sm font-medium truncate">{subject.subject}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={subject.progress} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-12 text-right">{subject.progress.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{subject.lessonsCompleted}/{subject.lessonsTotal} lecciones</span>
                        {subject.score > 0 && <span>Promedio: {subject.score.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {subjectProgress.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos aún</h3>
            <p className="text-muted-foreground text-center">
              Completa lecciones y evaluaciones para ver tus analíticas aquí
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

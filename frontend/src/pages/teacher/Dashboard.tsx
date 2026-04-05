import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import api from '@/services/api'

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would be a real endpoint in production
        // const response = await api.get('/reports/dashboard')
        setStats({
          totalStudents: 45,
          activeToday: 32,
          atRisk: 5,
          averageScore: 78,
          pendingAssessments: 12,
          recentActivity: [
            { type: 'submission', message: 'María G. completó el examen de Matemáticas', time: '10 min ago' },
            { type: 'alert', message: '3 estudiantes no han iniciado el módulo 3', time: '1 hora ago' },
            { type: 'success', message: 'Carlos R. aprobó Programación Básica', time: '2 horas ago' },
          ],
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
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
      <div>
        <h1 className="text-3xl font-bold">Panel del Maestro</h1>
        <p className="text-muted-foreground">Gestiona tus clases y estudiantes</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/teacher/content">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Gestionar Contenido
          </Button>
        </Link>
        <Link to="/teacher/assessment/create">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Crear Evaluación
          </Button>
        </Link>
        <Link to="/teacher/students">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Ver Estudiantes
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mis Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeToday} activos hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore}%</div>
            <p className="text-xs text-muted-foreground">en evaluaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.atRisk}</div>
            <p className="text-xs text-muted-foreground">estudiantes en riesgo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAssessments}</div>
            <p className="text-xs text-muted-foreground">evaluaciones por revisar</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                {activity.type === 'submission' && (
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                )}
                {activity.type === 'alert' && (
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                )}
                {activity.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Materia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Matemáticas', score: 85 },
              { name: 'Español', score: 92 },
              { name: 'Ciencias', score: 78 },
              { name: 'Inglés', score: 88 },
            ].map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{subject.name}</span>
                  <span className="text-sm text-muted-foreground">{subject.score}%</span>
                </div>
                <Progress value={subject.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

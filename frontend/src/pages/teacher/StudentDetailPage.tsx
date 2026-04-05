import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Award, BookOpen, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'

interface Student {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  averageScore: number
  totalAssessments: number
  passedAssessments: number
  failedAssessments: number
  completedLessons: number
  inProgressLessons: number
  level: number
  totalXp: number
  progress: any[]
  recentAssessments: any[]
}

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail()
    }
  }, [studentId])

  const fetchStudentDetail = async () => {
    try {
      const response = await api.get(`/reports/students/${studentId}`)
      setStudent(response.data.data)
    } catch (error) {
      console.error('Error fetching student detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Estudiante no encontrado</h2>
        <Link to="/teacher/students">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Estudiantes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teacher/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.firstName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {student.firstName[0]}{student.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{student.firstName} {student.lastName}</h1>
            <p className="text-muted-foreground">{student.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nivel</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.level}</div>
            <p className="text-xs text-muted-foreground">{student.totalXp} XP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {student.totalAssessments} evaluaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lecciones</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.completedLessons}</div>
            <p className="text-xs text-muted-foreground">
              {student.inProgressLessons} en progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.totalAssessments > 0
                ? Math.round((student.passedAssessments / student.totalAssessments) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {student.passedAssessments} aprobadas / {student.failedAssessments} reprobadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {student.recentAssessments.length > 0 ? (
            <div className="space-y-3">
              {student.recentAssessments.map((assessment: any) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {assessment.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : assessment.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-xs text-muted-foreground">{assessment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        assessment.status === 'passed'
                          ? 'default'
                          : assessment.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {assessment.status === 'passed'
                        ? 'Aprobado'
                        : assessment.status === 'failed'
                        ? 'Reprobado'
                        : 'En Progreso'}
                    </Badge>
                    {assessment.score !== null && (
                      <span className="font-semibold">{assessment.score}/{assessment.maxScore}</span>
                    )}
                    {assessment.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(assessment.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay evaluaciones registradas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress by Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Materia</CardTitle>
        </CardHeader>
        <CardContent>
          {student.progress.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(
                student.progress.reduce((acc: any, p: any) => {
                  if (!acc[p.subject]) {
                    acc[p.subject] = { completed: 0, total: 0, scores: [] }
                  }
                  acc[p.subject].total += 1
                  if (p.status === 'completed') {
                    acc[p.subject].completed += 1
                    if (p.score) acc[p.subject].scores.push(p.score)
                  }
                  return acc
                }, {})
              ).map(([subject, data]: [string, any]) => {
                const progress = Math.round((data.completed / data.total) * 100)
                const avgScore =
                  data.scores.length > 0
                    ? Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length)
                    : 0
                return (
                  <div key={subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.completed}/{data.total} completadas
                        {avgScore > 0 && ` - ${avgScore}% promedio`}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay progreso registrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

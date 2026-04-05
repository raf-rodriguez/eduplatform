import { useEffect, useState } from 'react'
import { TrendingUp, BookOpen, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'

export default function Progress() {
  const [progress, setProgress] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, assessmentsRes] = await Promise.all([
          api.get('/progress/summary').catch(() => ({ data: { data: { overall: {}, bySubject: [] } } })),
          api.get('/users/me/assessments').catch(() => ({ data: { data: { assessments: [] } } })),
        ])
        setProgress(progressRes.data.data)
        setAssessments(assessmentsRes.data.data.assessments || [])
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const passedAssessments = assessments.filter((a) => a.status === 'passed')
  const failedAssessments = assessments.filter((a) => a.status === 'failed')
  const averageScore =
    assessments.length > 0
      ? Math.round(assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <p className="text-muted-foreground">Seguimiento de tu aprendizaje</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lecciones completadas</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.overall?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {progress?.overall?.total || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones aprobadas</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedAssessments.length}</div>
            <p className="text-xs text-muted-foreground">
              de {assessments.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio general</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">en evaluaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de estudio</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">este mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Por Materia</TabsTrigger>
          <TabsTrigger value="assessments">Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progreso por materia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progress?.bySubject?.map((subject: any) => (
                  <div key={subject.code}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {subject.completed_lessons} / {subject.total_lessons}
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        subject.total_lessons > 0
                          ? (subject.completed_lessons / subject.total_lessons) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No has completado ninguna evaluación aún.
                  </p>
                ) : (
                  assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{assessment.assessment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assessment.assessment.lesson.module.subject.name} •{' '}
                          {new Date(assessment.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${assessment.status === 'passed'
                              ? 'text-green-600'
                              : assessment.status === 'failed'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}
                        >
                          {assessment.score}%
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${assessment.status === 'passed'
                              ? 'bg-green-100 text-green-700'
                              : assessment.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          {assessment.status === 'passed'
                            ? 'Aprobado'
                            : assessment.status === 'failed'
                              ? 'No aprobado'
                              : 'En progreso'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

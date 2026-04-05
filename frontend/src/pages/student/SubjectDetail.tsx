import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Play, CheckCircle, Clock, TrendingUp, Award, FileText,
  StickyNote, ChevronLeft, Loader2, AlertCircle, PlayCircle, Lock,
  User, Download, ExternalLink, Target, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Lesson {
  id: string
  title: string
  orderIndex: number
  duration?: number
  progress?: Array<{ status: string }>
}

interface Module {
  id: string
  name: string
  description?: string
  orderIndex: number
  lessons?: Lesson[]
}

interface SubjectProgress {
  total: number
  completed: number
  percentage: number
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

interface Resource {
  id: string
  title: string
  type: string
  url: string
  description?: string
  createdAt: string
}

interface AssessmentResult {
  id: string
  score: number
  maxScore: number
  status: string
  completedAt: string
  assessment: {
    id: string
    title: string
    type: string
  }
}

interface SubjectNote {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Subject {
  id: string
  name: string
  code: string
  description?: string
  isStem?: boolean
  progress?: SubjectProgress
  modules?: Module[]
  teacher?: Teacher
  resources?: Resource[]
  assessmentResults?: AssessmentResult[]
  notes?: SubjectNote[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const subjectIcons: Record<string, string> = {
  ESP: '\ud83d\udcd6',
  MAT: '\ud83d\udd22',
  CIE: '\ud83d\udd2c',
  HIS: '\ud83c\udf0d',
  ING: '\ud83c\uddec\ud83c\udde7',
  INC: '\ud83d\udcac',
  ROB: '\ud83e\udd16',
  FIN: '\ud83d\udcb0',
  SAL: '\ud83c\udfc3',
  LEC: '\u270f\ufe0f',
  MBAS: '\ud83d\udd35',
  EXP: '\ud83c\udf31',
  ART: '\ud83c\udfa8',
  MUS: '\ud83c\udfb5',
}

function formatDuration(minutes?: number): string {
  if (!minutes) return 'N/A'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function getLessonIcon(lesson: Lesson) {
  const isCompleted = lesson.progress?.some((p) => p.status === 'completed')
  const isInProgress = lesson.progress?.some((p) => p.status === 'in_progress')

  if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
  if (isInProgress) return <PlayCircle className="h-4 w-4 text-blue-500 shrink-0" />
  return <Lock className="h-4 w-4 text-gray-400 shrink-0" />
}

function getSubjectColor(code: string): string {
  const stemSubjects = ['ROB']
  const specialSubjects = ['FIN', 'SAL']
  const coreSubjects = ['ESP', 'MAT', 'CIE', 'HIS', 'ING', 'INC']

  const baseCode = code.split('_')[0]
  if (stemSubjects.includes(baseCode)) return 'border-l-purple-500'
  if (specialSubjects.includes(baseCode)) return 'border-l-orange-500'
  if (coreSubjects.includes(baseCode)) return 'border-l-blue-500'
  return 'border-l-green-500'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('modules')

  // -----------------------------------------------------------------------
  // Fetch subject detail
  // -----------------------------------------------------------------------
  const fetchSubject = useCallback(async () => {
    if (!subjectId) return
    setIsLoading(true)
    try {
      // Fetch subject from curriculum
      const curriculumRes = await api.get('/content/my-curriculum')
      const subjects: Subject[] = curriculumRes.data.data?.subjects || []
      const found = subjects.find((s: Subject) => s.id === subjectId)

      if (!found) {
        toast({
          title: 'Error',
          description: 'No se encontr\u00f3 la materia.',
          variant: 'destructive',
        })
        return
      }

      setSubject(found)

      // Fetch assessment results in parallel
      try {
        const assessmentsRes = await api.get('/users/me/assessments')
        const allAssessments = assessmentsRes.data.data.assessments || []
        const subjectAssessments = allAssessments.filter(
          (a: any) => a.assessment?.lesson?.module?.subject?.id === subjectId
        )
        setSubject((prev) => prev ? { ...prev, assessmentResults: subjectAssessments } : null)
      } catch {
        // no assessments yet
      }

      // Fetch notes linked to this subject
      try {
        const notesRes = await api.get('/notes', {
          params: { subjectId, limit: 50 },
        })
        const notes = notesRes.data.data?.notes || []
        setSubject((prev) => prev ? { ...prev, notes } : null)
      } catch {
        // no notes yet
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la materia.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [subjectId, toast])

  useEffect(() => {
    fetchSubject()
  }, [fetchSubject])

  // -----------------------------------------------------------------------
  // Computed values
  // -----------------------------------------------------------------------
  const icon = subject ? (subjectIcons[subject.code.split('_')[0]] || '\ud83d\udcda') : '\ud83d\udcda'
  const borderColor = subject ? getSubjectColor(subject.code) : 'border-l-gray-300'

  const totalModules = subject?.modules?.length || 0
  const completedModules =
    subject?.modules?.filter(
      (m) => m.lessons?.every((l) => l.progress?.some((p) => p.status === 'completed'))
    ).length || 0

  const totalTimeEstimate =
    subject?.modules?.reduce(
      (acc, m) =>
        acc +
        (m.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0),
      0
    ) || 0

  const averageQuizScore =
    subject?.assessmentResults && subject.assessmentResults.length > 0
      ? Math.round(
          subject.assessmentResults.reduce(
            (sum, a) => sum + (a.score || 0),
            0
          ) / subject.assessmentResults.length
        )
      : null

  // Find next incomplete lesson
  const nextIncompleteLesson = (): Lesson | null => {
    if (!subject?.modules) return null
    const sortedModules = [...subject.modules].sort((a, b) => a.orderIndex - b.orderIndex)
    for (const mod of sortedModules) {
      const sortedLessons = [...(mod.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex)
      for (const lesson of sortedLessons) {
        const isCompleted = lesson.progress?.some((p) => p.status === 'completed')
        if (!isCompleted) return lesson
      }
    }
    return null
  }

  // Weak areas: assessment types where score < 60%
  const weakAreas = (): string[] => {
    if (!subject?.assessmentResults) return []
    const weakMap: Record<string, number[]> = {}
    subject.assessmentResults.forEach((a) => {
      const type = a.assessment?.type || 'General'
      if (!weakMap[type]) weakMap[type] = []
      weakMap[type].push(a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0)
    })
    const result: string[] = []
    Object.entries(weakMap).forEach(([type, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg < 60) result.push(type)
    })
    return result
  }

  // -----------------------------------------------------------------------
  // Loading / not-found states
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Materia no encontrada</h2>
        <Button onClick={() => navigate('/student/curriculum')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Volver al curr\u00edculo
        </Button>
      </div>
    )
  }

  const nextLesson = nextIncompleteLesson()
  const weak = weakAreas()

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ======================== HEADER ======================== */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/curriculum')}
          className="w-fit -ml-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Curr\u00edculo
        </Button>

        <Card className={`border-l-4 ${borderColor}`}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{icon}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl">{subject.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {subject.code}
                    </Badge>
                    {subject.isStem && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                        STEM
                      </Badge>
                    )}
                  </div>
                  {subject.description && (
                    <CardDescription className="mt-1">{subject.description}</CardDescription>
                  )}
                </div>
              </div>

              {nextLesson && (
                <Link to={`/student/lesson/${nextLesson.id}`}>
                  <Button size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    Continuar donde lo dejaste
                  </Button>
                </Link>
              )}
            </div>

            {subject.progress != null && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progreso general</span>
                  <span className="text-sm font-bold">{subject.progress.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={subject.progress.percentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {subject.progress.completed} de {subject.progress.total} lecciones completadas
                </p>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* ======================== STATS CARDS ======================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subject.progress?.percentage?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {subject.progress?.completed || 0} / {subject.progress?.total || 0} lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">M\u00f3dulos</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedModules}</div>
            <p className="text-xs text-muted-foreground">de {totalModules} m\u00f3dulos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo estimado</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalTimeEstimate)}</div>
            <p className="text-xs text-muted-foreground">tiempo total de estudio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio quizzes</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageQuizScore !== null ? `${averageQuizScore}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subject.assessmentResults?.length || 0} evaluaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================== MAIN TABS ======================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">
            <BookOpen className="mr-1 h-4 w-4" />
            M\u00f3dulos
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="mr-1 h-4 w-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="mr-1 h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="notes">
            <StickyNote className="mr-1 h-4 w-4" />
            Notas
          </TabsTrigger>
        </TabsList>

        {/* ======================== MODULES TAB ======================== */}
        <TabsContent value="modules" className="space-y-4">
          {/* Teacher info (if available) */}
          {subject.teacher && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profesor/a
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {subject.teacher.firstName} {subject.teacher.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{subject.teacher.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module list */}
          {subject.modules && subject.modules.length > 0 ? (
            <Accordion type="multiple" defaultValue={[subject.modules[0]?.id]}>
              {subject.modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((mod) => {
                  const modLessons = mod.lessons || []
                  const completedLessons = modLessons.filter((l) =>
                    l.progress?.some((p) => p.status === 'completed')
                  ).length
                  const modProgress = modLessons.length > 0
                    ? (completedLessons / modLessons.length) * 100
                    : 0

                  return (
                    <AccordionItem key={mod.id} value={mod.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{mod.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {completedLessons}/{modLessons.length} lecciones &middot; {modProgress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {mod.description && (
                            <p className="text-sm text-muted-foreground">{mod.description}</p>
                          )}

                          <Progress value={modProgress} className="h-2" />

                          <div className="space-y-1 mt-2">
                            {modLessons
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((lesson) => {
                                const isCompleted = lesson.progress?.some(
                                  (p) => p.status === 'completed'
                                )
                                const isInProgress = lesson.progress?.some(
                                  (p) => p.status === 'in_progress'
                                )

                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors group"
                                  >
                                    {getLessonIcon(lesson)}
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                        {lesson.title}
                                      </p>
                                    </div>
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {lesson.duration}min
                                      </span>
                                    )}
                                    {isInProgress && (
                                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
                                        En progreso
                                      </Badge>
                                    )}
                                    {!isCompleted && !isInProgress && (
                                      <Link to={`/student/lesson/${lesson.id}`}>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0">
                                          <Play className="h-3 w-3 mr-1" />
                                          Iniciar
                                        </Button>
                                      </Link>
                                    )}
                                    {isCompleted && (
                                      <Link to={`/student/lesson/${lesson.id}`}>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0">
                                          Repasar
                                        </Button>
                                      </Link>
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No hay m\u00f3dulos disponibles para esta materia.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ======================== PERFORMANCE TAB ======================== */}
        <TabsContent value="performance" className="space-y-4">
          {/* Quiz scores over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Historial de evaluaciones
              </CardTitle>
              <CardDescription>Tus calificaciones a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              {subject.assessmentResults && subject.assessmentResults.length > 0 ? (
                <div className="space-y-3">
                  {subject.assessmentResults
                    .sort(
                      (a, b) =>
                        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                    )
                    .map((result) => {
                      const pct = result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0
                      return (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {result.assessment?.title || 'Evaluaci\u00f3n'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.completedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div
                                className={`text-lg font-bold ${
                                  pct >= 60 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {pct.toFixed(0)}%
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {result.score}/{result.maxScore}
                              </span>
                            </div>
                            <Badge
                              variant={result.status === 'passed' ? 'default' : 'destructive'}
                              className="shrink-0"
                            >
                              {result.status === 'passed' ? 'Aprobado' : 'No aprobado'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No hay evaluaciones completadas a\u00fan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                \u00c1reas de mejora
              </CardTitle>
              <CardDescription>
                Temas donde necesitas reforzar tu aprendizaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weak.length > 0 ? (
                <div className="space-y-3">
                  {weak.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{area}</p>
                        <p className="text-xs text-muted-foreground">
                          Promedio inferior al 60% - Te recomendamos repasar este tema
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : subject.assessmentResults && subject.assessmentResults.length > 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      \u00a1Excelente! No se detectaron \u00e1reas d\u00e9biles.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Completa evaluaciones para identificar \u00e1reas de mejora.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================== RESOURCES TAB ======================== */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recursos de la materia
              </CardTitle>
              <CardDescription>
                Material descargable y enlaces relacionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subject.resources && subject.resources.length > 0 ? (
                <div className="space-y-3">
                  {subject.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {resource.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {resource.type} &middot;{' '}
                          {new Date(resource.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Descargar
                          </Button>
                        </a>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No hay recursos disponibles para esta materia.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================== NOTES TAB ======================== */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notas de esta materia
            </CardTitle>
            <Link to="/student/notes">
              <Button variant="outline" size="sm">
                <StickyNote className="mr-1 h-3 w-3" />
                Ver todas las notas
              </Button>
            </Link>
          </div>

          {subject.notes && subject.notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.notes
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                .map((note) => {
                  const colorMap: Record<string, string> = {
                    yellow: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-700',
                    blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700',
                    green: 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700',
                    pink: 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-700',
                    purple: 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700',
                  }
                  const colorClass = colorMap[note.color] || colorMap.yellow

                  return (
                    <Card key={note.id} className={`border-2 ${colorClass}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm line-clamp-2">{note.title}</CardTitle>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {note.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Actualizado: {new Date(note.updatedAt).toLocaleDateString('es-ES')}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <StickyNote className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-3">No hay notas para esta materia.</p>
                <Link to="/student/notes">
                  <Button size="sm">
                    <StickyNote className="mr-1 h-3 w-3" />
                    Crear nota
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

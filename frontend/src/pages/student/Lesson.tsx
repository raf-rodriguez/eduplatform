import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, CheckCircle, FileText, ChevronLeft, ChevronRight,
  BookOpen, Clock, Target, Lightbulb, Dumbbell, ListOrdered,
  BookMarked, ExternalLink, Loader2, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useMarkdownSafe } from '@/hooks/useMarkdownSafe'
import api from '@/services/api'

// ---------------------------------------------------------------------------
// Render parsed lesson content sections
// ---------------------------------------------------------------------------
interface ContentSection {
  title?: string
  body: string
}

function parseLessonContent(content: unknown): ContentSection[] {
  if (!content) return []

  // If content is already a string of HTML or markdown
  if (typeof content === 'string') {
    return [{ body: content }]
  }

  // Expected shape: { type: 'markdown', body: '...' } or array of sections
  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>

    // Single markdown block
    if (obj.type === 'markdown' && typeof obj.body === 'string') {
      return [{ body: obj.body }]
    }

    // Sections array
    if (Array.isArray(obj.sections)) {
      return obj.sections.map((s: unknown) => {
        const sec = s as Record<string, unknown>
        return {
          title: typeof sec.title === 'string' ? sec.title : undefined,
          body: typeof sec.body === 'string' ? sec.body : JSON.stringify(sec.body || ''),
        }
      })
    }

    // Fallback: stringify
    return [{ body: JSON.stringify(content, null, 2) }]
  }

  return []
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------
function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m} min ${s > 0 ? s + ' s' : ''}` : `${s} s`
}

function statusBadge(status?: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completada</Badge>
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">En progreso</Badge>
    default:
      return <Badge variant="outline">No iniciada</Badge>
  }
}

// ---------------------------------------------------------------------------
// Safe markdown renderer component (uses hook internally)
// ---------------------------------------------------------------------------
function MarkdownRenderer({ content }: { content: string }) {
  const safeHtml = useMarkdownSafe(content)
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}

// ---------------------------------------------------------------------------
// Safe markdown preview component (truncated, for sidebar)
// ---------------------------------------------------------------------------
function MarkdownPreview({
  content,
  maxLength = 500,
}: {
  content: string
  maxLength?: number
}) {
  const safeHtml = useMarkdownSafe(content)
  const truncated =
    safeHtml.length > maxLength ? safeHtml.slice(0, maxLength) + '...' : safeHtml
  return (
    <div
      className="text-sm text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: truncated }}
    />
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Lesson() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [lesson, setLesson] = useState<any>(null)
  const [moduleLessons, setModuleLessons] = useState<any[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  const currentIndex = moduleLessons.findIndex((l) => l.id === id)
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null

  // ---- Fetch lesson data ----
  const fetchLesson = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await api.get(`/content/lessons/${id}`)
      const data = response.data.data
      setLesson(data)

      // Fetch sibling lessons from the same module
      if (data?.module?.id) {
        try {
          const modRes = await api.get(`/content/modules/${data.module.id}`)
          const modData = modRes.data.data
          if (modData?.lessons) {
            setModuleLessons(
              [...modData.lessons].sort((a: any, b: any) => a.orderIndex - b.orderIndex)
            )
          }
        } catch {
          // non-critical; sidebar will just not show siblings
        }
      }

      // Fetch progress for this lesson
      try {
        const progRes = await api.get(`/progress/${id}`)
        setProgress(progRes.data.data)
        setActiveTab('video')
      } catch {
        // no progress yet
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la lecci\u00f3n',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  // ---- Auto-progress tracking ----
  useEffect(() => {
    if (!id || !lesson) return
    const alreadyStarted = progress?.status === 'in_progress' || progress?.status === 'completed'
    if (alreadyStarted) return

    let cancelled = false
    setIsTracking(true)

    const track = async () => {
      try {
        await api.put(`/progress/${id}`, { status: 'in_progress' })
        if (!cancelled) {
          setProgress((prev: any) => ({ ...prev, status: 'in_progress' }))
        }
      } catch (err) {
        console.error('Failed to auto-track progress:', err)
      } finally {
        if (!cancelled) setIsTracking(false)
      }
    }

    const timer = setTimeout(track, 2000) // small delay so the page feels responsive
    return () => { cancelled = true; clearTimeout(timer) }
  }, [id, lesson, progress?.status])

  // ---- Mark complete ----
  const handleMarkComplete = async () => {
    try {
      await api.put(`/progress/${id}`, { status: 'completed' })
      setProgress((prev: any) => ({ ...prev, status: 'completed' }))
      toast({ title: '\u00a1Excelente!', description: 'Lecci\u00f3n completada' })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo marcar como completada',
        variant: 'destructive',
      })
    }
  }

  // ---- Navigate to sibling ----
  const goToLesson = (target: any) => {
    if (target) navigate(`/student/lesson/${target.id}`)
  }

  // ---- Parsed content sections ----
  const sections = parseLessonContent(lesson?.content)

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

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Lecci\u00f3n no encontrada</h2>
        <Button onClick={() => navigate('/student/curriculum')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Volver al curr\u00edculo
        </Button>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ===================== MAIN CONTENT COLUMN ===================== */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/curriculum')}
              className="mb-2 -ml-2"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Curr\u00edculo
            </Button>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Badge variant="outline">
                {lesson.module?.subject?.code || lesson.module?.subject?.name}
              </Badge>
              <span>{lesson.module?.name}</span>
              {lesson.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}
                </span>
              )}
              {statusBadge(progress?.status)}
              {isTracking && (
                <span className="flex items-center gap-1 text-xs text-blue-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Guardando progreso...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {prevLesson && (
              <Button variant="outline" size="sm" onClick={() => goToLesson(prevLesson)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
            )}
            <Button onClick={handleMarkComplete} size="sm">
              <CheckCircle className="mr-1 h-4 w-4" />
              Completar
            </Button>
            {nextLesson && (
              <Button variant="outline" size="sm" onClick={() => goToLesson(nextLesson)}>
                Siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">
              <BookOpen className="mr-1 h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="video">
              <Play className="mr-1 h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Dumbbell className="mr-1 h-4 w-4" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="assessment" disabled={!lesson.assessments?.length}>
              <Target className="mr-1 h-4 w-4" />
              Evaluaci\u00f3n
            </TabsTrigger>
          </TabsList>

          {/* ---- Tab: Content (markdown) ---- */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Material de estudio
                </CardTitle>
                {lesson.description && (
                  <CardDescription>{lesson.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {sections.length > 0 ? (
                  <div className="space-y-6">
                    {sections.map((section, idx) => (
                      <div key={idx}>
                        {section.title && (
                          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                        )}
                        <MarkdownRenderer content={section.body} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay material escrito disponible.</p>
                )}

                {/* Resources */}
                {lesson.resources?.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recursos adicionales
                    </h3>
                    <div className="space-y-2">
                      {lesson.resources.map((resource: any) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors group"
                        >
                          <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium block truncate">
                              {resource.title}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {resource.type}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Tab: Video ---- */}
          <TabsContent value="video" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {lesson.videoUrl ? (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{lesson.title}</p>
                      <p className="text-sm opacity-70">
                        Duraci\u00f3n: {formatDuration(lesson.videoDuration)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
                    <Play className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No hay video disponible para esta lecci\u00f3n</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Tab: Activities ---- */}
          <TabsContent value="activities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Actividades de pr\u00e1ctica
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.activities?.length > 0 ? (
                  <div className="space-y-4">
                    {lesson.activities
                      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                      .map((activity: any) => (
                        <div key={activity.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{activity.title}</h3>
                              <Badge variant="outline" className="mt-1 capitalize">
                                {activity.type}
                              </Badge>
                            </div>
                            <Badge
                              variant={activity.isRequired ? 'default' : 'secondary'}
                              className="shrink-0"
                            >
                              {activity.isRequired ? 'Obligatoria' : 'Opcional'}
                            </Badge>
                          </div>
                          {activity.content && typeof activity.content === 'string' && (
                            <p className="text-sm text-muted-foreground">
                              {activity.content.slice(0, 200)}
                              {activity.content.length > 200 ? '...' : ''}
                            </p>
                          )}
                          <Button size="sm">
                            <Play className="mr-1 h-3 w-3" />
                            Comenzar actividad
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No hay actividades disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Tab: Assessment ---- */}
          {lesson.assessments?.length > 0 && (
            <TabsContent value="assessment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Evaluaci\u00f3n
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lesson.assessments.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="p-5 border rounded-lg space-y-4"
                      >
                        <div>
                          <h3 className="text-lg font-semibold">{assessment.title}</h3>
                          {assessment.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {assessment.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {assessment.type}
                          </Badge>
                          {assessment.timeLimit && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" /> {assessment.timeLimit} min
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            Puntuaci\u00f3n m\u00e1x: {assessment.maxScore}
                          </span>
                          <span className="text-muted-foreground">
                            Aprobaci\u00f3n: {assessment.passingScore}
                          </span>
                        </div>
                        <Progress
                          value={
                            assessment.maxScore
                              ? ((assessment.passingScore ?? 0) / assessment.maxScore) * 100
                              : 0
                          }
                          className="h-2"
                        />
                        <Button
                          onClick={() =>
                            navigate(`/student/assessment/${assessment.id}`)
                          }
                        >
                          <Target className="mr-1 h-4 w-4" />
                          Comenzar evaluaci\u00f3n
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Bottom prev/next navigation */}
        <div className="flex items-center justify-between pt-2">
          {prevLesson ? (
            <Button variant="outline" onClick={() => goToLesson(prevLesson)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {prevLesson.title}
            </Button>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Button variant="default" onClick={() => goToLesson(nextLesson)}>
              {nextLesson.title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={handleMarkComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Completar lecci\u00f3n
            </Button>
          )}
        </div>
      </div>

      {/* ===================== SIDEBAR: Module Outline ===================== */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        {/* Progress card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tu progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estado</span>
              {statusBadge(progress?.status)}
            </div>
            {progress?.timeSpent != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tiempo dedicado</span>
                <span className="font-medium">{Math.floor(progress.timeSpent / 60)} min</span>
              </div>
            )}
            {progress?.attempts != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Intentos</span>
                <span className="font-medium">{progress.attempts}</span>
              </div>
            )}
            {progress?.score != null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Puntuaci\u00f3n</span>
                  <span className="font-medium">{progress.score}%</span>
                </div>
                <Progress value={progress.score} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module outline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Contenido del m\u00f3dulo
            </CardTitle>
            <CardDescription>
              {lesson.module?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {moduleLessons.length > 0 ? (
              <nav className="space-y-0.5 px-2 pb-2">
                {moduleLessons.map((l: any, index: number) => {
                  const isCurrent = l.id === id
                  // Try to determine status from fetched progress or lesson data
                  const lessonProgress = l.progress?.[0]
                  const isCompleted = lessonProgress?.status === 'completed'
                  const isInProgress = lessonProgress?.status === 'in_progress'

                  return (
                    <button
                      key={l.id}
                      onClick={() => goToLesson(l)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${isCurrent
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                        }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isInProgress ? (
                          <Play className="h-4 w-4 text-blue-500" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{l.title}</span>
                        {l.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(l.duration)}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </nav>
            ) : (
              <p className="px-4 py-4 text-sm text-muted-foreground text-center">
                No hay m\u00e1s lecciones en este m\u00f3dulo
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick key points from content */}
        {sections.length > 0 && sections[0]?.body && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Puntos clave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownPreview content={sections[0]?.body || ''} maxLength={500} />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2"
                onClick={() => setActiveTab('content')}
              >
                Ver contenido completo
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

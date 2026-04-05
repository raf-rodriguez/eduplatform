import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  AlertTriangle,
  Target,
  TrendingUp,
  Zap,
  Lightbulb,
  BookOpen,
  Clock,
  ChevronRight,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

// --- Types ---

interface SubjectProgress {
  subject: string
  progress: number
  score: number
  lessonsCompleted: number
  lessonsTotal: number
}

interface OverallStats {
  completedLessons: number
  totalLessons: number
  averageScore: number
  percentage: number
}

interface AIAnalysisResult {
  weakSubjects: string[]
  topicsToReview: string[]
  studyPlan: string[]
  estimatedTime: string
  rawResponse: string
}

interface ParsedSection {
  title: string
  items: string[]
}

// --- Helper: parse AI text response into structured sections ---

function parseAIResponse(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  let currentSection: ParsedSection | null = null

  for (const line of lines) {
    // Detect section headers: lines starting with **, #, *, - followed by bold, or numbered headings
    const headerMatch = line.match(/^(?:\*\*|#+|\*\s|-\s|\d+[\.\)]\s)\s*\*?([A-Za-zÁáÉéÍíÓóÚúÑñ\s:]+?)\*?:?$/)
    if (headerMatch && !line.startsWith('-') && !line.match(/^\d/)) {
      if (currentSection) sections.push(currentSection)
      currentSection = { title: headerMatch[1].replace(/\*+$/g, '').trim(), items: [] }
    } else if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+[\.\)]/)) {
      const cleaned = line.replace(/^[-*\d.)]+\s*/, '').replace(/\*\*/g, '').trim()
      if (currentSection) {
        currentSection.items.push(cleaned)
      } else {
        currentSection = { title: 'Recomendaciones', items: [cleaned] }
      }
    } else if (currentSection) {
      currentSection.items.push(line.replace(/\*\*/g, ''))
    }
  }

  if (currentSection) sections.push(currentSection)
  return sections
}

// --- Helper: color for a subject ---

function getSubjectColor(subject: string): string {
  const map: Record<string, string> = {
    'Matemáticas': 'bg-green-100 text-green-800 border-green-200',
    'Español': 'bg-blue-100 text-blue-800 border-blue-200',
    'Ciencia': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Historia': 'bg-red-100 text-red-800 border-red-200',
    'Inglés': 'bg-purple-100 text-purple-800 border-purple-200',
    'Robótica': 'bg-pink-100 text-pink-800 border-pink-200',
    'Finanzas': 'bg-lime-100 text-lime-800 border-lime-200',
  }
  return map[subject] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function getProgressColor(value: number): string {
  if (value >= 80) return 'bg-green-500'
  if (value >= 60) return 'bg-blue-500'
  if (value >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

// --- Main Component ---

export default function WeaknessAnalysis() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats>({
    completedLessons: 0,
    totalLessons: 0,
    averageScore: 0,
    percentage: 0,
  })
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [previousStats, setPreviousStats] = useState<OverallStats | null>(null)

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      const response = await api.get('/progress/summary')
      const data = response.data
      setSubjectProgress(data.bySubject || [])
      const stats = {
        completedLessons: data.completed || 0,
        totalLessons: data.total || 0,
        averageScore: data.averageScore || 0,
        percentage: data.overall?.percentage || 0,
      }
      setPreviousStats((prev) => prev || { ...stats })
      setOverallStats(stats)
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de progreso.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  // Call AI tutor-help endpoint
  const analyzeWeaknesses = async () => {
    setAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      // Build context from current progress
      const weakSubjects = [...subjectProgress]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((s) => `${s.subject} (score: ${s.score.toFixed(0)}%, progress: ${s.progress.toFixed(0)}%)`)
        .join(', ')

      const completedSubjects = [...subjectProgress]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => `${s.subject} (score: ${s.score.toFixed(0)}%)`)
        .join(', ')

      const prompt = [
        `Analiza mis debilidades académicas basándote en los siguientes datos:`,
        ``,
        `Progreso general: ${overallStats.percentage.toFixed(0)}%`,
        `Promedio general: ${overallStats.averageScore.toFixed(0)}%`,
        `Lecciones completadas: ${overallStats.completedLessons} de ${overallStats.totalLessons}`,
        ``,
        `Materias más débiles: ${weakSubjects || 'No hay datos suficientes'}`,
        `Materias más fuertes: ${completedSubjects || 'No hay datos suficientes'}`,
        ``,
        `Por favor proporciona:`,
        `1. Materias débiles identificadas`,
        `2. Temas específicos a repasar`,
        `3. Plan de estudio sugerido`,
        `4. Tiempo estimado de mejora`,
      ].join('\n')

      const response = await api.post('/agents/tutor-help', {
        message: prompt,
      })

      const rawText = response.data?.message || response.data?.response || response.data?.data?.message || JSON.stringify(response.data)

      const parsed = parseAIResponse(rawText)

      // Extract structured data from parsed sections
      const weakSubjectsList: string[] = []
      const topicsToReview: string[] = []
      const studyPlan: string[] = []
      let estimatedTime = 'No especificado'

      for (const section of parsed) {
        const titleLower = section.title.toLowerCase()
        if (titleLower.includes('débil') || titleLower.includes('weak') || titleLower.includes('materia')) {
          weakSubjectsList.push(...section.items)
        } else if (titleLower.includes('tema') || titleLower.includes('topic') || titleLower.includes('repas')) {
          topicsToReview.push(...section.items)
        } else if (titleLower.includes('plan') || titleLower.includes('estudio') || titleLower.includes('study')) {
          studyPlan.push(...section.items)
        } else if (titleLower.includes('tiempo') || titleLower.includes('time') || titleLower.includes('estim')) {
          estimatedTime = section.items[0] || 'No especificado'
        }
      }

      // If parsing didn't find specific sections, use fallback
      if (weakSubjectsList.length === 0 && parsed.length > 0) {
        parsed.forEach((s) => {
          if (s.items.length > 0) {
            studyPlan.push(`**${s.title}**: ${s.items.join('; ')}`)
          }
        })
      }

      setAnalysisResult({
        weakSubjects: weakSubjectsList.length > 0 ? weakSubjectsList : subjectProgress.slice(0, 3).map((s) => s.subject),
        topicsToReview: topicsToReview.length > 0 ? topicsToReview : ['Revisar lecciones pendientes'],
        studyPlan: studyPlan.length > 0 ? studyPlan : ['Completar lecciones atrasadas', 'Practicar ejercicios diarios'],
        estimatedTime,
        rawResponse: rawText,
      })

      toast({
        title: 'Análisis completado',
        description: 'El asistente IA ha generado tu reporte personalizado.',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al analizar debilidades'
      setAnalysisError(message)
      toast({
        title: 'Error',
        description: 'No se pudo completar el análisis. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // Derived data
  const sortedSubjects = [...subjectProgress].sort((a, b) => b.score - a.score)
  const weakestSubjects = [...subjectProgress].sort((a, b) => a.score - b.score).slice(0, 3)
  const strongestSubjects = [...subjectProgress].sort((a, b) => b.score - a.score).slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Análisis de Debilidades
          </h1>
          <p className="text-muted-foreground">
            Identifica tus áreas de mejora con ayuda de inteligencia artificial
          </p>
        </div>
        <Button
          size="lg"
          onClick={analyzeWeaknesses}
          disabled={analyzing}
          className="gap-2"
        >
          {analyzing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Analizar mis debilidades
            </>
          )}
        </Button>
      </div>

      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.percentage.toFixed(0)}%</div>
            <Progress value={overallStats.percentage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallStats.completedLessons} de {overallStats.totalLessons} lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.averageScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.averageScore >= 80
                ? 'Excelente rendimiento'
                : overallStats.averageScore >= 60
                  ? 'Buen rendimiento'
                  : 'Necesita mejora'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materias Débiles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{weakestSubjects.length}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {weakestSubjects.map((s) => (
                <Badge key={s.subject} variant="destructive" className="text-xs">
                  {s.subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materias Fuertes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{strongestSubjects.length}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {strongestSubjects.map((s) => (
                <Badge key={s.subject} className="text-xs bg-green-100 text-green-800">
                  {s.subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Loading Animation */}
      {analyzing && (
        <Card className="border-primary/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mt-4">Analizando tu rendimiento...</h3>
            <p className="text-muted-foreground text-center mt-1">
              El asistente IA está procesando tus datos de aprendizaje
            </p>
            <div className="flex gap-1 mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {analysisResult && !analyzing && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Reporte de Análisis IA
            </CardTitle>
            <CardDescription>
              Análisis personalizado basado en tu rendimiento académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weaknesses">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="weaknesses">Debilidades</TabsTrigger>
                <TabsTrigger value="topics">Temas</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
                <TabsTrigger value="time">Tiempo</TabsTrigger>
              </TabsList>

              <TabsContent value="weaknesses" className="mt-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Materias Débiles Identificadas
                  </h4>
                  {analysisResult.weakSubjects.map((subject, idx) => {
                    const match = subjectProgress.find((s) => subject.toLowerCase().includes(s.subject.toLowerCase()))
                    return (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border bg-background/50">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{typeof subject === 'string' ? subject.replace(/\*\*/g, '') : subject}</p>
                          {match && (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={match.score} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground">{match.score.toFixed(0)}%</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="destructive" className="flex-shrink-0">Prioridad</Badge>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="topics" className="mt-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Temas Específicos a Repasar
                  </h4>
                  {analysisResult.topicsToReview.map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-background/50">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-sm">{topic.replace(/\*\*/g, '')}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="plan" className="mt-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Plan de Estudio Sugerido
                  </h4>
                  {analysisResult.studyPlan.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-background/50">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-green-600">{idx + 1}</span>
                      </div>
                      <p className="text-sm">{step.replace(/\*\*/g, '')}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="time" className="mt-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Clock className="h-10 w-10 text-purple-500" />
                  </div>
                  <h4 className="text-lg font-semibold">Tiempo Estimado de Mejora</h4>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {analysisResult.estimatedTime.replace(/\*\*/g, '')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 text-center">
                    Siguiendo el plan de estudio sugerido
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Analysis Error */}
      {analysisError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Error en el análisis</p>
              <p className="text-sm text-red-600 dark:text-red-400">{analysisError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={analyzeWeaknesses} className="ml-auto flex-shrink-0">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subject Breakdown & Recommendations */}
      <Tabs defaultValue="breakdown">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Desglose por Materia</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-4 space-y-4">
          {/* Subject Progress Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso por Materia</CardTitle>
              <CardDescription>Rendimiento y avance de cada materia</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSubjects.length > 0 ? (
                <div className="space-y-4">
                  {sortedSubjects.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getSubjectColor(subject.subject)}
                          >
                            {subject.subject}
                          </Badge>
                          {subject.score < 50 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">
                            {subject.lessonsCompleted}/{subject.lessonsTotal} lecciones
                          </span>
                          <span className={`font-semibold ${subject.score < 50 ? 'text-red-500' : subject.score >= 80 ? 'text-green-500' : ''}`}>
                            {subject.score.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative h-2.5 w-full flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full w-full flex-1 transition-all ${getProgressColor(subject.progress)}`}
                            style={{ transform: `translateX(-${100 - (subject.progress || 0)}%)` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {subject.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {subject.lessonsCompleted} completadas
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Score: {subject.score.toFixed(0)}%
                        </span>
                        {subject.lessonsTotal - subject.lessonsCompleted > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {subject.lessonsTotal - subject.lessonsCompleted} pendientes
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos de materias disponibles</p>
                  <Link to="/student/curriculum">
                    <Button variant="link" className="mt-2">Ver mi currículo</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz Score Trends */}
          {subjectProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Calificaciones</CardTitle>
                <CardDescription>Rendimiento de materias ordenadas por score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedSubjects.map((subject, idx) => {
                    const prevScore = idx > 0 ? sortedSubjects[idx - 1].score : subject.score
                    const diff = subject.score - prevScore
                    const isTop = idx < 3
                    const isBottom = idx >= sortedSubjects.length - 3 && sortedSubjects.length > 3
                    return (
                      <div
                        key={subject.subject}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${isBottom
                          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10'
                          : isTop
                            ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10'
                            : 'bg-background'
                          }`}
                      >
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-muted">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{subject.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress value={subject.score} className="h-2" />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {subject.score.toFixed(0)}%
                          </span>
                          {idx > 0 && (
                            diff >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-4">
          {/* Top Recommendation */}
          {weakestSubjects.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Recomendación Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
                  <Target className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Comienza con {weakestSubjects[0].subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tu materia con menor rendimiento ({weakestSubjects[0].score.toFixed(0)}%)
                    </p>
                  </div>
                  <Link to="/student/curriculum">
                    <Button size="sm" className="ml-auto flex-shrink-0">
                      Ir al currículo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {weakestSubjects[0].lessonsCompleted < weakestSubjects[0].lessonsTotal && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
                    <BookOpen className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        Enfócate en completar lecciones de {weakestSubjects[0].subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tienes {weakestSubjects[0].lessonsTotal - weakestSubjects[0].lessonsCompleted} lecciones pendientes
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
                  <Clock className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Practica al menos 30 minutos por día</p>
                    <p className="text-sm text-muted-foreground">
                      La consistencia diaria mejora el rendimiento un 40%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personalized Study Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Horario de Estudio Personalizado
              </CardTitle>
              <CardDescription>
                Plan semanal sugerido basado en tus debilidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSubjects.length > 0 ? (
                <div className="space-y-3">
                  {(() => {
                    // Create a weekly plan from weakest subjects
                    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                    const weaks = [...subjectProgress].sort((a, b) => a.score - b.score)
                    const schedule = days.map((day, idx) => {
                      const subject = weaks[idx % weaks.length]
                      const minutes = subject.score < 50 ? 45 : subject.score < 70 ? 30 : 20
                      return { day, subject, minutes }
                    })

                    return schedule.map(({ day, subject, minutes }) => (
                      <div key={day} className="flex items-center gap-4 p-3 rounded-lg border bg-background/50">
                        <div className="w-24 flex-shrink-0">
                          <p className="font-medium text-sm">{day}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getSubjectColor(subject.subject)}
                        >
                          {subject.subject}
                        </Badge>
                        <div className="flex-1 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {minutes} minutos
                          </span>
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={subject.progress}
                            className="h-2"
                          />
                        </div>
                        <span className="text-xs font-medium w-10 text-right">
                          {subject.progress.toFixed(0)}%
                        </span>
                      </div>
                    ))
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Completa lecciones para generar un horario personalizado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Consejos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                  <Brain className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Estudio activo</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Haz preguntas y resume lo aprendido</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-green-800 dark:text-green-200">Repetición espaciada</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Repasa temas cada vez con más intervalo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
                  <Target className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-purple-800 dark:text-purple-200">Metas diarias</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Establece objetivos alcanzables cada día</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900">
                  <TrendingUp className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-orange-800 dark:text-orange-200">Monitorea tu progreso</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Revisa este análisis semanalmente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Tracking: Before vs After */}
      {previousStats && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seguimiento de Progreso
            </CardTitle>
            <CardDescription>
              Comparación antes del análisis vs después de seguir el plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                  Antes del Análisis
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Progreso General</span>
                    <span className="font-semibold">{previousStats.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Promedio</span>
                    <span className="font-semibold">{previousStats.averageScore.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Lecciones Completadas</span>
                    <span className="font-semibold">{previousStats.completedLessons}/{previousStats.totalLessons}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Después de Seguir el Plan
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <span className="text-sm">Progreso General</span>
                    <span className="font-semibold text-green-600">{overallStats.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <span className="text-sm">Promedio</span>
                    <span className="font-semibold text-green-600">{overallStats.averageScore.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <span className="text-sm">Lecciones Completadas</span>
                    <span className="font-semibold text-green-600">{overallStats.completedLessons}/{overallStats.totalLessons}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Improvement Indicators */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Indicadores de Mejora Semanal</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Progreso',
                    current: overallStats.percentage,
                    previous: previousStats.percentage,
                  },
                  {
                    label: 'Promedio',
                    current: overallStats.averageScore,
                    previous: previousStats.averageScore,
                  },
                  {
                    label: 'Completadas',
                    current: (overallStats.completedLessons / Math.max(overallStats.totalLessons, 1)) * 100,
                    previous: (previousStats.completedLessons / Math.max(previousStats.totalLessons, 1)) * 100,
                  },
                  {
                    label: 'Debilidades',
                    current: Math.max(0, 100 - weakestSubjects.length * 20),
                    previous: 60,
                  },
                ].map((metric) => {
                  const improvement = metric.current - metric.previous
                  return (
                    <div key={metric.label} className="text-center p-3 rounded-lg border bg-background/50">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-lg font-bold mt-1">
                        {improvement >= 0 ? '+' : ''}{improvement.toFixed(0)}%
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {improvement >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {improvement >= 0 ? 'Mejorando' : 'Revisar'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {subjectProgress.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos de progreso</h3>
            <p className="text-muted-foreground text-center mb-4">
              Completa lecciones y evaluaciones para poder analizar tus debilidades
            </p>
            <Link to="/student/curriculum">
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Ir al currículo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

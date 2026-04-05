import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Target, Award, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

// ---- Types ----

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
  orderIndex: number
  lessons?: Lesson[]
}

interface Subject {
  id: string
  name: string
  code: string
  description?: string
  isStem?: boolean
  progress?: { total: number; completed: number; percentage: number }
  modules?: Module[]
}

interface CurriculumResponse {
  grade: { id: string; name: string; level: number }
  subjects: Subject[]
}

interface StudySession {
  date: string // YYYY-MM-DD
  time: string
  subjectId: string
  subjectName: string
  subjectCode: string
  category: 'core' | 'special' | 'stem' | 'other'
  module?: string
  lesson?: string
  durationMinutes: number
}

interface DeadlineItem {
  date: string
  subjectName: string
  subjectCode: string
  category: 'core' | 'special' | 'stem' | 'other'
  description: string
}

// ---- Helpers ----

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Principal',
  special: 'Especial',
  stem: 'STEM',
  other: 'Otro',
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  special: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  stem: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

const CATEGORY_BLOCK_COLORS: Record<string, string> = {
  core: 'bg-blue-500 text-white dark:bg-blue-600',
  special: 'bg-orange-500 text-white dark:bg-orange-600',
  stem: 'bg-purple-500 text-white dark:bg-purple-600',
  other: 'bg-green-500 text-white dark:bg-green-600',
}

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  core: 'border-l-blue-500',
  special: 'border-l-orange-500',
  stem: 'border-l-purple-500',
  other: 'border-l-green-500',
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function getSubjectCategory(subject: Subject): string {
  const stemCodes = ['ROB']
  const specialCodes = ['FIN', 'SAL']
  const coreCodes = ['ESP', 'MAT', 'CIE', 'HIS', 'ING', 'INC']
  const preschoolCodes = ['LEC', 'MBAS', 'EXP', 'ART', 'MUS']

  const code = subject.code.split('_')[0]
  if (stemCodes.includes(code)) return 'stem'
  if (specialCodes.includes(code)) return 'special'
  if (coreCodes.includes(code)) return 'core'
  if (preschoolCodes.includes(code)) return 'other'
  return 'other'
}

// Schedule generation algorithm
function generateStudySchedule(
  subjects: Subject[],
  startDate: Date,
  weeksAhead: number = 4
): { sessions: StudySession[]; deadlines: DeadlineItem[] } {
  const sessions: StudySession[] = []
  const deadlines: DeadlineItem[] = []

  // Sort subjects by progress ascending (prioritize lower progress)
  const sortedSubjects = [...subjects].sort((a, b) => {
    const pa = a.progress?.percentage ?? 0
    const pb = b.progress?.percentage ?? 0
    return pa - pb
  })

  // Collect all available lessons per subject
  const subjectLessons: Map<string, { subject: Subject; module: Module; lesson: Lesson }[]> = new Map()
  for (const subject of sortedSubjects) {
    const lessons: { subject: Subject; module: Module; lesson: Lesson }[] = []
    for (const mod of subject.modules || []) {
      for (const lesson of mod.lessons || []) {
        const isNotCompleted = !lesson.progress?.some((p) => p.status === 'completed')
        if (isNotCompleted) {
          lessons.push({ subject, module: mod, lesson })
        }
      }
    }
    subjectLessons.set(subject.id, lessons)
  }

  // Track lesson index per subject for rotation
  const lessonIndex = new Map<string, number>()
  for (const subject of subjects) {
    lessonIndex.set(subject.id, 0)
  }

  const daysPerWeek = 5 // Mon-Fri
  const subjectsPerDay = 2 // 2-3 subjects per day
  const totalDays = weeksAhead * daysPerWeek

  // Rotate through subjects across the weeks
  let subjectRotationIndex = 0

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + dayOffset)

    // Skip weekends
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    const dateStr = formatDate(currentDate)

    // Pick subjects for this day (rotate, avoid same subject on consecutive days if possible)
    const daySubjects: Subject[] = []
    const attempts = Math.min(subjectsPerDay, sortedSubjects.length)

    for (let i = 0; i < attempts; i++) {
      const subject = sortedSubjects[subjectRotationIndex % sortedSubjects.length]
      subjectRotationIndex++
      daySubjects.push(subject)
    }

    // Create sessions for each subject (morning and afternoon slots)
    const timeSlots = ['09:00', '11:00', '14:00']
    daySubjects.forEach((subject, idx) => {
      const lessons = subjectLessons.get(subject.id) || []
      const idx_ptr = lessonIndex.get(subject.id) || 0
      const lesson = lessons[idx_ptr % Math.max(lessons.length, 1)]

      const category = getSubjectCategory(subject) as 'core' | 'special' | 'stem' | 'other'

      sessions.push({
        date: dateStr,
        time: timeSlots[idx % timeSlots.length],
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        category,
        module: lesson?.module.name,
        lesson: lesson?.lesson.title,
        durationMinutes: lesson?.lesson.duration ?? 45,
      })

      if (lesson) {
        lessonIndex.set(subject.id, idx_ptr + 1)
      }
    })
  }

  // Generate fake deadlines: one per subject, spread across the next 4 weeks
  sortedSubjects.forEach((subject, i) => {
    const deadlineDate = new Date(startDate)
    deadlineDate.setDate(startDate.getDate() + 7 + i * 4) // stagger deadlines
    const category = getSubjectCategory(subject) as 'core' | 'special' | 'stem' | 'other'
    deadlines.push({
      date: formatDate(deadlineDate),
      subjectName: subject.name,
      subjectCode: subject.code,
      category,
      description: `Completar módulo de ${subject.name}`,
    })
  })

  return { sessions, deadlines }
}

// ---- Component ----

export default function CalendarPage() {
  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Fetch curriculum
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await api.get('/content/my-curriculum')
        const data: CurriculumResponse = res.data.data || res.data
        setCurriculum(data)

        // Generate schedule
        const today = new Date()
        const { sessions: generatedSessions, deadlines: generatedDeadlines } =
          generateStudySchedule(data.subjects, today, 8)
        setSessions(generatedSessions)
        setDeadlines(generatedDeadlines)
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el currículo para generar el calendario.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCurriculum()
  }, [toast])

  // Navigation
  const prevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  const goToToday = useCallback(() => {
    const now = new Date()
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
  }, [])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1)
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      })
    }

    // Next month padding (fill to 6 rows = 42 cells)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentDate])

  // Map sessions by date
  const sessionsByDate = useMemo(() => {
    const map: Map<string, StudySession[]> = new Map()
    for (const session of sessions) {
      const existing = map.get(session.date) || []
      existing.push(session)
      map.set(session.date, existing)
    }
    return map
  }, [sessions])

  // Map deadlines by date
  const deadlinesByDate = useMemo(() => {
    const map: Map<string, DeadlineItem[]> = new Map()
    for (const dl of deadlines) {
      const existing = map.get(dl.date) || []
      existing.push(dl)
      map.set(dl.date, existing)
    }
    return map
  }, [deadlines])

  // Selected date sessions
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return []
    return sessionsByDate.get(selectedDate) || []
  }, [selectedDate, sessionsByDate])

  const selectedDateDeadlines = useMemo(() => {
    if (!selectedDate) return []
    return deadlinesByDate.get(selectedDate) || []
  }, [selectedDate, deadlinesByDate])

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date)
      return d >= startOfWeek && d <= endOfWeek
    })

    const totalMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    const subjectsCovered = new Set(weekSessions.map((s) => s.subjectId)).size
    const totalSessions = weekSessions.length

    return { totalMinutes, subjectsCovered, totalSessions }
  }, [sessions])

  // Upcoming sessions (from today onwards)
  const upcomingSessions = useMemo(() => {
    const todayStr = formatDate(new Date())
    return sessions
      .filter((s) => s.date >= todayStr)
      .slice(0, 10)
  }, [sessions])

  // Subject progress map
  const subjectProgressMap = useMemo(() => {
    const map: Map<string, number> = new Map()
    if (!curriculum) return map
    for (const subject of curriculum.subjects) {
      map.set(subject.id, subject.progress?.percentage ?? 0)
    }
    return map
  }, [curriculum])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!curriculum) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No se encontró currículo</h2>
        <p className="text-muted-foreground">
          Contacta a tu administrador para configurar tu plan de estudios.
        </p>
      </div>
    )
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario de Estudio</h1>
          <p className="text-muted-foreground">
            Horario sugerido basado en tu currículo — {curriculum.grade.name}
          </p>
        </div>
        <Button onClick={goToToday} variant="outline">
          <Calendar className="mr-2 h-4 w-4" /> Hoy
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" /> Calendario
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Clock className="mr-2 h-4 w-4" /> Próximas Sesiones
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Target className="mr-2 h-4 w-4" /> Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Calendar Grid */}
            <div className="xl:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {MONTH_NAMES[month]} {year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 border-b">
                    {DAY_NAMES.map((day) => (
                      <div
                        key={day}
                        className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar cells */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, idx) => {
                      const dateStr = formatDate(dayInfo.date)
                      const daySessions = sessionsByDate.get(dateStr) || []
                      const dayDeadlines = deadlinesByDate.get(dateStr) || []
                      const isTodayCell = isToday(dayInfo.date)
                      const isSelected = selectedDate === dateStr

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (dayInfo.isCurrentMonth) {
                              setSelectedDate(isSelected ? null : dateStr)
                            }
                          }}
                          className={`
                            min-h-[80px] p-1 border-b border-r text-left transition-all
                            ${!dayInfo.isCurrentMonth ? 'bg-muted/30' : ''}
                            ${isTodayCell ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
                            ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                            hover:bg-muted/50
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`
                                inline-flex h-6 w-6 items-center justify-center rounded-full text-xs
                                ${isTodayCell ? 'bg-primary text-primary-foreground font-bold' : ''}
                                ${!dayInfo.isCurrentMonth ? 'text-muted-foreground' : ''}
                              `}
                            >
                              {dayInfo.date.getDate()}
                            </span>
                            {dayDeadlines.length > 0 && (
                              <Badge variant="destructive" className="h-4 w-4 p-0 text-[8px]">
                                {dayDeadlines.length}
                              </Badge>
                            )}
                          </div>

                          {/* Session blocks */}
                          <div className="space-y-0.5 overflow-hidden">
                            {daySessions.slice(0, 3).map((session, sIdx) => (
                              <div
                                key={sIdx}
                                className={`
                                  text-[10px] px-1.5 py-0.5 rounded truncate border-l-2
                                  ${CATEGORY_BLOCK_COLORS[session.category]}
                                  ${CATEGORY_BORDER_COLORS[session.category]}
                                `}
                                title={`${session.subjectName} - ${session.time}`}
                              >
                                {session.time} {session.subjectCode.split('_')[0]}
                              </div>
                            ))}
                            {daySessions.length > 3 && (
                              <div className="text-[10px] text-muted-foreground pl-1">
                                +{daySessions.length - 3} más
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500" />
                  <span>Principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-orange-500" />
                  <span>Especial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-purple-500" />
                  <span>STEM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span>Otro</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Selected Day Details */}
              {selectedDate && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {(() => {
                        const d = new Date(selectedDate + 'T12:00:00')
                        return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
                      })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedDateSessions.length > 0 ? (
                      selectedDateSessions.map((session, idx) => (
                        <div
                          key={idx}
                          className={`border-l-4 p-2 rounded ${CATEGORY_BORDER_COLORS[session.category]}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{session.time}</span>
                            <Badge className={`text-[10px] ${CATEGORY_BADGE_COLORS[session.category]}`}>
                              {CATEGORY_LABELS[session.category]}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{session.subjectName}</p>
                          {session.module && (
                            <p className="text-xs text-muted-foreground">{session.module}</p>
                          )}
                          {session.lesson && (
                            <p className="text-xs text-muted-foreground">Lección: {session.lesson}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{session.durationMinutes} min</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay sesiones programadas para este día.
                      </p>
                    )}

                    {selectedDateDeadlines.length > 0 && (
                      <div className="pt-2 border-t">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">FECHAS LÍMITE</h4>
                        {selectedDateDeadlines.map((dl, idx) => (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            <Flame className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium">{dl.subjectName}</p>
                              <p className="text-xs text-muted-foreground">{dl.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Weekly Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" /> Esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sesiones</span>
                    <span className="text-lg font-bold">{weeklyStats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tiempo</span>
                    <span className="text-lg font-bold">{Math.round(weeklyStats.totalMinutes / 60 * 10) / 10}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Materias</span>
                    <span className="text-lg font-bold">{weeklyStats.subjectsCovered}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" /> Fechas Límite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {deadlines
                    .filter((dl) => dl.date >= formatDate(new Date()))
                    .slice(0, 5)
                    .map((dl, idx) => {
                      const dlDate = new Date(dl.date + 'T12:00:00')
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            dl.category === 'core' ? 'bg-blue-500' :
                            dl.category === 'special' ? 'bg-orange-500' :
                            dl.category === 'stem' ? 'bg-purple-500' : 'bg-green-500'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{dl.subjectName}</p>
                            <p className="text-xs text-muted-foreground">
                              {dlDate.getDate()} {MONTH_NAMES[dlDate.getMonth()]}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  {deadlines.filter((dl) => dl.date >= formatDate(new Date())).length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay fechas límite próximas.</p>
                  )}
                </CardContent>
              </Card>

              {/* Subject Coverage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Materias a Cubrir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {curriculum.subjects
                    .sort((a, b) => (a.progress?.percentage ?? 0) - (b.progress?.percentage ?? 0))
                    .map((subject) => {
                      const category = getSubjectCategory(subject)
                      const progress = subject.progress?.percentage ?? 0
                      return (
                        <div key={subject.id} className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            category === 'core' ? 'bg-blue-500' :
                            category === 'special' ? 'bg-orange-500' :
                            category === 'stem' ? 'bg-purple-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm flex-1 truncate">{subject.name}</span>
                          <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session, idx) => {
              const sessionDate = new Date(session.date + 'T12:00:00')
              return (
                <Card key={idx} className={`border-l-4 ${CATEGORY_BORDER_COLORS[session.category]}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={CATEGORY_BADGE_COLORS[session.category]}>
                        {CATEGORY_LABELS[session.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sessionDate.getDate()} {MONTH_NAMES[sessionDate.getMonth()]}
                      </span>
                    </div>
                    <CardTitle className="text-base mt-2">{session.subjectName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {session.durationMinutes} min
                      </span>
                    </div>
                    {session.module && (
                      <p className="text-sm text-muted-foreground">{session.module}</p>
                    )}
                    {session.lesson && (
                      <p className="text-xs text-muted-foreground">Lección: {session.lesson}</p>
                    )}
                    {session.subjectCode && (
                      <p className="text-xs text-muted-foreground">
                        Código: {session.subjectCode}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {upcomingSessions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay sesiones próximas</h3>
                <p className="text-muted-foreground">Tu horario de estudio se genera automáticamente.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Horas Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Math.round(weeklyStats.totalMinutes / 60 * 10) / 10}h</p>
                <p className="text-xs text-muted-foreground">Tiempo de estudio sugerido</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Sesiones Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{weeklyStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sesiones programadas esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" /> Materias Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{weeklyStats.subjectsCovered}</p>
                <p className="text-xs text-muted-foreground">Materias a cubrir esta semana</p>
              </CardContent>
            </Card>
          </div>

          {/* Subject Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso por Materia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {curriculum.subjects
                  .sort((a, b) => (a.progress?.percentage ?? 0) - (b.progress?.percentage ?? 0))
                  .map((subject) => {
                    const category = getSubjectCategory(subject)
                    const progress = subject.progress?.percentage ?? 0
                    return (
                      <div key={subject.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded ${
                              category === 'core' ? 'bg-blue-500' :
                              category === 'special' ? 'bg-orange-500' :
                              category === 'stem' ? 'bg-purple-500' : 'bg-green-500'
                            }`} />
                            <span className="text-sm font-medium">{subject.name}</span>
                            <Badge className={`text-xs ${CATEGORY_BADGE_COLORS[category]}`}>
                              {CATEGORY_LABELS[category]}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              category === 'core' ? 'bg-blue-500' :
                              category === 'special' ? 'bg-orange-500' :
                              category === 'stem' ? 'bg-purple-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Deadlines Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Calendario de Fechas Límite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deadlines
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((dl, idx) => {
                    const dlDate = new Date(dl.date + 'T12:00:00')
                    const isPast = dl.date < formatDate(new Date())
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                          CATEGORY_BORDER_COLORS[dl.category]
                        } ${isPast ? 'opacity-50' : ''}`}
                      >
                        <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                          dl.category === 'core' ? 'bg-blue-500' :
                          dl.category === 'special' ? 'bg-orange-500' :
                          dl.category === 'stem' ? 'bg-purple-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{dl.subjectName}</p>
                            <span className="text-xs text-muted-foreground">
                              {dlDate.getDate()} {MONTH_NAMES[dlDate.getMonth()]} {dlDate.getFullYear()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{dl.description}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

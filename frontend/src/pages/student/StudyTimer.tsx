import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Clock,
  TrendingUp,
  Settings as SettingsIcon,
  Calendar,
  BarChart3,
  List,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import StudyTimerComponent, { StudySession } from '@/components/common/StudyTimer'
import api from '@/services/api'

// --- Types ---
interface Lesson {
  id: string
  name: string
  subject: string
}

interface TimerSettings {
  workDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}

const SESSIONS_STORAGE_KEY = 'study-timer-sessions'
const SETTINGS_STORAGE_KEY = 'study-timer-settings'
const STREAK_STORAGE_KEY = 'study-timer-streak'

function getAllSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(s: TimerSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s))
}

function getStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// --- Circular Progress (larger version for page) ---
function LargeCircularProgress({
  progress,
  isWork,
  secondsLeft,
}: {
  progress: number
  isWork: boolean
  secondsLeft: number
}) {
  const size = 300
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isWork ? 'hsl(var(--primary))' : 'hsl(var(--success, 142 76% 36%))'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-mono font-bold tabular-nums">
          {formatTime(secondsLeft)}
        </span>
        <Badge variant={isWork ? 'default' : 'secondary'} className="mt-3 text-sm px-4 py-1">
          {isWork ? 'Estudio' : 'Descanso'}
        </Badge>
      </div>
    </div>
  )
}

// --- Weekly data helper ---
function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })
}

// --- Main Page ---
export default function StudyTimerPage() {
  const { toast } = useToast()

  const [settings, setSettings] = useState<TimerSettings>(loadSettings)
  const [isRunning, setIsRunning] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(settings.workDuration * 60)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [completedSessions, setCompletedSessions] = useState<number>(0)
  const [allSessions, setAllSessions] = useState<StudySession[]>(getAllSessions)
  const [streak, setStreak] = useState<number>(getStreak)
  const [showSettings, setShowSettings] = useState(false)

  // Simulated lessons -- in production, fetch from API
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoadingLessons, setIsLoadingLessons] = useState(true)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get('/progress/summary')
        const bySubject = res.data.data?.bySubject || []
        const extracted: Lesson[] = []
        bySubject.forEach((s: any) => {
          if (s.subject) {
            extracted.push({
              id: s.code || s.subject,
              name: s.subject,
              subject: s.subject,
            })
          }
        })
        setLessons(extracted.length > 0 ? extracted : [])
      } catch {
        setLessons([])
      } finally {
        setIsLoadingLessons(false)
      }
    }
    fetchLessons()
  }, [])

  const totalSeconds = isWork ? settings.workDuration * 60 : settings.breakDuration * 60
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  const todaySessions = useMemo(
    () => allSessions.filter((s) => s.startedAt.startsWith(todayKey())),
    [allSessions]
  )

  const totalStudyMinutesToday = todaySessions
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0)

  const totalStudyHoursToday = (totalStudyMinutesToday / 60).toFixed(1)

  const weeklyData = useMemo(() => {
    const days = getLast7Days()
    return days.map((day) => {
      const daySessions = allSessions.filter(
        (s) => s.type === 'work' && s.startedAt.startsWith(day)
      )
      const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0)
      return { day, label: getDayLabel(day), minutes, count: daySessions.length }
    })
  }, [allSessions])

  const maxWeeklyMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1)

  // --- Timer logic (inline for the page) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Timer completion
  useEffect(() => {
    if (secondsLeft === 0) {
      // Play notification sound
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, audioCtx.currentTime)
        osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1)
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
        osc.start(audioCtx.currentTime)
        osc.stop(audioCtx.currentTime + 0.5)
      } catch {
        // Audio unsupported
      }

      if (isWork) {
        const session: StudySession = {
          id: Date.now().toString(),
          lessonId: selectedLessonId,
          subject: lessons.find((l) => l.id === selectedLessonId)?.subject || 'General',
          duration: settings.workDuration,
          type: 'work',
          startedAt: new Date(Date.now() - settings.workDuration * 60 * 1000).toISOString(),
          completedAt: new Date().toISOString(),
        }

        const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
        const all: StudySession[] = raw ? JSON.parse(raw) : []
        all.push(session)
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(all))
        setAllSessions(all)

        const newStreak = streak + 1
        setStreak(newStreak)
        localStorage.setItem(STREAK_STORAGE_KEY, newStreak.toString())

        if (selectedLessonId) {
          api.put(`/progress/${selectedLessonId}`, { timeSpent: settings.workDuration }).catch(() => { })
        }

        toast({
          title: 'Sesion completada!',
          description: `${settings.workDuration} minutos de estudio registrados.`,
        })

        const nextCompleted = completedSessions + 1
        setCompletedSessions(nextCompleted)

        if (nextCompleted % settings.sessionsBeforeLongBreak === 0) {
          setIsWork(false)
          setSecondsLeft(settings.longBreakDuration * 60)
        } else {
          setIsWork(false)
          setSecondsLeft(settings.breakDuration * 60)
        }
      } else {
        toast({
          title: 'Descanso terminado!',
          description: 'Listo para otra sesion de estudio?',
        })
        setIsWork(true)
        setSecondsLeft(settings.workDuration * 60)
      }

      setIsRunning(false)
    }
  }, [secondsLeft])

  const startTimer = () => {
    if (secondsLeft === 0) return
    setIsRunning(true)
  }

  const pauseTimer = () => setIsRunning(false)

  const resetTimer = () => {
    setIsRunning(false)
    setIsWork(true)
    setSecondsLeft(settings.workDuration * 60)
  }

  const handleSessionComplete = (_session: StudySession) => {
    setAllSessions(getAllSessions())
  }

  const updateSetting = (key: keyof TimerSettings, value: number) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveSettings(updated)

    // If timer is not running, apply new durations
    if (!isRunning) {
      if (key === 'workDuration' && isWork) {
        setSecondsLeft(value * 60)
      }
      if (key === 'breakDuration' && !isWork) {
        setSecondsLeft(value * 60)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Temporizador de Estudio</h1>
          <p className="text-muted-foreground">
            Usa la tecnica Pomodoro para optimizar tu estudio
          </p>
        </div>
      </div>

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Temporizador
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadisticas
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Ajustes
          </TabsTrigger>
        </TabsList>

        {/* ===== TIMER TAB ===== */}
        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timer Column */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5" />
                  Pomodoro
                </CardTitle>
                <CardDescription>
                  {isWork ? 'Concentrate en tu estudio' : 'Toma un descanso'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Selector */}
                <div className="space-y-2">
                  <Label htmlFor="subject-select">Materia / Leccion</Label>
                  <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                    <SelectTrigger id="subject-select">
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLessons && (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      )}
                      {lessons.length === 0 && !isLoadingLessons && (
                        <SelectItem value="general" disabled>
                          No hay materias disponibles
                        </SelectItem>
                      )}
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.subject} - {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Large Timer */}
                <div className="flex justify-center py-4">
                  <LargeCircularProgress
                    progress={progress}
                    isWork={isWork}
                    secondsLeft={secondsLeft}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="icon" onClick={resetTimer}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  {!isRunning ? (
                    <Button size="lg" onClick={startTimer} className="min-w-[140px]">
                      <Play className="mr-2 h-5 w-5" /> Iniciar
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={pauseTimer}
                      className="min-w-[140px]"
                    >
                      <Pause className="mr-2 h-5 w-5" /> Pausar
                    </Button>
                  )}
                </div>

                {/* Session counter */}
                <div className="text-center text-sm text-muted-foreground">
                  Sesion {completedSessions % settings.sessionsBeforeLongBreak} /{' '}
                  {settings.sessionsBeforeLongBreak}
                  {completedSessions >= settings.sessionsBeforeLongBreak && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      +{Math.floor(completedSessions / settings.sessionsBeforeLongBreak)} largas
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Column */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Tiempo hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalStudyHoursToday}h</p>
                    <p className="text-xs text-muted-foreground">
                      {totalStudyMinutesToday} minutos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Racha actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{streak}</p>
                    <p className="text-xs text-muted-foreground">sesiones completadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      Sesiones hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {todaySessions.filter((s) => s.type === 'work').length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      de {settings.workDuration} min cada una
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Mini Weekly Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Esta semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-32">
                    {weeklyData.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">{d.minutes}m</span>
                        <div className="w-full bg-muted rounded-t-sm relative" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500"
                            style={{
                              height: `${(d.minutes / maxWeeklyMinutes) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Embedded compact timer for reuse elsewhere */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Componente Reutilizable</CardTitle>
              <CardDescription>
                Este es el componente StudyTimer que puedes usar en otras paginas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudyTimerComponent
                lessons={lessons}
                workDuration={settings.workDuration}
                breakDuration={settings.breakDuration}
                longBreakDuration={settings.longBreakDuration}
                sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
                onSessionComplete={handleSessionComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== HISTORY TAB ===== */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sesiones de Hoy</CardTitle>
              <CardDescription>
                {todayKey()} - {todaySessions.filter((s) => s.type === 'work').length} sesiones de
                estudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay sesiones hoy</p>
                  <p className="text-sm">Inicia tu primer Pomodoro para comenzar a registrar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Hora</th>
                        <th className="text-left py-3 px-2 font-medium">Materia</th>
                        <th className="text-left py-3 px-2 font-medium">Tipo</th>
                        <th className="text-right py-3 px-2 font-medium">Duracion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...todaySessions]
                        .sort(
                          (a, b) =>
                            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                        )
                        .map((session) => (
                          <tr key={session.id} className="border-b last:border-0">
                            <td className="py-3 px-2">
                              {new Date(session.startedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                {session.subject}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge
                                variant={session.type === 'work' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {session.type === 'work' ? 'Estudio' : 'Descanso'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-mono">
                              {session.duration} min
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All sessions (last 50) */}
          {allSessions.length > todaySessions.length && (
            <Card>
              <CardHeader>
                <CardTitle>Historial Completo</CardTitle>
                <CardDescription>Ultimas 50 sesiones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium">Hora</th>
                        <th className="text-left py-3 px-2 font-medium">Materia</th>
                        <th className="text-left py-3 px-2 font-medium">Tipo</th>
                        <th className="text-right py-3 px-2 font-medium">Duracion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...allSessions]
                        .sort(
                          (a, b) =>
                            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                        )
                        .slice(0, 50)
                        .map((session) => (
                          <tr key={session.id} className="border-b last:border-0">
                            <td className="py-3 px-2">
                              {new Date(session.startedAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="py-3 px-2">
                              {new Date(session.startedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-2">{session.subject}</td>
                            <td className="py-3 px-2">
                              <Badge
                                variant={session.type === 'work' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {session.type === 'work' ? 'Estudio' : 'Descanso'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-mono">
                              {session.duration} min
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== STATS TAB ===== */}
        <TabsContent value="stats" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Tiempo hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalStudyHoursToday}h</p>
                <p className="text-xs text-muted-foreground">{totalStudyMinutesToday} min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Racha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">sesiones seguidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  Sesiones totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {allSessions.filter((s) => s.type === 'work').length}
                </p>
                <p className="text-xs text-muted-foreground">desde el inicio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Tiempo semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(weeklyData.reduce((s, d) => s + d.minutes, 0) / 60).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">ultimos 7 dias</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafico Semanal de Estudio
              </CardTitle>
              <CardDescription>Minutos de estudio por dia (ultimos 7 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {weeklyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold">{d.minutes}m</span>
                    <div
                      className="w-full bg-muted rounded-t-md relative"
                      style={{ height: '100%' }}
                    >
                      <div
                        className={`absolute bottom-0 w-full rounded-t-md transition-all duration-700 ${d.day === todayKey()
                          ? 'bg-primary'
                          : 'bg-primary/60'
                          }`}
                        style={{
                          height: `${(d.minutes / maxWeeklyMinutes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {d.label}
                    </span>
                    {d.day === todayKey() && (
                      <Badge variant="default" className="text-xs">
                        Hoy
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Tiempo por Materia</CardTitle>
              <CardDescription>Distribucion de tiempo de estudio</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const subjectMap = new Map<string, number>()
                allSessions
                  .filter((s) => s.type === 'work')
                  .forEach((s) => {
                    subjectMap.set(s.subject, (subjectMap.get(s.subject) || 0) + s.duration)
                  })

                if (subjectMap.size === 0) {
                  return (
                    <p className="text-center py-8 text-muted-foreground">
                      No hay datos de estudio aun.
                    </p>
                  )
                }

                const sorted = [...subjectMap.entries()].sort((a, b) => b[1] - a[1])
                const maxMinutes = sorted[0][1]

                return (
                  <div className="space-y-4">
                    {sorted.map(([subject, minutes]) => (
                      <div key={subject}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            {subject}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {minutes} min ({(minutes / 60).toFixed(1)}h)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                              width: `${(minutes / maxMinutes) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuración del Pomodoro
              </CardTitle>
              <CardDescription>
                Personaliza las duraciones de tus sesiones de estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Work Duration */}
                <div className="space-y-2">
                  <Label htmlFor="work-duration">
                    Duracion de estudio (minutos)
                  </Label>
                  <Input
                    id="work-duration"
                    type="number"
                    min={1}
                    max={120}
                    value={settings.workDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val > 0 && val <= 120) {
                        updateSetting('workDuration', val)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tiempo estandar: 25 minutos
                  </p>
                </div>

                {/* Break Duration */}
                <div className="space-y-2">
                  <Label htmlFor="break-duration">
                    Duracion de descanso corto (minutos)
                  </Label>
                  <Input
                    id="break-duration"
                    type="number"
                    min={1}
                    max={30}
                    value={settings.breakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val > 0 && val <= 30) {
                        updateSetting('breakDuration', val)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tiempo estandar: 5 minutos
                  </p>
                </div>

                {/* Long Break Duration */}
                <div className="space-y-2">
                  <Label htmlFor="long-break-duration">
                    Duracion de descanso largo (minutos)
                  </Label>
                  <Input
                    id="long-break-duration"
                    type="number"
                    min={1}
                    max={60}
                    value={settings.longBreakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val > 0 && val <= 60) {
                        updateSetting('longBreakDuration', val)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tiempo estandar: 15 minutos
                  </p>
                </div>

                {/* Sessions Before Long Break */}
                <div className="space-y-2">
                  <Label htmlFor="sessions-before-long">
                    Sesiones antes de descanso largo
                  </Label>
                  <Input
                    id="sessions-before-long"
                    type="number"
                    min={1}
                    max={10}
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val > 0 && val <= 10) {
                        updateSetting('sessionsBeforeLongBreak', val)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Estandar: 4 sesiones
                  </p>
                </div>
              </div>

              {/* Reset Settings */}
              <div className="flex justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Configuracion actual: {settings.workDuration} min estudio /{' '}
                  {settings.breakDuration} min descanso / {settings.longBreakDuration} min largo
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings(DEFAULT_SETTINGS)
                    saveSettings(DEFAULT_SETTINGS)
                    setCompletedSessions(0)
                    if (!isRunning) {
                      setSecondsLeft(DEFAULT_SETTINGS.workDuration * 60)
                    }
                    toast({
                      title: 'Configuracion restablecida',
                      description: 'Se aplicaron los valores por defecto.',
                    })
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clear Data */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
              <CardDescription>
                Acciones irreversibles sobre tus datos de estudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Borrar historial de sesiones</p>
                  <p className="text-sm text-muted-foreground">
                    Esto eliminara todas las sesiones almacenadas localmente.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem(SESSIONS_STORAGE_KEY)
                    localStorage.removeItem(STREAK_STORAGE_KEY)
                    setAllSessions([])
                    setStreak(0)
                    setCompletedSessions(0)
                    toast({
                      title: 'Historial borrado',
                      description: 'Se eliminaron todas las sesiones.',
                    })
                  }}
                >
                  Borrar datos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

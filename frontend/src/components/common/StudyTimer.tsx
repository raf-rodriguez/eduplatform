import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Timer, Play, Pause, RotateCcw, BookOpen, Clock, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

// --- Types ---
export interface StudySession {
  id: string
  lessonId: string
  subject: string
  duration: number // minutes
  type: 'work' | 'break'
  startedAt: string
  completedAt: string
}

interface StudyTimerProps {
  lessons?: { id: string; name: string; subject: string }[]
  workDuration?: number
  breakDuration?: number
  longBreakDuration?: number
  sessionsBeforeLongBreak?: number
  onSessionComplete?: (session: StudySession) => void
}

// --- Sound notification using Web Audio API ---
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
    oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.5)
  } catch {
    // Audio not supported
  }
}

// --- Circular Progress Component ---
function CircularProgress({
  progress,
  size = 240,
  strokeWidth = 10,
  children,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}) {
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
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// --- Helper: format seconds to mm:ss ---
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// --- Helper: get today's date string ---
function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// --- Local storage keys ---
const SESSIONS_STORAGE_KEY = 'study-timer-sessions'
const STREAK_STORAGE_KEY = 'study-timer-streak'

function getTodaySessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (!raw) return []
    const all: StudySession[] = JSON.parse(raw)
    return all.filter((s) => s.startedAt.startsWith(todayKey()))
  } catch {
    return []
  }
}

function saveSession(session: StudySession) {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    const all: StudySession[] = raw ? JSON.parse(raw) : []
    all.push(session)
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // storage full or unavailable
  }
}

function getStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

function incrementStreak() {
  const current = getStreak()
  localStorage.setItem(STREAK_STORAGE_KEY, (current + 1).toString())
}

// --- Main Component ---
export default function StudyTimer({
  lessons = [],
  workDuration = 25,
  breakDuration = 5,
  longBreakDuration = 15,
  sessionsBeforeLongBreak = 4,
  onSessionComplete,
}: StudyTimerProps) {
  const { toast } = useToast()

  const [isRunning, setIsRunning] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(workDuration * 60)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [completedSessions, setCompletedSessions] = useState<number>(0)
  const [todaySessions, setTodaySessions] = useState<StudySession[]>(getTodaySessions)
  const [streak, setStreak] = useState<number>(getStreak)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionStartRef = useRef<Date | null>(null)

  const totalSeconds = isWork ? workDuration * 60 : breakDuration * 60
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId)

  // --- Timer tick ---
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  // --- Handle timer completion ---
  useEffect(() => {
    if (secondsLeft === 0 && isRunning === false && sessionStartRef.current) {
      playNotificationSound()

      if (isWork) {
        // Log work session
        const session: StudySession = {
          id: Date.now().toString(),
          lessonId: selectedLessonId,
          subject: selectedLesson?.subject || selectedLesson?.name || 'General',
          duration: workDuration,
          type: 'work',
          startedAt: sessionStartRef.current.toISOString(),
          completedAt: new Date().toISOString(),
        }

        saveSession(session)
        setTodaySessions(getTodaySessions())
        const newStreak = streak + 1
        setStreak(newStreak)
        localStorage.setItem(STREAK_STORAGE_KEY, newStreak.toString())

        // Log to backend
        if (selectedLessonId) {
          logToBackend(selectedLessonId, workDuration).catch(() => {
            // silently fail
          })
        }

        onSessionComplete?.(session)

        toast({
          title: 'Sesion completada!',
          description: `${workDuration} minutos de estudio registrados.`,
        })

        // Switch to break
        const nextCompleted = completedSessions + 1
        setCompletedSessions(nextCompleted)

        if (nextCompleted % sessionsBeforeLongBreak === 0) {
          setIsWork(false)
          setSecondsLeft(longBreakDuration * 60)
        } else {
          setIsWork(false)
          setSecondsLeft(breakDuration * 60)
        }
      } else {
        // Break finished
        toast({
          title: 'Descanso terminado!',
          description: 'Listo para otra sesion de estudio?',
        })
        setIsWork(true)
        setSecondsLeft(workDuration * 60)
      }

      setIsRunning(false)
      sessionStartRef.current = null
    }
  }, [secondsLeft, isRunning])

  // --- Log to backend ---
  const logToBackend = async (lessonId: string, minutes: number) => {
    try {
      await api.put(`/progress/${lessonId}`, { timeSpent: minutes })
    } catch (error) {
      console.error('Failed to log study time:', error)
    }
  }

  // --- Controls ---
  const startTimer = useCallback(() => {
    if (secondsLeft === 0) return
    if (!isWork && !selectedLessonId) {
      toast({
        title: 'Selecciona una materia',
        description: 'Elige la materia que estas estudiando antes de iniciar.',
        variant: 'destructive',
      })
      return
    }
    sessionStartRef.current = new Date()
    setIsRunning(true)
  }, [secondsLeft, isWork, selectedLessonId, toast])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setIsWork(true)
    setSecondsLeft(workDuration * 60)
    sessionStartRef.current = null
  }, [workDuration])

  const skipPhase = useCallback(() => {
    setIsRunning(false)
    if (isWork) {
      setIsWork(false)
      setSecondsLeft(breakDuration * 60)
    } else {
      setIsWork(true)
      setSecondsLeft(workDuration * 60)
    }
    sessionStartRef.current = null
  }, [isWork, workDuration, breakDuration])

  // --- Stats ---
  const totalStudyMinutesToday = todaySessions
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0)

  const totalStudyHoursToday = (totalStudyMinutesToday / 60).toFixed(1)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          Pomodoro de Estudio
        </CardTitle>
        {selectedLesson && (
          <CardDescription className="flex items-center justify-center gap-1">
            <BookOpen className="h-3 w-3" />
            {selectedLesson.subject} - {selectedLesson.name}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subject Selector */}
        {lessons.length > 0 && (
          <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una materia" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id}>
                  {lesson.subject} - {lesson.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Circular Timer */}
        <div className="flex justify-center py-4">
          <CircularProgress progress={progress}>
            <span className="text-5xl font-mono font-bold tabular-nums">
              {formatTime(secondsLeft)}
            </span>
            <Badge variant={isWork ? 'default' : 'secondary'} className="mt-2">
              {isWork ? 'Estudio' : 'Descanso'}
            </Badge>
          </CircularProgress>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={resetTimer} title="Reiniciar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          {!isRunning ? (
            <Button size="lg" onClick={startTimer} className="min-w-[120px]">
              <Play className="mr-2 h-4 w-4" /> Iniciar
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={pauseTimer} className="min-w-[120px]">
              <Pause className="mr-2 h-4 w-4" /> Pausar
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={skipPhase} title="Saltar fase">
            <Clock className="h-4 w-4" />
          </Button>
        </div>

        {/* Session counter */}
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>
            Sesion {completedSessions % sessionsBeforeLongBreak}/{sessionsBeforeLongBreak}
          </span>
          {completedSessions >= sessionsBeforeLongBreak && (
            <Badge variant="outline" className="ml-1 text-xs">
              +{Math.floor(completedSessions / sessionsBeforeLongBreak)} largas
            </Badge>
          )}
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Tiempo hoy
            </div>
            <p className="text-lg font-semibold">{totalStudyHoursToday}h</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> Racha
            </div>
            <p className="text-lg font-semibold">{streak}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" /> Sesiones
            </div>
            <p className="text-lg font-semibold">
              {todaySessions.filter((s) => s.type === 'work').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { useEffect, useState, useCallback } from 'react'
import {
  Flame,
  Calendar,
  Clock,
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  Lock,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import api from '@/services/api'

// --- Types ---
interface StreakProfile {
  currentStreak: number
  longestStreak: number
  lastActivityAt: string
  activityHeatmap?: Record<string, number>
}

interface Milestone {
  days: number
  label: string
  icon: typeof Star
  description: string
}

// --- Constants ---
const MILESTONES: Milestone[] = [
  { days: 3, label: 'Primer paso', icon: Star, description: '3 días de racha' },
  { days: 7, label: 'Semana completa', icon: Zap, description: '7 días de racha' },
  { days: 14, label: 'Dos semanas', icon: Target, description: '14 días de racha' },
  { days: 30, label: 'Un mes', icon: Award, description: '30 días de racha' },
  { days: 60, label: 'Dos meses', icon: Trophy, description: '60 días de racha' },
  { days: 90, label: 'Leyenda', icon: Flame, description: '90 días de racha' },
]

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const STREAK_TIPS = [
  {
    title: 'Estudia un poco cada día',
    description:
      'Incluso 10 minutos cuentan. La consistencia es más importante que la cantidad.',
  },
  {
    title: 'Establece una hora fija',
    description:
      'Crear un hábito a la misma hora ayuda a mantener la racha sin esfuerzo.',
  },
  {
    title: 'Usa recordatorios',
    description:
      'Activa las notificaciones para que el sistema te recuerde estudiar.',
  },
  {
    title: 'Completa al menos una lección',
    description:
      'Una lección completada es suficiente para registrar un día activo.',
  },
  {
    title: 'Revisa tu progreso',
    description:
      'Ver tu racha crecer te motiva a no romper la cadena.',
  },
  {
    title: 'Recupera rachas perdidas',
    description:
      'Si pierdes tu racha, no te desanímalo. ¡Cada día es una nueva oportunidad!',
  },
]

// --- Helpers ---
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return formatDisplayDate(date)
}

function getLast90DaysActivity(): Record<string, number> {
  // Simulated activity data for the last 90 days
  // In production this would come from the API response
  const activity: Record<string, number> = {}
  const today = new Date()

  for (let i = 0; i < 90; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = formatDateKey(date)
    // Random activity: ~60% chance of being active, 1-3 activities
    activity[key] = Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0
  }

  return activity
}

function getThisWeekActivity(): boolean[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const weekDays: boolean[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const isFuture = date > today
    // Simulated: past days with ~65% activity rate
    weekDays.push(isFuture ? false : Math.random() > 0.35)
  }

  return weekDays
}

// --- Tooltip Component ---
function CalendarTooltip({
  visible,
  x,
  y,
  date,
  count,
}: {
  visible: boolean
  x: number
  y: number
  date: string
  count: number
}) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute z-50 rounded-md bg-popover px-3 py-2 text-sm shadow-md border"
      style={{ left: x, top: y - 50, transform: 'translateX(-50%)' }}
    >
      <div className="font-medium">{date}</div>
      <div className="text-muted-foreground">
        {count > 0 ? `${count} actividad${count > 1 ? 'es' : ''}` : 'Sin actividad'}
      </div>
    </div>
  )
}

// --- Calendar Heat Map ---
function CalendarHeatMap({
  activityData,
}: {
  activityData: Record<string, number>
}) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    date: string
    count: number
  }>({ visible: false, x: 0, y: 0, date: '', count: 0 })

  const today = new Date()
  const months: { year: number; month: number; label: string }[] = []

  for (let i = 2; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString('es-ES', { month: 'short' }),
    })
  }

  function getCellColor(count: number): string {
    if (count === 0) return 'bg-muted'
    if (count === 1) return 'bg-green-300 dark:bg-green-700'
    if (count === 2) return 'bg-green-400 dark:bg-green-600'
    return 'bg-green-500 dark:bg-green-500'
  }

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, dateStr: string, count: number) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        date: dateStr,
        count,
      })
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }, [])

  return (
    <div className="relative">
      <CalendarTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        date={tooltip.date}
        count={tooltip.count}
      />

      <div className="space-y-3">
        {months.map(({ year, month, label }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfMonth(year, month)
          const todayKey = formatDateKey(today)

          return (
            <div key={`${year}-${month}`} className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">{label}</div>
              <div className="grid grid-cols-7 gap-1">
                {/* Header row */}
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-muted-foreground py-1"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(year, month, day)
                  const dateKey = formatDateKey(date)
                  const count = activityData[dateKey] || 0
                  const isToday = dateKey === todayKey
                  const isFuture = date > today

                  return (
                    <div
                      key={dateKey}
                      className={`
                        aspect-square rounded-sm cursor-default transition-all
                        ${isFuture ? 'opacity-30' : ''}
                        ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                        ${getCellColor(count)}
                      `}
                      onMouseEnter={(e) => {
                        if (!isFuture) {
                          handleMouseEnter(
                            e,
                            date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }),
                            count
                          )
                        }
                      }}
                      onMouseLeave={handleMouseLeave}
                      title={
                        !isFuture
                          ? `${day}: ${count} actividad${count !== 1 ? 'es' : ''}`
                          : undefined
                      }
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
        </div>
        <span>Más</span>
      </div>
    </div>
  )
}

// --- Weekly Grid ---
function WeeklyGrid({ activeDays }: { activeDays: boolean[] }) {
  const activeCount = activeDays.filter(Boolean).length
  const progress = (activeCount / 7) * 100

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {activeDays.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
                transition-all
                ${
                  active
                    ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {active ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
            </div>
            <span className="text-xs text-muted-foreground">{WEEKDAYS[i]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progreso semanal</span>
          <span className="font-medium">
            {activeCount}/7 días
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {activeCount === 7 && (
          <Badge variant="default" className="bg-green-500">
            <Flame className="w-3 h-3 mr-1" /> ¡Semana perfecta!
          </Badge>
        )}
      </div>
    </div>
  )
}

// --- Milestone Card ---
function MilestoneCard({
  milestone,
  earned,
  currentStreak,
}: {
  milestone: Milestone
  earned: boolean
  currentStreak: number
}) {
  const Icon = milestone.icon

  return (
    <div
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
        ${
          earned
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800'
            : 'bg-muted/50 border-border opacity-60'
        }
      `}
    >
      {earned && (
        <div className="absolute -top-1 -right-1">
          <div className="bg-green-500 rounded-full p-0.5">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${
            earned
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-muted text-muted-foreground'
          }
        `}
      >
        {earned ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
      </div>

      <div className="text-center">
        <div className="text-sm font-semibold">{milestone.label}</div>
        <div className="text-xs text-muted-foreground">{milestone.description}</div>
      </div>

      <Badge variant={earned ? 'default' : 'secondary'} className={earned ? 'bg-orange-500' : ''}>
        {earned ? `${milestone.days} días` : `${milestone.days} días`}
      </Badge>

      {!earned && (
        <div className="text-xs text-muted-foreground">
          Faltan {milestone.days - currentStreak} días
        </div>
      )}
    </div>
  )
}

// --- Main Page Component ---
export default function StreakTracker() {
  const [profile, setProfile] = useState<StreakProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyActivity] = useState<boolean[]>(() => getThisWeekActivity())
  const [heatmapData] = useState<Record<string, number>>(() => getLast90DaysActivity())

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/gamification/profile')
        const data = res.data.data
        setProfile({
          currentStreak: data.profile?.currentStreak ?? 0,
          longestStreak: data.profile?.longestStreak ?? 0,
          lastActivityAt: data.profile?.lastActivityAt ?? new Date().toISOString(),
          activityHeatmap: data.activityHeatmap,
        })
      } catch (error) {
        console.error('Error fetching streak profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const currentStreak = profile?.currentStreak ?? 0
  const longestStreak = profile?.longestStreak ?? 0
  const lastActivityAt = profile?.lastActivityAt ?? new Date().toISOString()

  const nextMilestone = MILESTONES.find((m) => m.days > currentStreak)
  const nextMilestoneProgress = nextMilestone
    ? Math.min((currentStreak / nextMilestone.days) * 100, 100)
    : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Racha de Estudio</h1>
        <p className="text-muted-foreground">
          Mantén tu racha para desbloquear recompensas
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha actual
            </CardTitle>
            <div className="relative">
              <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
              <div className="absolute inset-0 h-5 w-5 text-orange-400 animate-ping opacity-30" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-500">{currentStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStreak === 0
                ? '¡Empieza hoy tu racha!'
                : `${currentStreak === 1 ? 'día' : 'días'} consecutivos`}
            </p>
            {nextMilestone && nextMilestoneProgress < 100 && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Siguiente: {nextMilestone.label}</span>
                  <span>
                    {currentStreak}/{nextMilestone.days}
                  </span>
                </div>
                <Progress value={nextMilestoneProgress} className="h-1.5" />
              </div>
            )}
            {nextMilestoneProgress >= 100 && (
              <Badge className="mt-3 bg-green-500">
                <Trophy className="w-3 h-3 mr-1" /> ¡Todos los hitos desbloqueados!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Longest Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha máxima
            </CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{longestStreak}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {longestStreak === 0
                ? 'Aún no tienes un récord'
                : `${longestStreak === 1 ? 'día' : 'días'} récord personal`}
            </p>
            {longestStreak > 0 && currentStreak >= longestStreak && (
              <Badge variant="default" className="mt-3 bg-purple-500">
                <Star className="w-3 h-3 mr-1" /> ¡Nuevo récord!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Last Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última actividad
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">
              {formatRelativeDate(lastActivityAt)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(lastActivityAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown + Calendar Heat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Grid */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Esta semana
            </CardTitle>
            <CardDescription>Tu actividad de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyGrid activeDays={weeklyActivity} />
          </CardContent>
        </Card>

        {/* Calendar Heat Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mapa de actividad
            </CardTitle>
            <CardDescription>Últimos 3 meses de actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarHeatMap activityData={heatmapData} />
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Hitos de racha
          </CardTitle>
          <CardDescription>
            Alcanza estos objetivos para desbloquear recompensas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {MILESTONES.map((milestone) => (
              <MilestoneCard
                key={milestone.days}
                milestone={milestone}
                earned={currentStreak >= milestone.days}
                currentStreak={currentStreak}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Cómo mantener tu racha
          </CardTitle>
          <CardDescription>
            Consejos para no perder tu racha de estudio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STREAK_TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold">{tip.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

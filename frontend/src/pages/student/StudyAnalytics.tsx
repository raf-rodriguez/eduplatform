import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, TrendingUp, Clock, Calendar, Zap, Lightbulb, Brain, Target,
  ChevronDown, ChevronUp, Award, Timer, Activity, Sun, Moon, Sunrise
} from 'lucide-react'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

// --- Types ---
interface StudySession {
  date: string
  duration: number // minutes
  subject: string
  score?: number
  xpEarned: number
  hour: number
  dayOfWeek: number
}

interface SubjectTime {
  subject: string
  minutes: number
  color: string
}

interface WeeklyData {
  week: string
  hours: number
  lessons: number
  xp: number
  avgScore: number
}

interface QuizScore {
  date: string
  score: number
  subject: string
}

// --- Color palette for subjects ---
const SUBJECT_COLORS: Record<string, string> = {
  'Espa\u00f1ol': '#3b82f6',
  'Matem\u00e1ticas': '#22c55e',
  'Ciencia': '#f59e0b',
  'Historia': '#ef4444',
  'Ingl\u00e9s': '#8b5cf6',
  'Ingl\u00e9s Conversacional': '#06b6d4',
  'Rob\u00f3tica': '#ec4899',
  'Finanzas': '#84cc16',
  'Salud': '#f97316',
}

const DEFAULT_COLOR = '#6366f1'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// --- Mock data generators (fallback when API unavailable) ---
function generateMockSessions(): StudySession[] {
  const subjects = Object.keys(SUBJECT_COLORS)
  const sessions: StudySession[] = []
  const now = new Date()

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    const hour = 6 + Math.floor(Math.random() * 17)
    date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)

    sessions.push({
      date: date.toISOString().split('T')[0],
      duration: 15 + Math.floor(Math.random() * 90),
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      score: 50 + Math.floor(Math.random() * 50),
      xpEarned: 10 + Math.floor(Math.random() * 40),
      hour,
      dayOfWeek: date.getDay(),
    })
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date))
}

function generateMockQuizScores(): QuizScore[] {
  const subjects = Object.keys(SUBJECT_COLORS)
  const scores: QuizScore[] = []
  const now = new Date()

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    scores.push({
      date: date.toISOString().split('T')[0],
      score: 45 + Math.floor(Math.random() * 55),
      subject: subjects[Math.floor(Math.random() * subjects.length)],
    })
  }

  return scores.sort((a, b) => a.date.localeCompare(b.date))
}

// --- Utility helpers ---
function getHeatmapColor(value: number): string {
  if (value === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (value <= 15) return 'bg-blue-100 dark:bg-blue-900/40'
  if (value <= 30) return 'bg-blue-200 dark:bg-blue-800/50'
  if (value <= 60) return 'bg-blue-300 dark:bg-blue-700/50'
  if (value <= 90) return 'bg-blue-400 dark:bg-blue-600/60'
  if (value <= 120) return 'bg-blue-500 dark:bg-blue-500/70'
  return 'bg-blue-600 dark:bg-blue-400/80'
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getPeriodIcon(period: string) {
  switch (period) {
    case 'morning': return Sunrise
    case 'afternoon': return Sun
    case 'evening': return Moon
    default: return Clock
  }
}

// --- CSS Bar Chart Component ---
function CssBarChart({
  data,
  dataKey,
  labelKey,
  height = 200,
  color = '#3b82f6',
  colors,
  showValues = true,
}: {
  data: Record<string, number>[]
  dataKey: string
  labelKey: string
  height?: number
  color?: string
  colors?: string[]
  showValues?: boolean
}) {
  const maxVal = Math.max(...data.map((d) => d[dataKey] as number), 1)

  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => {
        const val = d[dataKey] as number
        const pct = (val / maxVal) * 100
        const barColor = colors ? colors[i % colors.length] : color
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            {showValues && (
              <span className="text-xs font-medium mb-1 truncate w-full text-center">
                {typeof val === 'number' ? val.toFixed(0) : val}
              </span>
            )}
            <div
              className="w-full rounded-t-md transition-all duration-500 min-h-[2px]"
              style={{
                height: `${pct}%`,
                backgroundColor: barColor,
                minHeight: val > 0 ? '4px' : '2px',
              }}
              title={`${d[labelKey]}: ${val}`}
            />
            <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
              {d[labelKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- CSS Line Chart Component ---
function CssLineChart({
  data,
  dataKey,
  labelKey,
  height = 200,
  color = '#3b82f6',
  showDots = true,
  showGrid = true,
}: {
  data: Record<string, string | number>[]
  dataKey: string
  labelKey: string
  height?: number
  color?: string
  showDots?: boolean
  showGrid?: boolean
}) {
  const values = data.map((d) => d[dataKey] as number)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  const range = maxVal - minVal || 1

  const points = data.map((d, i) => {
    const val = d[dataKey] as number
    const x = (i / Math.max(data.length - 1, 1)) * 100
    const y = 100 - ((val - minVal) / range) * 80 - 10
    return { x, y, val, label: d[labelKey] as string }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L 100 100 L 0 100 Z`

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`lineGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.3" />
            ))}
          </>
        )}

        <path d={areaD} fill={`url(#lineGrad-${color.replace('#', '')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <div className="flex justify-between mt-1">
        {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0 || i === points.length - 1).map((p, i) => (
          <span key={i} className="text-xs text-muted-foreground truncate" style={{ maxWidth: `${100 / Math.min(points.length, 7)}%` }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// --- CSS Pie Chart Component ---
function CssPieChart({
  data,
  size = 200,
}: {
  data: { name: string; value: number; color: string }[]
  size?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  let cumulative = 0
  const segments = data.map((d) => {
    const pct = d.value / total
    const start = cumulative
    cumulative += pct
    return { ...d, pct, start }
  })

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const startAngle = seg.start * 360
          const endAngle = (seg.start + seg.pct) * 360
          return (
            <path
              key={i}
              d={describeArc(size / 2, size / 2, size / 2 - 4, startAngle, endAngle)}
              fill={seg.color}
              stroke="white"
              strokeWidth="2"
            >
              <title>{seg.name}: {seg.value} ({(seg.pct * 100).toFixed(1)}%)</title>
            </path>
          )
        })}
      </svg>

      <div className="flex flex-col gap-1 text-sm">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground truncate">
              {seg.name} ({(seg.pct * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Heatmap Component ---
function Heatmap({
  data,
}: {
  data: number[][] // 7 rows (days) x 17 columns (hours)
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Hour labels */}
        <div className="flex ml-8 mb-1">
          {HOURS.map((h) => (
            <div key={h} className="flex-1 text-center text-xs text-muted-foreground">
              {h}
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-muted-foreground w-7 flex-shrink-0">{day}</span>
            {HOURS.map((hour, hourIdx) => {
              const value = data[dayIdx]?.[hourIdx] || 0
              return (
                <div
                  key={hour}
                  className={`flex-1 aspect-square rounded-sm ${getHeatmapColor(value)} transition-colors`}
                  title={`${DAY_LABELS[dayIdx]} at ${hour}:00 - ${value} min`}
                />
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-8 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 15, 30, 60, 90, 120].map((v) => (
            <div key={v} className={`w-3 h-3 rounded-sm ${getHeatmapColor(v)}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function StudyAnalytics() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [quizScores, setQuizScores] = useState<QuizScore[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    try {
      // Try real API endpoints, fallback to mock data
      let fetchedSessions: StudySession[] = []
      let fetchedScores: QuizScore[] = []

      try {
        const [sessionsRes, scoresRes] = await Promise.all([
          api.get('/analytics/study-sessions'),
          api.get('/analytics/quiz-scores'),
        ])
        fetchedSessions = sessionsRes.data.sessions || []
        fetchedScores = scoresRes.data.scores || []
      } catch {
        // Fallback to mock data
        fetchedSessions = generateMockSessions()
        fetchedScores = generateMockQuizScores()
      }

      setSessions(fetchedSessions)
      setQuizScores(fetchedScores)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load analytics data. Showing demo data.',
        variant: 'destructive',
      })
      setSessions(generateMockSessions())
      setQuizScores(generateMockQuizScores())
    } finally {
      setLoading(false)
    }
  }

  // --- Computed analytics ---
  const filteredSessions = useMemo(() => {
    const now = new Date()
    const cutoff = new Date()
    cutoff.setDate(now.getDate() - (timeRange === 'week' ? 7 : 30))
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return sessions.filter((s) => s.date >= cutoffStr)
  }, [sessions, timeRange])

  const totalMinutes = useMemo(() => filteredSessions.reduce((s, sess) => s + sess.duration, 0), [filteredSessions])
  const totalHours = totalMinutes / 60
  const avgDailyMinutes = totalMinutes / 7
  const daysStudied = useMemo(() => new Set(filteredSessions.map((s) => s.date)).size, [filteredSessions])

  // Most productive time of day
  const timeOfDayStats = useMemo(() => {
    const periods = { morning: 0, afternoon: 0, evening: 0 }
    filteredSessions.forEach((s) => {
      if (s.hour >= 5 && s.hour < 12) periods.morning += s.duration
      else if (s.hour >= 12 && s.hour < 17) periods.afternoon += s.duration
      else periods.evening += s.duration
    })
    return periods
  }, [filteredSessions])

  const mostProductivePeriod = useMemo(() => {
    const entries = Object.entries(timeOfDayStats) as [string, number][]
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning'
  }, [timeOfDayStats])

  // Best study day
  const dayOfWeekStats = useMemo(() => {
    const days: Record<number, number> = {}
    filteredSessions.forEach((s) => {
      // Convert JS getDay() (0=Sun) to 0=Mon
      const dayIdx = s.dayOfWeek === 0 ? 6 : s.dayOfWeek - 1
      days[dayIdx] = (days[dayIdx] || 0) + s.duration
    })
    return days
  }, [filteredSessions])

  const bestStudyDay = useMemo(() => {
    const entries = Object.entries(dayOfWeekStats)
    if (entries.length === 0) return 1 // Tuesday
    return Number(entries.sort((a, b) => b[1] - a[1])[0][0])
  }, [dayOfWeekStats])

  // Subject distribution
  const subjectTime: SubjectTime[] = useMemo(() => {
    const map: Record<string, number> = {}
    filteredSessions.forEach((s) => {
      map[s.subject] = (map[s.subject] || 0) + s.duration
    })
    return Object.entries(map)
      .map(([subject, minutes]) => ({
        subject,
        minutes,
        color: SUBJECT_COLORS[subject] || DEFAULT_COLOR,
      }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [filteredSessions])

  // Session lengths
  const sessionLengths = useMemo(() => {
    const buckets = { short: 0, medium: 0, long: 0 }
    filteredSessions.forEach((s) => {
      if (s.duration < 20) buckets.short++
      else if (s.duration < 45) buckets.medium++
      else buckets.long++
    })
    return buckets
  }, [filteredSessions])

  // Break patterns (gaps between sessions on same day)
  const breakPatterns = useMemo(() => {
    const dayMap: Record<string, number[]> = {}
    filteredSessions.forEach((s) => {
      if (!dayMap[s.date]) dayMap[s.date] = []
      dayMap[s.date].push(s.hour)
    })
    const gaps: number[] = []
    Object.values(dayMap).forEach((hours) => {
      hours.sort((a, b) => a - b)
      for (let i = 1; i < hours.length; i++) {
        gaps.push((hours[i] - hours[i - 1]) * 60) // minutes
      }
    })
    if (gaps.length === 0) return { avgBreak: 0, shortBreaks: 0, longBreaks: 0 }
    const avgBreak = gaps.reduce((a, b) => a + b, 0) / gaps.length
    const shortBreaks = gaps.filter((g) => g < 30).length
    const longBreaks = gaps.filter((g) => g >= 60).length
    return { avgBreak, shortBreaks, longBreaks }
  }, [filteredSessions])

  // Weekly trends
  const weeklyTrend: WeeklyData[] = useMemo(() => {
    const weeks: Record<string, { hours: number; lessons: number; xp: number; scores: number[] }> = {}
    filteredSessions.forEach((s) => {
      const date = new Date(s.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const key = weekStart.toISOString().split('T')[0]
      if (!weeks[key]) weeks[key] = { hours: 0, lessons: 0, xp: 0, scores: [] }
      weeks[key].hours += s.duration / 60
      weeks[key].lessons += 1
      weeks[key].xp += s.xpEarned
      if (s.score) weeks[key].scores.push(s.score)
    })
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week,
        hours: Math.round(data.hours * 10) / 10,
        lessons: data.lessons,
        xp: data.xp,
        avgScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      }))
  }, [filteredSessions])

  // Heatmap data
  const heatmapData = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(HOURS.length).fill(0))
    filteredSessions.forEach((s) => {
      const dayIdx = s.dayOfWeek === 0 ? 6 : s.dayOfWeek - 1
      const hourIdx = HOURS.indexOf(s.hour)
      if (dayIdx >= 0 && hourIdx >= 0) {
        matrix[dayIdx][hourIdx] += s.duration
      }
    })
    return matrix
  }, [filteredSessions])

  // Quiz score trend
  const quizTrend = useMemo(() => {
    const byDate: Record<string, number[]> = {}
    quizScores.forEach((q) => {
      if (!byDate[q.date]) byDate[q.date] = []
      byDate[q.date].push(q.score)
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({
        date,
        label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .slice(-14)
  }, [quizScores])

  // XP trend
  const xpTrend = useMemo(() => {
    const byDate: Record<string, number> = {}
    filteredSessions.forEach((s) => {
      byDate[s.date] = (byDate[s.date] || 0) + s.xpEarned
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, xp]) => ({
        date,
        label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        xp,
      }))
      .slice(-14)
  }, [filteredSessions])

  // Lessons per week
  const lessonsPerWeek = useMemo(() => {
    return weeklyTrend.map((w) => ({
      week: new Date(w.week).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      lessons: w.lessons,
    }))
  }, [weeklyTrend])

  // Insights / Recommendations
  const insights = useMemo(() => {
    const items: { icon: string; title: string; description: string; type: 'positive' | 'warning' | 'info' }[] = []

    // Time of day insight
    const periodLabels = { morning: 'morning', afternoon: 'afternoon', evening: 'evening' }
    const periodIcons = { morning: 'sunrise', afternoon: 'sun', evening: 'moon' }
    const morningPct = timeOfDayStats.morning / Math.max(totalMinutes, 1)
    if (morningPct > 0.4) {
      items.push({ icon: 'sunrise', title: 'Morning Person', description: `You study best in the morning (${Math.round(morningPct * 100)}% of your time). Keep leveraging those early hours!`, type: 'positive' })
    } else if (timeOfDayStats.evening > timeOfDayStats.morning && timeOfDayStats.evening > timeOfDayStats.afternoon) {
      items.push({ icon: 'moon', title: 'Night Owl', description: 'Your most productive sessions are in the evening. Consider scheduling important topics when you feel most alert.', type: 'info' })
    }

    // Best day
    items.push({
      icon: 'calendar',
      title: `Most Productive Day: ${DAY_LABELS[bestStudyDay]}`,
      description: `${Math.round(dayOfWeekStats[bestStudyDay] / 60)}h studied on ${DAY_LABELS[bestStudyDay]} this period. Try to schedule challenging subjects on this day.`,
      type: 'positive',
    })

    // Subject needing attention
    if (subjectTime.length > 0) {
      const leastSubject = subjectTime[subjectTime.length - 1]
      const mostSubject = subjectTime[0]
      items.push({
        icon: 'target',
        title: `${leastSubject.subject} Needs Attention`,
        description: `Only ${formatMinutes(leastSubject.minutes)} on ${leastSubject.subject} vs ${formatMinutes(mostSubject.minutes)} on ${mostSubject.subject}. Consider dedicating more time to this subject.`,
        type: 'warning',
      })
    }

    // Session length
    const totalSessions = sessionLengths.short + sessionLengths.medium + sessionLengths.long
    if (totalSessions > 0) {
      const shortPct = (sessionLengths.short / totalSessions) * 100
      if (shortPct > 60) {
        items.push({
          icon: 'timer',
          title: 'Short Sessions Detected',
          description: `${Math.round(shortPct)}% of your sessions are under 20 minutes. Try extending sessions to 30-45 minutes for deeper learning.`,
          type: 'warning',
        })
      } else {
        items.push({
          icon: 'brain',
          title: 'Good Session Length',
          description: 'Your study sessions have a healthy length distribution. Keep up the consistent pacing!',
          type: 'positive',
        })
      }
    }

    // Break patterns
    if (breakPatterns.avgBreak > 0) {
      const avgHours = Math.round(breakPatterns.avgBreak / 60 * 10) / 10
      if (breakPatterns.longBreaks > breakPatterns.shortBreaks) {
        items.push({
          icon: 'zap',
          title: 'Long Breaks Between Sessions',
          description: `Average break of ${avgHours}h between sessions. Shorter gaps (1-2h) can help maintain momentum.`,
          type: 'info',
        })
      }
    }

    // Quiz trend
    if (quizTrend.length >= 3) {
      const recent = quizTrend.slice(-3).reduce((s, q) => s + q.score, 0) / 3
      const older = quizTrend.slice(0, -3).reduce((s, q) => s + q.score, 0) / Math.max(quizTrend.length - 3, 1)
      if (recent > older + 5) {
        items.push({
          icon: 'trendingUp',
          title: 'Quiz Scores Improving',
          description: `Your recent average (${Math.round(recent)}%) is trending up from ${Math.round(older)}%. Great progress!`,
          type: 'positive',
        })
      } else if (recent < older - 5) {
        items.push({
          icon: 'trendingUp',
          title: 'Quiz Scores Declining',
          description: `Recent average (${Math.round(recent)}%) dropped from ${Math.round(older)}%. Consider reviewing weaker topics.`,
          type: 'warning',
        })
      }
    }

    // Study consistency
    if (daysStudied < 4 && timeRange === 'week') {
      items.push({
        icon: 'calendar',
        title: 'Build Consistency',
        description: `You studied ${daysStudied} days this week. Try to study at least 5 days for better retention.`,
        type: 'warning',
      })
    } else if (daysStudied >= 5) {
      items.push({
        icon: 'award',
        title: 'Great Consistency!',
        description: `You studied ${daysStudied} days this week. Your consistency is excellent and will accelerate learning.`,
        type: 'positive',
      })
    }

    return items
  }, [timeOfDayStats, totalMinutes, bestStudyDay, dayOfWeekStats, subjectTime, sessionLengths, breakPatterns, quizTrend, daysStudied, timeRange])

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BarChart className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const SectionHeader = ({ id, title, description, icon: Icon }: { id: string; title: string; description: string; icon: React.ElementType }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between text-left hover:bg-accent/50 rounded-lg p-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {expandedSection === id ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Study Habits Analytics</h1>
          <p className="text-muted-foreground">Understand your learning patterns and optimize your study routine</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            This Month
          </Button>
        </div>
      </div>

      {/* ===== 1. STUDY TIME OVERVIEW ===== */}
      <Card>
        <SectionHeader
          id="overview"
          title="Study Time Overview"
          description="Your study habits at a glance"
          icon={Clock}
        />
        {expandedSection === 'overview' && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" /> Total Study Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">{formatMinutes(totalMinutes)} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" /> Daily Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatMinutes(Math.round(avgDailyMinutes))}</p>
                  <p className="text-xs text-muted-foreground">per day ({daysStudied} active days)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {(() => { const P = getPeriodIcon(mostProductivePeriod); return <P className="h-4 w-4 text-orange-500" /> })()}
                    Peak Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold capitalize">{mostProductivePeriod}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMinutes(timeOfDayStats[mostProductivePeriod as keyof typeof timeOfDayStats])} studied
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" /> Best Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{DAY_LABELS[bestStudyDay]}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMinutes(dayOfWeekStats[bestStudyDay] || 0)} this period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Time of day distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Time of Day Distribution</h4>
                <div className="space-y-3">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                    const icons = { morning: Sunrise, afternoon: Sun, evening: Moon }
                    const Icon = icons[period]
                    const val = timeOfDayStats[period]
                    const pct = totalMinutes > 0 ? (val / totalMinutes) * 100 : 0
                    return (
                      <div key={period}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{period}</span>
                          </div>
                          <span className="text-sm font-medium">{formatMinutes(val)}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Day of week */}
              <div>
                <h4 className="text-sm font-medium mb-3">Study Time by Day</h4>
                <CssBarChart
                  data={DAYS.map((day, i) => ({ day, minutes: dayOfWeekStats[i] || 0 }))}
                  dataKey="minutes"
                  labelKey="day"
                  height={140}
                  color="#8b5cf6"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ===== 2. SUBJECT DISTRIBUTION ===== */}
      <Card>
        <SectionHeader
          id="subjects"
          title="Subject Distribution"
          description="How your study time is distributed across subjects"
          icon={Target}
        />
        {expandedSection === 'subjects' && (
          <CardContent>
            {subjectTime.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No study data available for this period.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Time Spent per Subject</h4>
                  <CssPieChart
                    data={subjectTime.map((s) => ({ name: s.subject, value: s.minutes, color: s.color }))}
                    size={180}
                  />
                </div>

                {/* Bar chart: time vs progress */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Study Time by Subject</h4>
                  <CssBarChart
                    data={subjectTime.slice(0, 8).map((s) => ({ subject: s.subject.length > 10 ? s.subject.substring(0, 10) + '...' : s.subject, hours: Math.round(s.minutes / 60 * 10) / 10 }))}
                    dataKey="hours"
                    labelKey="subject"
                    height={180}
                    colors={subjectTime.slice(0, 8).map((s) => s.color)}
                  />
                </div>
              </div>
            )}

            {/* Subject detail list */}
            {subjectTime.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium">Subject Breakdown</h4>
                {subjectTime.map((s) => {
                  const pct = totalMinutes > 0 ? (s.minutes / totalMinutes) * 100 : 0
                  return (
                    <div key={s.subject} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-sm w-32 truncate">{s.subject}</span>
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-16 text-right">{formatMinutes(s.minutes)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ===== 3. LEARNING PATTERNS ===== */}
      <Card>
        <SectionHeader
          id="patterns"
          title="Learning Patterns"
          description="Discover your study habits and rhythms"
          icon={Brain}
        />
        {expandedSection === 'patterns' && (
          <CardContent>
            {/* Heatmap */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Study Activity Heatmap</h4>
              <p className="text-xs text-muted-foreground mb-2">Minutes studied by day and hour</p>
              <Heatmap data={heatmapData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session length distribution */}
              <div>
                <h4 className="text-sm font-medium mb-3">Session Length Distribution</h4>
                <CssBarChart
                  data={[
                    { label: 'Short (<20m)', count: sessionLengths.short },
                    { label: 'Medium (20-45m)', count: sessionLengths.medium },
                    { label: 'Long (45m+)', count: sessionLengths.long },
                  ]}
                  dataKey="count"
                  labelKey="label"
                  height={160}
                  colors={['#f59e0b', '#3b82f6', '#22c55e']}
                />
                <div className="mt-3 text-xs text-muted-foreground">
                  Total sessions: {sessionLengths.short + sessionLengths.medium + sessionLengths.long}
                </div>
              </div>

              {/* Break patterns */}
              <div>
                <h4 className="text-sm font-medium mb-3">Break Patterns</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Average Break</span>
                    </div>
                    <span className="font-semibold">
                      {breakPatterns.avgBreak > 0 ? formatMinutes(Math.round(breakPatterns.avgBreak)) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Short Breaks (&lt;30m)</span>
                    </div>
                    <Badge variant="secondary">{breakPatterns.shortBreaks}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Long Breaks (60m+)</span>
                    </div>
                    <Badge variant="secondary">{breakPatterns.longBreaks}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ===== 4. PERFORMANCE TRENDS ===== */}
      <Card>
        <SectionHeader
          id="performance"
          title="Performance Trends"
          description="Track your progress over time"
          icon={TrendingUp}
        />
        {expandedSection === 'performance' && (
          <CardContent>
            {/* Quiz scores */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Quiz Scores Over Time</h4>
              {quizTrend.length > 1 ? (
                <CssLineChart
                  data={quizTrend}
                  dataKey="score"
                  labelKey="label"
                  height={180}
                  color="#22c55e"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">Not enough quiz data yet.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lessons per week */}
              <div>
                <h4 className="text-sm font-medium mb-3">Lessons Completed per Week</h4>
                {lessonsPerWeek.length > 0 ? (
                  <CssBarChart
                    data={lessonsPerWeek}
                    dataKey="lessons"
                    labelKey="week"
                    height={160}
                    color="#3b82f6"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">No lesson data yet.</div>
                )}
              </div>

              {/* XP earned */}
              <div>
                <h4 className="text-sm font-medium mb-3">XP Earned Over Time</h4>
                {xpTrend.length > 1 ? (
                  <CssLineChart
                    data={xpTrend}
                    dataKey="xp"
                    labelKey="label"
                    height={160}
                    color="#f59e0b"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">Not enough XP data yet.</div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ===== 5. INSIGHTS & RECOMMENDATIONS ===== */}
      <Card>
        <SectionHeader
          id="insights"
          title="Insights & Recommendations"
          description="AI-powered suggestions to optimize your learning"
          icon={Lightbulb}
        />
        {expandedSection === 'insights' && (
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Study more to unlock personalized insights!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => {
                  const iconMap: Record<string, React.ElementType> = {
                    sunrise: Sunrise,
                    sun: Sun,
                    moon: Moon,
                    calendar: Calendar,
                    target: Target,
                    timer: Timer,
                    brain: Brain,
                    zap: Zap,
                    trendingUp: TrendingUp,
                    award: Award,
                  }
                  const Icon = iconMap[insight.icon] || Lightbulb
                  const borderColor = insight.type === 'positive' ? 'border-l-green-500' : insight.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'
                  const bgColor = insight.type === 'positive' ? 'bg-green-50/50 dark:bg-green-950/20' : insight.type === 'warning' ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'bg-blue-50/50 dark:bg-blue-950/20'
                  const badgeText = insight.type === 'positive' ? 'positive' : insight.type === 'warning' ? 'warning' : 'info'
                  const badgeColor = insight.type === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : insight.type === 'warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'

                  return (
                    <div key={i} className={`border-l-4 ${borderColor} ${bgColor} rounded-r-lg p-4`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background/80 mt-0.5">
                          <Icon className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge className={`text-xs ${badgeColor} border-0`}>{badgeText}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

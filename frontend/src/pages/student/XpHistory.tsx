import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp,
  Zap,
  Star,
  Award,
  Flame,
  Trophy,
  Clock,
  BarChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import api from '@/services/api'

// ============================================================
// NOTE FOR BACKEND:
// Currently this page simulates XP history data on the frontend.
// The XpLog model already exists in the Prisma schema and can
// store real XP history records.
//
// Recommended backend endpoint:
//   GET /api/gamification/xp-history?days=30
//
// Expected response shape:
// {
//   "data": {
//     "dailyXp": [{ "date": "2026-04-01", "amount": 120 }, ...],
//     "sources": { "assessments": 450, "badges": 200, "streaks": 100, "subjects": { "Math": 300, "Science": 250 } },
//     "recentActivity": [{ "amount": 50, "source": "assessment", "description": "Completed Quiz: Algebra Basics", "createdAt": "2026-04-03T10:00:00Z" }, ...]
//   }
// }
//
// Until the endpoint is ready, the frontend generates simulated
// data so the UI can be developed and reviewed.
// ============================================================

// ---------- Types ----------

interface DailyXp {
  date: string
  amount: number
}

interface XpSourceBreakdown {
  assessments: number
  badges: number
  streaks: number
  subjects: Record<string, number>
}

interface XpActivity {
  id: string
  amount: number
  source: string
  description: string
  createdAt: string
}

interface GamificationProfile {
  level: number
  totalXp: number
  currentStreak: number
  longestStreak: number
}

// ---------- Helpers ----------

function xpForLevel(level: number): number {
  // Each level requires level * 200 XP
  return level * 200
}

function xpProgressToNext(totalXp: number, level: number): number {
  const currentLevelXp = totalXp - (level - 1) * 200
  const needed = xpForLevel(level)
  return Math.min((currentLevelXp / needed) * 100, 100)
}

function generateSimulatedDailyXp(days: number): DailyXp[] {
  const result: DailyXp[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    // Weekdays earn more XP
    const base = dayOfWeek >= 1 && dayOfWeek <= 5 ? 60 : 20
    const amount = Math.max(0, base + Math.floor(Math.random() * 80 - 20))
    result.push({
      date: date.toISOString().split('T')[0],
      amount,
    })
  }
  return result
}

function generateSimulatedSources(): XpSourceBreakdown {
  return {
    assessments: 350 + Math.floor(Math.random() * 200),
    badges: 100 + Math.floor(Math.random() * 150),
    streaks: 50 + Math.floor(Math.random() * 100),
    subjects: {
      Mathematics: 180 + Math.floor(Math.random() * 120),
      Science: 120 + Math.floor(Math.random() * 100),
      Language: 80 + Math.floor(Math.random() * 80),
      History: 40 + Math.floor(Math.random() * 60),
    },
  }
}

function generateSimulatedActivity(): XpActivity[] {
  const activities: XpActivity[] = [
    {
      id: '1',
      amount: 75,
      source: 'assessment',
      description: 'Completed Quiz: Linear Equations',
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: '2',
      amount: 50,
      source: 'streak',
      description: '7-day study streak bonus',
      createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
    {
      id: '3',
      amount: 100,
      source: 'badge',
      description: 'Earned badge: Math Wizard',
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    },
    {
      id: '4',
      amount: 60,
      source: 'subject',
      description: 'Completed lesson: Photosynthesis',
      createdAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    },
    {
      id: '5',
      amount: 40,
      source: 'assessment',
      description: 'Scored 90% on Science Midterm',
      createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    },
    {
      id: '6',
      amount: 30,
      source: 'subject',
      description: 'Finished reading chapter: World War II',
      createdAt: new Date(Date.now() - 52 * 3600_000).toISOString(),
    },
    {
      id: '7',
      amount: 80,
      source: 'assessment',
      description: 'Completed Assessment: Grammar & Composition',
      createdAt: new Date(Date.now() - 72 * 3600_000).toISOString(),
    },
    {
      id: '8',
      amount: 25,
      source: 'streak',
      description: '3-day study streak milestone',
      createdAt: new Date(Date.now() - 96 * 3600_000).toISOString(),
    },
  ]
  return activities
}

function generateWeeklyComparison(): { thisWeek: number[]; lastWeek: number[]; labels: string[] } {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const thisWeek = labels.map(() => Math.floor(Math.random() * 100 + 20))
  const lastWeek = labels.map(() => Math.floor(Math.random() * 80 + 10))
  return { thisWeek, lastWeek, labels }
}

// ---------- Animated Number Component ----------

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

// ---------- CSS Bar Chart Components ----------

function DailyXpBarChart({ data }: { data: DailyXp[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  // Show at most 30 bars; group if needed
  const displayData = data.length > 30 ? data.filter((_, i) => i % Math.ceil(data.length / 30) === 0) : data

  return (
    <div className="flex items-end gap-1 h-40 w-full" role="img" aria-label="Daily XP bar chart">
      {displayData.map((day, idx) => {
        const heightPct = (day.amount / maxAmount) * 100
        const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        })
        return (
          <div
            key={idx}
            className="flex flex-col items-center flex-1 group relative"
            style={{ height: '100%' }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-md border">
              {dateLabel}: {day.amount} XP
            </div>
            <div
              className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/90 hover:to-primary/80"
              style={{ height: `${heightPct}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function WeeklyComparisonChart({
  thisWeek,
  lastWeek,
  labels,
}: {
  thisWeek: number[]
  lastWeek: number[]
  labels: string[]
}) {
  const maxVal = Math.max(...thisWeek, ...lastWeek, 1)

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
          This Week
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary/30" />
          Last Week
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2 h-36" role="img" aria-label="Weekly comparison chart">
        {labels.map((day, idx) => {
          const thisH = (thisWeek[idx] / maxVal) * 100
          const lastH = (lastWeek[idx] / maxVal) * 100
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5 w-full h-28">
                <div
                  className="flex-1 bg-primary rounded-t-sm transition-all"
                  style={{ height: `${thisH}%` }}
                  title={`This week: ${thisWeek[idx]} XP`}
                />
                <div
                  className="flex-1 bg-primary/30 rounded-t-sm transition-all"
                  style={{ height: `${lastH}%` }}
                  title={`Last week: ${lastWeek[idx]} XP`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PieLikeBreakdown({ sources }: { sources: XpSourceBreakdown }) {
  const categories = [
    {
      label: 'Assessments',
      value: sources.assessments,
      color: 'bg-blue-500',
      icon: <Trophy className="h-3.5 w-3.5" />,
    },
    {
      label: 'Badges',
      value: sources.badges,
      color: 'bg-yellow-500',
      icon: <Award className="h-3.5 w-3.5" />,
    },
    {
      label: 'Streaks',
      value: sources.streaks,
      color: 'bg-orange-500',
      icon: <Flame className="h-3.5 w-3.5" />,
    },
    {
      label: 'Subjects',
      value: Object.values(sources.subjects).reduce((a, b) => a + b, 0),
      color: 'bg-green-500',
      icon: <Star className="h-3.5 w-3.5" />,
    },
  ]

  const total = categories.reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="space-y-4">
      {/* Visual bar representation */}
      <div className="flex h-5 rounded-full overflow-hidden gap-px">
        {categories.map((cat) => {
          const pct = total > 0 ? (cat.value / total) * 100 : 0
          return (
            <div
              key={cat.label}
              className={`${cat.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${cat.label}: ${cat.value} XP (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={cat.label} className="flex items-center gap-2">
              <span className={`${cat.color} w-3 h-3 rounded-sm inline-flex items-center justify-center`}>
                <span className="text-white">{cat.icon}</span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground truncate">{cat.label}</div>
                <div className="text-sm font-semibold">
                  {cat.value} XP <span className="text-muted-foreground font-normal">({pct}%)</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subject sub-breakdown */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium">By Subject</h4>
        {Object.entries(sources.subjects).map(([subject, xp]) => {
          const maxSub = Math.max(...Object.values(sources.subjects), 1)
          const pct = (xp / maxSub) * 100
          return (
            <div key={subject} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{subject}</span>
                <span className="font-medium">{xp} XP</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'assessment':
      return <Trophy className="h-4 w-4 text-blue-500" />
    case 'badge':
      return <Award className="h-4 w-4 text-yellow-500" />
    case 'streak':
      return <Flame className="h-4 w-4 text-orange-500" />
    case 'subject':
      return <Star className="h-4 w-4 text-green-500" />
    default:
      return <Zap className="h-4 w-4 text-primary" />
  }
}

function getSourceBadgeVariant(source: string): 'default' | 'secondary' | 'outline' {
  switch (source) {
    case 'assessment':
      return 'default'
    case 'badge':
      return 'secondary'
    case 'streak':
      return 'default'
    default:
      return 'outline'
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const hours = Math.floor(diffMs / 3600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// ---------- Main Page Component ----------

export default function XpHistory() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [dailyXp, setDailyXp] = useState<DailyXp[]>([])
  const [sources, setSources] = useState<XpSourceBreakdown | null>(null)
  const [activities, setActivities] = useState<XpActivity[]>([])
  const [weeklyData, setWeeklyData] = useState<{
    thisWeek: number[]
    lastWeek: number[]
    labels: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      // Fetch real gamification profile from backend
      const profileRes = await api.get('/gamification/profile')
      const profileData = profileRes.data.data
      const gamProfile: GamificationProfile = {
        level: profileData.profile?.level ?? 1,
        totalXp: profileData.profile?.totalXp ?? 0,
        currentStreak: profileData.profile?.currentStreak ?? 0,
        longestStreak: profileData.profile?.longestStreak ?? 0,
      }
      setProfile(gamProfile)

      /*
       * TODO: Replace simulated data with real backend endpoint.
       * When GET /api/gamification/xp-history is available, swap the
       * simulated generators below with real API calls:
       *
       * const historyRes = await api.get('/gamification/xp-history?days=30')
       * setDailyXp(historyRes.data.data.dailyXp)
       * setSources(historyRes.data.data.sources)
       * setActivities(historyRes.data.data.recentActivity)
       */

      // Simulated data for now
      setDailyXp(generateSimulatedDailyXp(30))
      setSources(generateSimulatedSources())
      setActivities(generateSimulatedActivity())
      setWeeklyData(generateWeeklyComparison())
    } catch (error) {
      console.error('Error fetching XP history data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const levelXpNeeded = profile ? xpForLevel(profile.level) : 200
  const progressPct = profile ? xpProgressToNext(profile.totalXp, profile.level) : 0

  const totalSourcesXp = sources
    ? sources.assessments + sources.badges + sources.streaks + Object.values(sources.subjects).reduce((a, b) => a + b, 0)
    : 0

  const thisWeekTotal = weeklyData ? weeklyData.thisWeek.reduce((a, b) => a + b, 0) : 0
  const lastWeekTotal = weeklyData ? weeklyData.lastWeek.reduce((a, b) => a + b, 0) : 0
  const weekChange = lastWeekTotal > 0 ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(0) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          XP History
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your experience points over time
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total XP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber value={profile?.totalXp ?? 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.level ?? 1}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {levelXpNeeded} XP per level
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.currentStreak ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {profile?.longestStreak ?? 0} days
            </p>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisWeekTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {weekChange !== null && (
                <span className={Number(weekChange) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Number(weekChange) >= 0 ? '+' : ''}{weekChange}% vs last week
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Level Progress</CardTitle>
          <CardDescription>
            {profile?.totalXp ?? 0} / {(profile?.level ?? 1) * 200} XP to Level {(profile?.level ?? 1) + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPct} className="h-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Level {profile?.level}</span>
              <span>Level {(profile?.level ?? 1) + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily XP Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Daily XP (Last 30 Days)
            </CardTitle>
            <CardDescription>
              XP earned per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DailyXpBarChart data={dailyXp} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>
                {dailyXp.length > 0
                  ? new Date(dailyXp[0].date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                  : ''}
              </span>
              <span>
                {dailyXp.length > 0
                  ? new Date(dailyXp[dailyXp.length - 1].date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                  : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* XP Sources Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              XP Sources
            </CardTitle>
            <CardDescription>
              {totalSourcesXp} XP from tracked sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sources && <PieLikeBreakdown sources={sources} />}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Weekly Comparison
          </CardTitle>
          <CardDescription>
            This week vs last week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData && (
            <WeeklyComparisonChart
              thisWeek={weeklyData.thisWeek}
              lastWeek={weeklyData.lastWeek}
              labels={weeklyData.labels}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent XP Activity
          </CardTitle>
          <CardDescription>
            Latest XP gains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0">
                  {getSourceIcon(activity.source)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getSourceBadgeVariant(activity.source)} className="text-xs">
                      {activity.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-primary">+{activity.amount}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

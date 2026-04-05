import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  Zap,
  CheckCircle,
  Flame,
  Star,
  Trophy,
  Clock,
  BookOpen,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getTodayChallenges,
  markChallengeComplete,
  getStreak,
  getChallengeHistory,
  getTotalDailyXP,
  getTodayEarnedXP,
  getTodayPotentialXP,
  type DailyChallenge,
  type ChallengeHistoryEntry,
  type Difficulty,
} from '@/services/dailyChallenges'

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bgColor: string }> = {
  easy: {
    label: 'F&aacute;cil',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  medium: {
    label: 'Medio',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  hard: {
    label: 'Dif&iacute;cil',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
}

function getDifficultyIcon(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return <Star className="h-4 w-4 text-green-500" />
    case 'medium':
      return <Zap className="h-4 w-4 text-yellow-500" />
    case 'hard':
      return <Target className="h-4 w-4 text-red-500" />
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long' })
}

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([])
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState<ChallengeHistoryEntry[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [todayEarnedXP, setTodayEarnedXP] = useState(0)
  const [todayPotentialXP, setTodayPotentialXP] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const todayChallenges = getTodayChallenges()
      setChallenges(todayChallenges)
      setStreak(getStreak())
      setHistory(getChallengeHistory(7))
      setTotalXP(getTotalDailyXP())
      setTodayEarnedXP(getTodayEarnedXP())
      setTodayPotentialXP(getTodayPotentialXP())
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleComplete = (id: string) => {
    markChallengeComplete(id)
    const updated = getTodayChallenges()
    setChallenges(updated)
    setTodayEarnedXP(getTodayEarnedXP())

    // Refresh streak
    setStreak(getStreak())

    // Refresh history if all completed
    if (updated.every((c) => c.completed)) {
      setHistory(getChallengeHistory(7))
      setTotalXP(getTotalDailyXP())
    }
  }

  const completedCount = challenges.filter((c) => c.completed).length
  const totalCount = challenges.length
  const allCompleted = completedCount === totalCount && totalCount > 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          Desaf&iacute;os Diarios
        </h1>
        <p className="text-muted-foreground mt-1">
          Completa desaf&iacute;os cada d&iacute;a para ganar XP y mantener tu racha
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak}</div>
            <p className="text-xs text-muted-foreground">d&iacute;as consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XP Hoy</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {todayEarnedXP}
              <span className="text-lg text-muted-foreground">/{todayPotentialXP}</span>
            </div>
            <p className="text-xs text-muted-foreground">XP ganados hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Desaf&iacute;os Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <p className="text-xs text-muted-foreground">completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XP Total (30d)</CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalXP}</div>
            <p className="text-xs text-muted-foreground">en desaf&iacute;os diarios</p>
          </CardContent>
        </Card>
      </div>

      {/* All Completed Banner */}
      {allCompleted && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  &iexcl;Desaf&iacute;o diario perfecto!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Has completado todos los desaf&iacute;os de hoy. +{todayEarnedXP} XP ganados.
                  &iexcl;Vuelve ma&ntilde;ana para m&aacute;s!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Desaf&iacute;os de Hoy</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Se renuevan a medianoche
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty]
              const progressPercent = (challenge.progress / challenge.target) * 100

              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border transition-all ${challenge.completed
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-card hover:bg-muted/50'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${challenge.completed
                        ? 'bg-green-100 dark:bg-green-900/50'
                        : diffConfig.bgColor
                        }`}
                    >
                      {challenge.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        getDifficultyIcon(challenge.difficulty)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                          className={`font-semibold ${challenge.completed
                            ? 'line-through text-muted-foreground'
                            : ''
                            }`}
                        >
                          {challenge.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${diffConfig.color} ${diffConfig.bgColor}`}
                        >
                          {diffConfig.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {challenge.description}
                      </p>

                      {/* Progress bar */}
                      {!challenge.completed && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-medium">
                              {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}

                      {/* XP reward */}
                      <div className="flex items-center gap-2 mt-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          Recompensa: <strong className="text-yellow-600">+{challenge.xpReward} XP</strong>
                        </span>
                        {challenge.subjectName && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {challenge.subjectName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {challenge.completed ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                          Completado
                        </Badge>
                      ) : challenge.actionUrl ? (
                        <Link to={challenge.actionUrl}>
                          <Button size="sm">
                            Comenzar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" onClick={() => handleComplete(challenge.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay desaf&iacute;os disponibles hoy</p>
              <p className="text-sm">Vuelve ma&ntilde;ana para nuevos desaf&iacute;os</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial &uacute;ltimos 7 d&iacute;as
          </CardTitle>
          <CardDescription>
            Tu rendimiento en desaf&iacute;os diarios recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((entry) => {
                const percentage =
                  entry.totalCount > 0
                    ? Math.round((entry.completedCount / entry.totalCount) * 100)
                    : 0
                const dayName = getDayName(entry.date)
                const isToday = entry.date === new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={entry.date}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${isToday
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30'
                      }`}
                  >
                    <div className="w-24 shrink-0">
                      <span className="text-sm font-medium capitalize">{dayName}</span>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>

                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>

                    <div className="w-20 text-right shrink-0">
                      <span
                        className={`text-sm font-semibold ${percentage === 100
                          ? 'text-green-600'
                          : percentage >= 50
                            ? 'text-yellow-600'
                            : 'text-muted-foreground'
                          }`}
                      >
                        {entry.completedCount}/{entry.totalCount}
                      </span>
                    </div>

                    <div className="w-16 text-right shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          percentage === 100
                            ? 'text-green-600 bg-green-50 dark:bg-green-950/20'
                            : ''
                        }
                      >
                        {percentage === 100 ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay historial a&uacute;n</p>
              <p className="text-sm">
                Completa desaf&iacute;os hoy para empezar a ver tu historial
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/student/curriculum">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Ir al Curr&iacute;culo
          </Button>
        </Link>
        <Link to="/student/gamification">
          <Button variant="outline">
            <Trophy className="mr-2 h-4 w-4" />
            Ver Gamificaci&oacute;n
          </Button>
        </Link>
        <Link to="/student/progress">
          <Button variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Ver Progreso
          </Button>
        </Link>
      </div>
    </div>
  )
}

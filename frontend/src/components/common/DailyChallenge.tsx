import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Target, Zap, CheckCircle, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getTodayChallenges,
  markChallengeComplete,
  getStreak,
  type DailyChallenge as DailyChallengeType,
} from '@/services/dailyChallenges'

export default function DailyChallenge() {
  const [challenges, setChallenges] = useState<DailyChallengeType[]>([])
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = getTodayChallenges()
    setChallenges(data)
    setStreak(getStreak())
    setIsLoading(false)
  }, [])

  const handleComplete = (id: string) => {
    markChallengeComplete(id)
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: true, progress: c.target } : c))
    )
  }

  const completedCount = challenges.filter((c) => c.completed).length
  const totalCount = challenges.length

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Desaf&iacute;os del D&iacute;a</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desaf&iacute;os del D&iacute;a
          </CardTitle>
          {streak > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-orange-500">
              <Flame className="h-3 w-3" />
              {streak} d&iacute;as
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount}/{totalCount} completadas
              </span>
              <span className="font-medium text-green-600">
                +{completedCount * 25} XP
              </span>
            </div>
            <Progress value={(completedCount / totalCount) * 100} className="h-2" />
          </div>

          {/* Challenge list */}
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${challenge.completed
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-muted/30 hover:bg-muted/50'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {challenge.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium truncate ${challenge.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                    >
                      {challenge.title}
                    </span>
                  </div>
                  {!challenge.completed && (
                    <div className="flex items-center gap-2 ml-6">
                      <Progress
                        value={(challenge.progress / challenge.target) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                  )}
                </div>

                {!challenge.completed && challenge.actionUrl && (
                  <Link to={challenge.actionUrl}>
                    <Button size="sm" className="text-xs h-7">
                      Comenzar
                    </Button>
                  </Link>
                )}

                {!challenge.completed && !challenge.actionUrl && (
                  <Button
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleComplete(challenge.id)}
                  >
                    Completar
                  </Button>
                )}
              </div>
            ))}
          </div>

          {completedCount === totalCount && totalCount > 0 && (
            <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                &iexcl;Todos los desaf&iacute;os completados!
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                +{totalCount * 25} XP ganados hoy
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

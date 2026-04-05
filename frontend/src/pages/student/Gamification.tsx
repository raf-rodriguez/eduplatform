import { useEffect, useState } from 'react'
import { Trophy, Flame, Star, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import api from '@/services/api'
import { getInitials } from '@/lib/utils'

export default function Gamification() {
  const [profile, setProfile] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, badgesRes, leaderboardRes] = await Promise.all([
          api.get('/gamification/profile'),
          api.get('/gamification/badges'),
          api.get('/gamification/leaderboard'),
        ])
        setProfile(profileRes.data.data)
        setBadges(badgesRes.data.data)
        setLeaderboard(leaderboardRes.data.data)
      } catch (error) {
        console.error('Error fetching gamification data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const earnedBadges = badges.filter((b) => b.earned)
  const unearnedBadges = badges.filter((b) => !b.earned)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Logros</h1>
        <p className="text-muted-foreground">Tu progreso y recompensas</p>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nivel</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.profile?.level || 1}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.profile?.totalXp || 0} XP total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha actual</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.profile?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha máxima</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.profile?.longestStreak || 0}</div>
            <p className="text-xs text-muted-foreground">días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">de {badges.length} obtenidos</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso al siguiente nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nivel {profile?.profile?.level || 1}</span>
              <span>
                {profile?.xpForNextLevel
                  ? `Nivel ${(profile?.profile?.level || 1) + 1}`
                  : '¡Nivel máximo!'}
              </span>
            </div>
            <Progress value={(profile?.xpProgress || 0) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {profile?.xpForNextLevel
                ? `${profile?.profile?.totalXp || 0} / ${profile?.xpForNextLevel} XP`
                : `${profile?.profile?.totalXp || 0} XP`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 bg-primary/5 rounded-lg"
              >
                <div className="text-4xl mb-2">{badge.iconUrl || '🏆'}</div>
                <span className="text-sm font-medium text-center">{badge.name}</span>
                <span className="text-xs text-muted-foreground text-center">
                  +{badge.xpValue} XP
                </span>
              </div>
            ))}
          </div>

          {unearnedBadges.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-8 mb-4">Badges por desbloquear</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {unearnedBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 bg-muted rounded-lg opacity-50"
                  >
                    <div className="text-4xl mb-2 grayscale">{badge.iconUrl || '🔒'}</div>
                    <span className="text-sm font-medium text-center">{badge.name}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Clasificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry: any) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  entry.name === profile?.profile?.user?.name ? 'bg-primary/10' : 'bg-muted/50'
                }`}
              >
                <div className="font-bold w-8 text-center">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && entry.rank}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatarUrl} />
                  <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-medium">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Nivel {entry.level}</div>
                  <div className="text-sm text-muted-foreground">{entry.totalXp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

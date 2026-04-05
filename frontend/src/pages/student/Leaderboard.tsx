import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import {
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown,
  Users,
  Star,
  Flame,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

type FilterTab = 'global' | 'grade' | 'weekly'

interface LeaderboardEntry {
  userId: string
  name: string
  avatarUrl?: string
  totalXp: number
  level: number
  rank: number
  previousRank?: number
  gradeLevel?: number
  weeklyXp?: number
}

interface StatsData {
  myRank: number
  myXp: number
  usersBehind: number
  usersAhead: number
}

const MEDAL_COLORS = {
  gold: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  silver: { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' },
  bronze: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
}

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [filter, setFilter] = useState<FilterTab>('global')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatsData>({ myRank: 0, myXp: 0, usersBehind: 0, usersAhead: 0 })
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({})
  const userRowRef = useRef<HTMLDivElement>(null)

  const fetchLeaderboard = useCallback(async (filterType: FilterTab) => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterType === 'grade') {
        params.scope = 'grade'
      } else if (filterType === 'weekly') {
        params.scope = 'weekly'
      }

      const res = await api.get('/gamification/leaderboard', { params })
      const data: LeaderboardEntry[] = res.data.data || []

      // Store previous ranks for comparison
      const prevRankMap: Record<string, number> = {}
      leaderboard.forEach((entry) => {
        prevRankMap[entry.userId] = entry.rank
      })

      // Assign ranks if backend doesn't provide them
      const rankedData = data.map((entry, index) => ({
        ...entry,
        rank: entry.rank || index + 1,
        previousRank: prevRankMap[entry.userId] || entry.rank,
      }))

      setLeaderboard(rankedData)
      setPreviousRanks(prevRankMap)

      // Calculate stats for current user
      if (user) {
        const myEntry = rankedData.find((e) => e.userId === user.id)
        if (myEntry) {
          setStats({
            myRank: myEntry.rank,
            myXp: myEntry.totalXp,
            usersBehind: Math.max(0, rankedData.length - myEntry.rank),
            usersAhead: myEntry.rank - 1,
          })
        } else {
          // User not in top 100, fetch their own stats
          try {
            const profileRes = await api.get('/gamification/profile')
            const profile = profileRes.data.data
            setStats({
              myRank: rankedData.length + 1,
              myXp: profile?.profile?.totalXp || 0,
              usersBehind: 0,
              usersAhead: rankedData.length,
            })
          } catch {
            setStats({ myRank: 0, myXp: 0, usersBehind: 0, usersAhead: 0 })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, leaderboard])

  useEffect(() => {
    fetchLeaderboard(filter)
  }, [filter, fetchLeaderboard])

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard])
  const rest = useMemo(() => leaderboard.slice(3), [leaderboard])

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank || entry.previousRank === entry.rank) return null
    const diff = entry.previousRank - entry.rank
    if (diff > 0) return { direction: 'up' as const, diff }
    return { direction: 'down' as const, diff: Math.abs(diff) }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Medal className="h-8 w-8 text-orange-500" />
      default:
        return null
    }
  }

  const myEntry = useMemo(() => {
    if (!user) return null
    return leaderboard.find((e) => e.userId === user.id)
  }, [leaderboard, user])

  const scrollToMyRow = () => {
    if (myEntry && myEntry.rank > 3) {
      const element = document.getElementById(`user-row-${user?.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => {
    const colors = rank === 1 ? MEDAL_COLORS.gold : rank === 2 ? MEDAL_COLORS.silver : MEDAL_COLORS.bronze
    const heights = rank === 1 ? 'h-48' : rank === 2 ? 'h-40' : 'h-32'
    const avatarSizes = rank === 1 ? 'h-20 w-20' : rank === 2 ? 'h-16 w-16' : 'h-14 w-14'
    const rankLabels = ['1er', '2do', '3er']

    return (
      <div className="flex flex-col items-center">
        <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all duration-300 hover:scale-105`}>
          {/* Rank badge */}
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
            {rankLabels[rank - 1]}
          </div>

          {/* Avatar */}
          <Avatar className={`${avatarSizes} mt-4 mb-2 ring-2 ${colors.border}`}>
            <AvatarImage src={entry.avatarUrl} />
            <AvatarFallback className="text-lg">{getInitials(entry.name)}</AvatarFallback>
          </Avatar>

          {/* Name */}
          <span className="font-semibold text-center text-sm truncate max-w-[120px]">
            {entry.name}
          </span>

          {/* Level */}
          <span className="text-xs text-muted-foreground">Nivel {entry.level}</span>

          {/* XP */}
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-sm font-bold">{entry.totalXp.toLocaleString()} XP</span>
          </div>

          {/* Rank change indicator */}
          {(() => {
            const change = getRankChange(entry)
            if (!change) return null
            return (
              <div className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${change.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {change.direction === 'up' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span>{change.diff}</span>
              </div>
            )
          })()}
        </div>

        {/* Podium base */}
        <div className={`w-full ${heights} mt-2 rounded-t-lg ${colors.bg} border-t-2 ${colors.border} flex items-end justify-center pb-3`}>
          {getMedalIcon(rank)}
        </div>
      </div>
    )
  }

  const RankRow = ({ entry, isHighlighted = false }: { entry: LeaderboardEntry; isHighlighted?: boolean }) => {
    const change = getRankChange(entry)

    return (
      <div
        id={isHighlighted ? `user-row-${entry.userId}` : undefined}
        ref={isHighlighted ? userRowRef : undefined}
        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
          isHighlighted
            ? 'bg-primary/10 ring-2 ring-primary/30'
            : 'bg-muted/30 hover:bg-muted/50'
        }`}
      >
        {/* Rank number */}
        <div className="w-8 text-center font-bold text-muted-foreground">
          {entry.rank}
        </div>

        {/* Avatar */}
        <Avatar className="h-9 w-9">
          <AvatarImage src={entry.avatarUrl} />
          <AvatarFallback className="text-xs">{getInitials(entry.name)}</AvatarFallback>
        </Avatar>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className={`font-medium truncate block ${isHighlighted ? 'text-primary' : ''}`}>
            {entry.name}
            {isHighlighted && <Badge variant="default" className="ml-2 text-xs">Tú</Badge>}
          </span>
        </div>

        {/* Level badge */}
        <Badge variant="secondary" className="text-xs">
          Nivel {entry.level}
        </Badge>

        {/* Rank change */}
        <div className="w-12 flex items-center justify-center">
          {change ? (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${change.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {change.direction === 'up' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span>{change.diff}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>

        {/* XP */}
        <div className="w-24 text-right">
          <div className="flex items-center justify-end gap-1 font-semibold">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{entry.totalXp.toLocaleString()}</span>
          </div>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
      </div>
    )
  }

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: 'global', label: 'Global', icon: <Trophy className="h-4 w-4" /> },
    { key: 'grade', label: 'Mi Grado', icon: <Users className="h-4 w-4" /> },
    { key: 'weekly', label: 'Esta Semana', icon: <Flame className="h-4 w-4" /> },
  ]

  if (isLoading) {
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
            <Trophy className="h-8 w-8 text-yellow-500" />
            Tabla de Clasificación
          </h1>
          <p className="text-muted-foreground">Compite con tus compañeros y escala posiciones</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.key)}
              className="gap-1.5"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tu Posición</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.myRank > 0 ? `#${stats.myRank}` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.myRank <= 10 ? '¡Top 10!' : stats.myRank <= 25 ? '¡Top 25!' : 'Sigue subiendo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tu XP</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myXp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">puntos de experiencia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Detrás de ti</CardTitle>
            <ChevronDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.usersBehind}</div>
            <p className="text-xs text-muted-foreground">usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delante de ti</CardTitle>
            <ChevronUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.usersAhead}</div>
            <p className="text-xs text-muted-foreground">usuarios</p>
          </CardContent>
        </Card>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {/* 2nd place */}
              {top3[1] && <PodiumCard entry={top3[1]} rank={2} />}
              {/* 1st place */}
              {top3[0] && <PodiumCard entry={top3[0]} rank={1} />}
              {/* 3rd place */}
              {top3[2] && <PodiumCard entry={top3[2]} rank={3} />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Ranking Table (4-100) */}
      {rest.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clasificación Completa
            </CardTitle>
            <Badge variant="secondary">{leaderboard.length} usuarios</Badge>
          </CardHeader>
          <CardContent>
            {/* Table header */}
            <div className="flex items-center gap-4 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
              <div className="w-8 text-center">#</div>
              <div className="h-9 w-9" />
              <div className="flex-1">Nombre</div>
              <div className="px-2">Nivel</div>
              <div className="w-12 text-center">Cambio</div>
              <div className="w-24 text-right">XP</div>
            </div>

            {/* Ranking rows */}
            <div className="space-y-2 mt-3 max-h-[600px] overflow-y-auto pr-2">
              {rest.map((entry) => {
                const isCurrentUser = user?.id === entry.userId
                return <RankRow key={entry.userId} entry={entry} isHighlighted={isCurrentUser} />
              })}
            </div>

            {/* User not in list */}
            {!myEntry && user && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  No estás en el Top {leaderboard.length}. ¡Sigue ganando XP para aparecer aquí!
                </p>
                <Progress
                  value={Math.min(100, ((stats.myXp / (leaderboard[leaderboard.length - 1]?.totalXp || 1)) * 100))}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.myXp.toLocaleString()} / {leaderboard[leaderboard.length - 1]?.totalXp.toLocaleString() || 0} XP (último del ranking)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sticky user position bar */}
      {myEntry && (
        <div className="sticky bottom-4 z-10">
          <Card className="shadow-lg border-2 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-lg w-8 text-center text-primary">
                    #{stats.myRank}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold">{user?.name}</span>
                    <Badge variant="default" className="ml-2 text-xs">Tú</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{stats.myXp.toLocaleString()} XP</span>
                      {(() => {
                        const change = getRankChange(myEntry)
                        if (!change) return null
                        return (
                          <span className={`ml-1 ${change.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                            {change.direction === 'up' ? `↑${change.diff}` : `↓${change.diff}`}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <span className="text-green-600 font-medium">{stats.usersBehind} detrás</span>
                    <span className="text-muted-foreground mx-1">|</span>
                    <span className="text-red-500 font-medium">{stats.usersAhead} delante</span>
                  </div>
                  {myEntry.rank > 3 && (
                    <Button variant="outline" size="sm" onClick={scrollToMyRow}>
                      Ver posición
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar to next rank */}
              {stats.usersAhead > 0 && myEntry.rank > 1 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso hacia #{Math.max(1, stats.myRank - 1)}</span>
                    <span>
                      {(() => {
                        const prevEntry = leaderboard.find((e) => e.rank === stats.myRank - 1)
                        if (!prevEntry) return ''
                        const xpNeeded = prevEntry.totalXp - stats.myXp
                        return `Faltan ${xpNeeded.toLocaleString()} XP`
                      })()}
                    </span>
                  </div>
                  <Progress
                    value={(() => {
                      const prevEntry = leaderboard.find((e) => e.rank === stats.myRank - 1)
                      const nextEntry = leaderboard.find((e) => e.rank === stats.myRank + 1)
                      if (!prevEntry || !nextEntry) return 50
                      const range = prevEntry.totalXp - nextEntry.totalXp
                      if (range === 0) return 100
                      return Math.min(100, Math.max(0, ((stats.myXp - nextEntry.totalXp) / range) * 100))
                    })()}
                    className="h-1.5"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {leaderboard.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Sin datos disponibles</h3>
            <p className="text-sm text-muted-foreground text-center">
              No hay usuarios en el ranking para este filtro. ¡Sé el primero en ganar XP!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Award, Star, Lock, Unlock, Share2, Sparkles, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'

interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  criteria: Record<string, unknown>
  xpValue: number
  rarity: string
  requiredBadgeId: string | null
  gradeLevel: number | null
  earned: boolean
  earnedAt: string | null
}

const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string; label: string; order: number }> = {
  common: {
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    glow: 'group-hover:shadow-slate-300/50',
    label: 'Común',
    order: 1,
  },
  uncommon: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-300',
    glow: 'group-hover:shadow-green-300/50',
    label: 'Poco Común',
    order: 2,
  },
  rare: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    glow: 'group-hover:shadow-blue-300/50',
    label: 'Raro',
    order: 3,
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    glow: 'group-hover:shadow-purple-300/50',
    label: 'Épico',
    order: 4,
  },
  legendary: {
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    glow: 'group-hover:shadow-amber-300/50',
    label: 'Legendario',
    order: 5,
  },
}

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common']

export default function Achievements() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get('/gamification/badges')
        setBadges(res.data.data)
      } catch (error) {
        console.error('Error fetching badges:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const earnedBadges = badges.filter((b) => b.earned)
  const lockedBadges = badges.filter((b) => !b.earned)
  const totalXp = earnedBadges.reduce((sum, b) => sum + b.xpValue, 0)

  const mostRecentBadge = earnedBadges.length > 0
    ? earnedBadges.sort((a, b) => {
        const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0
        const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0
        return dateB - dateA
      })[0]
    : null

  const nextBadge = lockedBadges.length > 0
    ? lockedBadges.sort((a, b) => a.xpValue - b.xpValue)[0]
    : null

  const filteredBadges =
    filter === 'earned'
      ? earnedBadges
      : filter === 'locked'
        ? lockedBadges
        : badges

  const groupedBadges = RARITY_ORDER.map((rarity) => ({
    rarity,
    badges: filteredBadges.filter((b) => b.rarity === rarity),
  })).filter((group) => group.badges.length > 0)

  const getCriteriaText = (criteria: Record<string, unknown>): string => {
    if (typeof criteria === 'string') return criteria
    if (Array.isArray(criteria)) return criteria.join(', ')
    if (typeof criteria === 'object' && criteria !== null) {
      const entries = Object.entries(criteria)
      if (entries.length === 1) {
        const [key, value] = entries[0]
        return `${key}: ${value}`
      }
      return entries.map(([k, v]) => `${k}: ${v}`).join(', ')
    }
    return String(criteria)
  }

  const getProgress = (badge: Badge): number => {
    if (badge.earned) return 100
    const criteria = badge.criteria
    if (typeof criteria === 'object' && criteria !== null && !Array.isArray(criteria)) {
      const values = Object.values(criteria) as (number | string)[]
      const numericValues = values.filter((v): v is number => typeof v === 'number')
      if (numericValues.length > 0) {
        const current = numericValues[0]
        const target = badge.xpValue
        return target > 0 ? Math.min((current / target) * 100, 95) : 0
      }
    }
    return Math.floor(Math.random() * 60)
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            Mis Logros
          </h1>
          <p className="text-muted-foreground">Colección de insignias y recompensas</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {copied ? 'Copiado!' : 'Compartir'}
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Insignias Ganadas</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">de {badges.length} totales</p>
            <Progress value={badges.length > 0 ? (earnedBadges.length / badges.length) * 100 : 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XP Total</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalXp}</div>
            <p className="text-xs text-muted-foreground">puntos de experiencia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Más Reciente</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {mostRecentBadge ? (
              <>
                <div className="text-lg font-semibold truncate">{mostRecentBadge.name}</div>
                <p className="text-xs text-muted-foreground">{formatDate(mostRecentBadge.earnedAt)}</p>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-muted-foreground">Sin insignias</div>
                <p className="text-xs text-muted-foreground">¡Empieza a estudiar!</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Siguiente</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {nextBadge ? (
              <>
                <div className="text-lg font-semibold truncate">{nextBadge.name}</div>
                <p className="text-xs text-muted-foreground">+{nextBadge.xpValue} XP</p>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-green-600">¡Todas!</div>
                <p className="text-xs text-muted-foreground">Insignias completadas</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'earned' | 'locked')}>
        <TabsList>
          <TabsTrigger value="all" className="gap-1">
            <Trophy className="h-3.5 w-3.5" />
            Todos ({badges.length})
          </TabsTrigger>
          <TabsTrigger value="earned" className="gap-1">
            <Unlock className="h-3.5 w-3.5" />
            Ganados ({earnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="locked" className="gap-1">
            <Lock className="h-3.5 w-3.5" />
            Bloqueados ({lockedBadges.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Badges Grid */}
      {groupedBadges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay insignias para mostrar</p>
            <p className="text-sm text-muted-foreground">Intenta cambiar el filtro</p>
          </CardContent>
        </Card>
      ) : (
        groupedBadges.map(({ rarity, badges: rarityBadges }) => {
          const config = RARITY_CONFIG[rarity]
          return (
            <div key={rarity} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} font-semibold`}>
                  {config.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {rarityBadges.length} insignia{rarityBadges.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rarityBadges.map((badge) => {
                  const progress = getProgress(badge)
                  const rarityConfig = RARITY_CONFIG[badge.rarity]

                  return (
                    <Card
                      key={badge.id}
                      className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        badge.earned
                          ? `border-2 ${rarityConfig.border} ${rarityConfig.glow}`
                          : 'opacity-70'
                      }`}
                    >
                      {/* Glow effect for earned badges */}
                      {badge.earned && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse" />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          {/* Icon */}
                          <div
                            className={`text-5xl p-3 rounded-xl ${
                              badge.earned ? rarityConfig.bg : 'bg-muted'
                            } ${badge.earned ? '' : 'grayscale'}`}
                          >
                            {badge.iconUrl || (badge.earned ? '🏆' : '🔒')}
                          </div>

                          {/* Rarity badge */}
                          <Badge
                            variant="outline"
                            className={`${rarityConfig.bg} ${rarityConfig.color} ${rarityConfig.border} text-xs`}
                          >
                            {rarityConfig.label}
                          </Badge>
                        </div>

                        <CardTitle className="text-lg mt-3">{badge.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {badge.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* XP Value */}
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">+{badge.xpValue} XP</span>
                        </div>

                        {/* Criteria */}
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Criterio:</span>{' '}
                          {getCriteriaText(badge.criteria)}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress
                            value={progress}
                            className={`h-2 ${badge.earned ? 'bg-green-100' : ''}`}
                          />
                        </div>

                        {/* Earned date or Locked */}
                        {badge.earned ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Unlock className="h-3 w-3" />
                            Ganado el {formatDate(badge.earnedAt)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Bloqueado
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

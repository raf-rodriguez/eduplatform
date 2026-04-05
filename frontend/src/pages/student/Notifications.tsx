import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, Trash2, BookOpen, Trophy, Award, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: 'lesson' | 'assessment' | 'badge' | 'progress'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationsResponse {
  data: {
    notifications: Notification[]
    total: number
    page: number
    limit: number
  }
}

const typeIcons: Record<Notification['type'], React.ElementType> = {
  lesson: BookOpen,
  assessment: BookOpen,
  badge: Trophy,
  progress: TrendingUp,
}

const typeColors: Record<Notification['type'], string> = {
  lesson: 'bg-blue-100 text-blue-600',
  assessment: 'bg-purple-100 text-purple-600',
  badge: 'bg-yellow-100 text-yellow-600',
  progress: 'bg-green-100 text-green-600',
}

const typeLabels: Record<Notification['type'], string> = {
  lesson: 'Lesson',
  assessment: 'Assessment',
  badge: 'Badge',
  progress: 'Progress',
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return new Date(date).toLocaleDateString()
}

const PAGE_SIZE = 20

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      if (filter === 'unread') {
        params.set('unread', 'true')
      }
      const res = await api.get<NotificationsResponse>(`/notifications?${params}`)
      setNotifications(res.data.data.notifications)
      setTotal(res.data.data.total)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, filter, toast])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setIsActionLoading(true)
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setTotal(0)
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleClearAll = async () => {
    try {
      setIsActionLoading(true)
      // Mark all as read then clear the list
      await api.put('/notifications/read-all')
      setNotifications([])
      setTotal(0)
      toast({
        title: 'Success',
        description: 'All notifications cleared',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        variant: 'destructive',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const hasMore = page * PAGE_SIZE < total

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay up to date with your learning progress and updates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isActionLoading || total === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={isActionLoading || total === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as 'all' | 'unread'); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {total > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{total}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No notifications</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === 'unread'
                  ? 'You have no unread notifications. Great job staying on top of updates!'
                  : 'You don\'t have any notifications yet. We\'ll notify you about lessons, assessments, badges, and progress updates.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-5 transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                        typeColors[notification.type]
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm ${
                                !notification.read ? 'font-semibold' : 'font-medium'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                              {typeLabels[notification.type]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{timeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 h-8 px-3 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCheck className="mr-1 h-3.5 w-3.5" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}

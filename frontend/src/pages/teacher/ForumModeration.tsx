import { useState } from 'react'
import {
  Shield,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Flag,
  Eye,
  MessageSquare,
  Search,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============================================
// Types
// ============================================

interface ForumReply {
  id: string
  author: string
  authorRole: string
  content: string
  createdAt: string
  flagged: boolean
  flagReason?: string
}

interface ForumThread {
  id: string
  title: string
  author: string
  authorRole: string
  category: string
  content: string
  createdAt: string
  pinned: boolean
  locked: boolean
  replyCount: number
  viewCount: number
  lastActivity: string
  flagged: boolean
  flagReason?: string
  replies: ForumReply[]
}

// ============================================
// Simulated Data
// ============================================

const simulatedThreads: ForumThread[] = [
  {
    id: '1',
    title: 'Dudas sobre la tarea de fracciones',
    author: 'Maria Lopez',
    authorRole: 'Estudiante',
    category: 'Matematicas',
    content: 'No entiendo como multiplicar fracciones con denominadores diferentes. Podrian explicarme?',
    createdAt: '2026-04-01T10:30:00Z',
    pinned: true,
    locked: false,
    replyCount: 5,
    viewCount: 42,
    lastActivity: '2026-04-03T15:00:00Z',
    flagged: false,
    replies: [
      {
        id: 'r1',
        author: 'Carlos Ruiz',
        authorRole: 'Estudiante',
        content: 'Primero multiplicas los numeradores y luego los denominadores.',
        createdAt: '2026-04-01T11:00:00Z',
        flagged: false,
      },
      {
        id: 'r2',
        author: 'Ana Torres',
        authorRole: 'Estudiante',
        content: 'Este contenido es inapropiado TODO: simulated flagged content',
        createdAt: '2026-04-01T12:00:00Z',
        flagged: true,
        flagReason: 'Contenido inapropiado',
      },
      {
        id: 'r3',
        author: 'Prof. Juan Diaz',
        authorRole: 'Profesor',
        content: 'Exacto Carlos. Maria, recuerda que no necesitas denominadores iguales para multiplicar, solo para sumar.',
        createdAt: '2026-04-01T14:00:00Z',
        flagged: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Proyecto de ciencias - Fecha limite',
    author: 'Pedro Sanchez',
    authorRole: 'Estudiante',
    category: 'Ciencias',
    content: 'Cuando es la fecha limite para entregar el proyecto del sistema solar?',
    createdAt: '2026-04-02T09:00:00Z',
    pinned: false,
    locked: false,
    replyCount: 3,
    viewCount: 28,
    lastActivity: '2026-04-03T10:00:00Z',
    flagged: false,
    replies: [
      {
        id: 'r4',
        author: 'Prof. Laura Vega',
        authorRole: 'Profesor',
        content: 'La fecha limite es el 15 de abril. Asegurence de incluir la maqueta y el informe escrito.',
        createdAt: '2026-04-02T09:30:00Z',
        flagged: false,
      },
      {
        id: 'r5',
        author: 'Sofia Mendez',
        authorRole: 'Estudiante',
        content: 'Gracia profesora! Podemos trabajar en grupo?',
        createdAt: '2026-04-02T10:00:00Z',
        flagged: false,
      },
    ],
  },
  {
    id: '3',
    title: 'Contenido spam TODO: simulated flagged thread',
    author: 'UsuarioDesconocido',
    authorRole: 'Estudiante',
    category: 'General',
    content: 'Este es contenido spam que ha sido reportado por multiples usuarios. Compra productos en este enlace... TODO: simulated inappropriate content',
    createdAt: '2026-04-03T08:00:00Z',
    pinned: false,
    locked: false,
    replyCount: 0,
    viewCount: 5,
    lastActivity: '2026-04-03T08:00:00Z',
    flagged: true,
    flagReason: 'Spam y contenido inapropiado',
    replies: [],
  },
  {
    id: '4',
    title: 'Recursos adicionales para examen de historia',
    author: 'Prof. Roberto Colon',
    authorRole: 'Profesor',
    category: 'Historia',
    content: 'Les comparto estos recursos para prepararse para el examen de la semana que viene. Revisen los capitulos 5 al 8 del libro de texto.',
    createdAt: '2026-03-30T16:00:00Z',
    pinned: true,
    locked: true,
    replyCount: 8,
    viewCount: 67,
    lastActivity: '2026-04-02T20:00:00Z',
    flagged: false,
    replies: [
      {
        id: 'r6',
        author: 'Luis Rivera',
        authorRole: 'Estudiante',
        content: 'Gracias profesor. Hay alguna guia de estudio disponible?',
        createdAt: '2026-03-30T17:00:00Z',
        flagged: false,
      },
    ],
  },
  {
    id: '5',
    title: 'Problema con la plataforma - No puedo subir tarea',
    author: 'Carmen Ortiz',
    authorRole: 'Estudiante',
    category: 'Soporte',
    content: 'Intente subir mi tarea de programacion pero me da un error. El archivo pesa 2MB.',
    createdAt: '2026-04-03T14:00:00Z',
    pinned: false,
    locked: false,
    replyCount: 2,
    viewCount: 15,
    lastActivity: '2026-04-03T16:00:00Z',
    flagged: false,
    replies: [
      {
        id: 'r7',
        author: 'Prof. Miguel Santos',
        authorRole: 'Profesor',
        content: 'Carmen, intenta comprimir el archivo en ZIP. El limite es 5MB pero a veces hay problemas con ciertos formatos.',
        createdAt: '2026-04-03T14:30:00Z',
        flagged: false,
      },
      {
        id: 'r8',
        author: 'Carmen Ortiz',
        authorRole: 'Estudiante',
        content: 'Funciono! Muchas gracias.',
        createdAt: '2026-04-03T16:00:00Z',
        flagged: false,
      },
    ],
  },
]

// ============================================
// Helpers
// ============================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`
  return formatDate(dateStr)
}

function getRoleBadgeColor(role: string): string {
  return role === 'Profesor'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-700'
}

// ============================================
// Component
// ============================================

export default function ForumModeration() {
  const [threads, setThreads] = useState<ForumThread[]>(simulatedThreads)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [showThreadDialog, setShowThreadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'thread' | 'reply'; threadId: string; replyId?: string } | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Derived data
  const categories = Array.from(new Set(threads.map((t) => t.category)))

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      searchQuery === '' ||
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter

    let matchesTab = true
    if (activeTab === 'reported') {
      matchesTab = thread.flagged || thread.replies.some((r) => r.flagged)
    } else if (activeTab === 'pinned') {
      matchesTab = thread.pinned
    }

    return matchesSearch && matchesCategory && matchesTab
  })

  // Statistics
  const totalThreads = threads.length
  const totalReplies = threads.reduce((sum, t) => sum + t.replies.length, 0)
  const totalViews = threads.reduce((sum, t) => sum + t.viewCount, 0)
  const reportedCount = threads.filter((t) => t.flagged || t.replies.some((r) => r.flagged)).length
  const pinnedCount = threads.filter((t) => t.pinned).length
  const lockedCount = threads.filter((t) => t.locked).length

  // Handlers
  const handleTogglePin = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, pinned: !t.pinned } : t
      )
    )
  }

  const handleToggleLock = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, locked: !t.locked } : t
      )
    )
  }

  const handleDelete = (type: 'thread' | 'reply', threadId: string, replyId?: string) => {
    setDeleteTarget({ type, threadId, replyId })
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'thread') {
      setThreads((prev) => prev.filter((t) => t.id !== deleteTarget.threadId))
    } else if (deleteTarget.type === 'reply' && deleteTarget.replyId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === deleteTarget.threadId
            ? { ...t, replies: t.replies.filter((r) => r.id !== deleteTarget.replyId), replyCount: t.replyCount - 1 }
            : t
        )
      )
    }

    setShowDeleteDialog(false)
    setDeleteTarget(null)
  }

  const handleFlagThread = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, flagged: !t.flagged, flagReason: t.flagged ? undefined : 'Reportado por moderador' }
          : t
      )
    )
  }

  const handleFlagReply = (threadId: string, replyId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: t.replies.map((r) =>
                r.id === replyId
                  ? { ...r, flagged: !r.flagged, flagReason: r.flagged ? undefined : 'Reportado por moderador' }
                  : r
              ),
            }
          : t
      )
    )
  }

  const handleViewThread = (thread: ForumThread) => {
    setSelectedThread(thread)
    setShowThreadDialog(true)
  }

  const handleReportContent = (reason: string) => {
    // TODO: Send report to admin/backend
    console.log('Report submitted:', reason)
    setReportReason('')
    setShowReportDialog(false)
  }

  const handleDismissFlag = (threadId: string, replyId?: string) => {
    if (replyId) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                replies: t.replies.map((r) =>
                  r.id === replyId ? { ...r, flagged: false, flagReason: undefined } : r
                ),
              }
            : t
        )
      )
    } else {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, flagged: false, flagReason: undefined } : t
        )
      )
    }
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Moderacion del Foro</h1>
            <p className="text-muted-foreground">Gestiona y modera las discusiones del foro</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Moderador
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar threads por titulo, autor o categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todas las categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos los Threads</TabsTrigger>
          <TabsTrigger value="reported" className="relative">
            Reportados
            {reportedCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {reportedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pinned">Fijados</TabsTrigger>
          <TabsTrigger value="stats">Estadisticas</TabsTrigger>
        </TabsList>

        {/* ============================================
            Tab: Todos los Threads
            ============================================ */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Threads del Foro ({filteredThreads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <h3 className="text-lg font-semibold">No hay threads</h3>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron threads con los filtros seleccionados
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                        thread.pinned ? 'border-yellow-300 bg-yellow-50/30' : ''
                      } ${thread.flagged ? 'border-red-300 bg-red-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Thread Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {thread.pinned && (
                              <Pin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            )}
                            {thread.locked && (
                              <Lock className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <h3 className="font-semibold truncate">{thread.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {thread.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              por{' '}
                              <span className="font-medium">{thread.author}</span>
                            </span>
                            <Badge className={`text-xs ${getRoleBadgeColor(thread.authorRole)}`}>
                              {thread.authorRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(thread.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {thread.replyCount} respuestas
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {thread.viewCount} vistas
                            </span>
                            <span>Ultima actividad: {timeAgo(thread.lastActivity)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePin(thread.id)}
                            title={thread.pinned ? 'Desfijar thread' : 'Fijar thread'}
                          >
                            <Pin className={`h-4 w-4 ${thread.pinned ? 'text-yellow-600 fill-yellow-600' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLock(thread.id)}
                            title={thread.locked ? 'Desbloquear thread' : 'Bloquear thread'}
                          >
                            {thread.locked ? (
                              <Lock className="h-4 w-4 text-red-500" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewThread(thread)}
                            title="Ver thread completo"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFlagThread(thread.id)}
                            title={thread.flagged ? 'Quitar reporte' : 'Reportar thread'}
                          >
                            <Flag
                              className={`h-4 w-4 ${thread.flagged ? 'text-red-500 fill-red-500' : ''}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete('thread', thread.id)}
                            title="Eliminar thread"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Flagged replies inline */}
                      {thread.replies.some((r) => r.flagged) && (
                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2">
                          <div className="flex items-center gap-1 text-xs text-red-700 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {thread.replies.filter((r) => r.flagged).length} respuesta(s) reportada(s)
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            Tab: Reportados
            ============================================ */}
        <TabsContent value="reported" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                <Flag className="h-5 w-5" />
                Contenido Reportado ({filteredThreads.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Threads y respuestas que han sido marcados como inapropiados
              </p>
            </CardHeader>
            <CardContent>
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="mb-4 h-12 w-12 text-green-400" />
                  <h3 className="text-lg font-semibold">Todo limpio</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay contenido reportado pendiente de revision
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredThreads.map((thread) => (
                    <div key={thread.id} className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                      {/* Thread header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <h3 className="font-semibold">{thread.title}</h3>
                          </div>
                          {thread.flagged && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Thread reportado:</span>
                              <span className="text-muted-foreground ml-1">{thread.flagReason}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Por: {thread.author}</span>
                            <span>{timeAgo(thread.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewThread(thread)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissFlag(thread.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Descartar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete('thread', thread.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      {/* Flagged replies */}
                      {thread.replies.filter((r) => r.flagged).length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-red-200 pt-3">
                          <p className="text-xs font-medium text-red-700">Respuestas reportadas:</p>
                          {thread.replies
                            .filter((r) => r.flagged)
                            .map((reply) => (
                              <div
                                key={reply.id}
                                className="rounded-md border border-red-200 bg-white p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{reply.author}</span>
                                      <Badge className={`text-xs ${getRoleBadgeColor(reply.authorRole)}`}>
                                        {reply.authorRole}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {reply.content}
                                    </p>
                                    {reply.flagReason && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Motivo: {reply.flagReason}
                                      </p>
                                    )}
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                      {timeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDismissFlag(thread.id, reply.id)}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDelete('reply', thread.id, reply.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            Tab: Fijados
            ============================================ */}
        <TabsContent value="pinned" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pin className="h-5 w-5 text-yellow-600" />
                Threads Fijados ({filteredThreads.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Threads que aparecen siempre arriba en el foro
              </p>
            </CardHeader>
            <CardContent>
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Pin className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <h3 className="text-lg font-semibold">No hay threads fijados</h3>
                  <p className="text-sm text-muted-foreground">
                    Fija threads importantes para que aparezcan siempre primero
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="flex items-center gap-4 rounded-lg border border-yellow-200 bg-yellow-50/50 p-4"
                    >
                      <Pin className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{thread.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Por: {thread.author}</span>
                          <span>{thread.category}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {thread.replyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {thread.viewCount}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewThread(thread)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePin(thread.id)}
                      >
                        <Pin className="mr-1 h-3 w-3" />
                        Desfijar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            Tab: Estadisticas
            ============================================ */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Threads */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Total Threads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalThreads}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {threads.filter((t) => !t.locked).length} activos, {lockedCount} bloqueados
                </p>
              </CardContent>
            </Card>

            {/* Total Replies */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Total Respuestas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalReplies}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: {(totalReplies / Math.max(totalThreads, 1)).toFixed(1)} por thread
                </p>
              </CardContent>
            </Card>

            {/* Total Views */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Total Vistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: {Math.round(totalViews / Math.max(totalThreads, 1))} por thread
                </p>
              </CardContent>
            </Card>

            {/* Reported Content */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-500" />
                  Contenido Reportado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{reportedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren atencion
                </p>
              </CardContent>
            </Card>

            {/* Pinned Threads */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Pin className="h-4 w-4 text-yellow-600" />
                  Threads Fijados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pinnedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Threads destacados
                </p>
              </CardContent>
            </Card>

            {/* Activity Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tasa de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {/* TODO: Calculate real activity rate from backend data */}
                  78%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Threads con actividad en los ultimos 7 dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Actividad por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const catThreads = threads.filter((t) => t.category === cat)
                  const catReplies = catThreads.reduce((sum, t) => sum + t.replies.length, 0)
                  const catViews = catThreads.reduce((sum, t) => sum + t.viewCount, 0)
                  const maxViews = Math.max(...categories.map((c) =>
                    threads.filter((t) => t.category === c).reduce((s, t) => s + t.viewCount, 0)
                  ), 1)
                  const percentage = (catViews / maxViews) * 100

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat}</span>
                        <span className="text-muted-foreground">
                          {catThreads.length} threads, {catReplies} respuestas, {catViews} vistas
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* TODO: Replace with real activity log from backend */}
                {[
                  { action: 'Thread creado', detail: '"Dudas sobre la tarea de fracciones" por Maria Lopez', time: 'hace 3d' },
                  { action: 'Thread fijado', detail: '"Recursos adicionales para examen de historia"', time: 'hace 5d' },
                  { action: 'Contenido reportado', detail: '"Contenido spam" - pendiente de revision', time: 'hace 1d' },
                  { action: 'Thread bloqueado', detail: '"Recursos adicionales para examen de historia"', time: 'hace 4d' },
                  { action: 'Respuesta eliminada', detail: 'Respuesta de Ana Torres en "Dudas sobre fracciones"', time: 'hace 2d' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.action}</span>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================
          View Thread Dialog
          ============================================ */}
      <Dialog open={showThreadDialog} onOpenChange={setShowThreadDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedThread?.pinned && <Pin className="h-4 w-4 text-yellow-600" />}
              {selectedThread?.locked && <Lock className="h-4 w-4 text-red-500" />}
              {selectedThread?.title}
            </DialogTitle>
            <DialogDescription>
              Por {selectedThread?.author} - {selectedThread && formatDate(selectedThread.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedThread && (
            <div className="space-y-4">
              {/* Thread content */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleBadgeColor(selectedThread.authorRole)}>
                    {selectedThread.authorRole}
                  </Badge>
                  <span className="text-sm font-medium">{selectedThread.author}</span>
                </div>
                <p className="text-sm">{selectedThread.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {selectedThread.viewCount} vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {selectedThread.replies.length} respuestas
                  </span>
                </div>
              </div>

              {/* Replies */}
              {selectedThread.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Respuestas ({selectedThread.replies.length})
                  </h4>
                  {selectedThread.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg border p-3 ${
                        reply.flagged ? 'border-red-200 bg-red-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(reply.authorRole)}>
                            {reply.authorRole}
                          </Badge>
                          <span className="text-sm font-medium">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleFlagReply(selectedThread.id, reply.id)}
                            title={reply.flagged ? 'Quitar reporte' : 'Reportar respuesta'}
                          >
                            <Flag
                              className={`h-3 w-3 ${reply.flagged ? 'text-red-500 fill-red-500' : ''}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => handleDelete('reply', selectedThread.id, reply.id)}
                            title="Eliminar respuesta"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {reply.flagged && reply.flagReason && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                          <AlertTriangle className="h-3 w-3" />
                          Reportado: {reply.flagReason}
                        </div>
                      )}
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Moderation actions */}
              <div className="flex items-center gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleTogglePin(selectedThread.id)
                    setSelectedThread({ ...selectedThread, pinned: !selectedThread.pinned })
                  }}
                >
                  <Pin className="mr-1 h-3 w-3" />
                  {selectedThread.pinned ? 'Desfijar' : 'Fijar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggleLock(selectedThread.id)
                    setSelectedThread({ ...selectedThread, locked: !selectedThread.locked })
                  }}
                >
                  {selectedThread.locked ? (
                    <Unlock className="mr-1 h-3 w-3" />
                  ) : (
                    <Lock className="mr-1 h-3 w-3" />
                  )}
                  {selectedThread.locked ? 'Desbloquear' : 'Bloquear'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFlagThread(selectedThread.id)
                    setSelectedThread({
                      ...selectedThread,
                      flagged: !selectedThread.flagged,
                      flagReason: selectedThread.flagged ? undefined : 'Reportado por moderador',
                    })
                  }}
                >
                  <Flag className="mr-1 h-3 w-3" />
                  {selectedThread.flagged ? 'Quitar reporte' : 'Reportar'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowThreadDialog(false)
                    handleDelete('thread', selectedThread.id)
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Eliminar thread
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================
          Delete Confirmation Dialog
          ============================================ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Confirmar Eliminacion
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'thread'
                ? 'Estas seguro de que quieres eliminar este thread? Esta accion no se puede deshacer y se eliminaran todas las respuestas.'
                : 'Estas seguro de que quieres eliminar esta respuesta? Esta accion no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Report Content Dialog
          ============================================ */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Reportar Contenido
            </DialogTitle>
            <DialogDescription>
              Selecciona el motivo del reporte. El contenido sera revisado por un administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {/* TODO: Replace with real report submission to backend */}
            {['Spam', 'Contenido inapropiado', 'Acoso o amenazas', 'Informacion incorrecta', 'Otro'].map(
              (reason) => (
                <button
                  key={reason}
                  onClick={() => handleReportContent(reason)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted ${
                    reportReason === reason ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  {reason}
                </button>
              )
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

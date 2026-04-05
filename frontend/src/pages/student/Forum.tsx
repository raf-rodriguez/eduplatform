import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  MessageSquare, Plus, Search, ArrowUp, Pin, Eye, User, Clock,
  ArrowLeft, Send, MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

// ============================================
// Types
// ============================================

interface ForumAuthor {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface ForumThread {
  id: string
  subjectId: string | null
  lessonId: string | null
  title: string
  content: string
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  author: ForumAuthor
  replyCount: number
}

interface ForumReply {
  id: string
  threadId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  author: ForumAuthor
}

interface ForumThreadDetail extends ForumThread {
  replies: ForumReply[]
  replyCount: number
}

interface Subject {
  id: string
  name: string
  code: string
}

interface ThreadFormData {
  title: string
  content: string
  subjectId: string
  lessonId: string
}

// ============================================
// Helpers
// ============================================

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const EMPTY_FORM: ThreadFormData = {
  title: '',
  content: '',
  subjectId: '',
  lessonId: '',
}

// ============================================
// Component
// ============================================

export default function Forum() {
  const { threadId } = useParams<{ threadId: string }>()
  const { toast } = useToast()

  // Data state
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [activeThread, setActiveThread] = useState<ForumThreadDetail | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Create thread dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ThreadFormData>({ ...EMPTY_FORM })
  const [isCreating, setIsCreating] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalThreads, setTotalThreads] = useState(0)

  // ============================================
  // Fetch Data
  // ============================================

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: '20',
      }
      if (selectedSubject !== 'all') params.subjectId = selectedSubject
      if (searchQuery) params.search = searchQuery

      const { data } = await api.get('/forum/threads', { params })
      setThreads(data.data.threads)
      setTotalPages(data.data.pagination.totalPages)
      setTotalThreads(data.data.pagination.total)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load threads.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, selectedSubject, searchQuery, toast])

  const fetchThread = useCallback(async (id: string) => {
    setThreadLoading(true)
    try {
      const { data } = await api.get(`/forum/threads/${id}`)
      setActiveThread(data.data)
      // Increment view count
      await api.put(`/forum/threads/${id}/view`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load thread.',
        variant: 'destructive',
      })
    } finally {
      setThreadLoading(false)
    }
  }, [toast])

  const fetchSubjects = useCallback(async () => {
    try {
      const { data } = await api.get('/content/grades')
      const allSubjects: Subject[] = []
      const seen = new Set<string>()
      data.data.forEach((grade: any) => {
        grade.subjects.forEach((s: Subject) => {
          if (!seen.has(s.id)) {
            seen.add(s.id)
            allSubjects.push(s)
          }
        })
      })
      setSubjects(allSubjects)
    } catch {
      // Non-critical, just leave subjects empty
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    if (threadId) {
      fetchThread(threadId)
    } else {
      setActiveThread(null)
    }
  }, [threadId, fetchThread])

  // ============================================
  // Handlers
  // ============================================

  const handleViewThread = (threadId: string) => {
    window.history.pushState({}, '', `/student/forum/${threadId}`)
    fetchThread(threadId)
  }

  const handleBackToList = () => {
    setActiveThread(null)
    window.history.pushState({}, '', '/student/forum')
    fetchThreads()
  }

  const handleCreateThread = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' })
      return
    }
    if (!formData.content.trim()) {
      toast({ title: 'Error', description: 'Content is required.', variant: 'destructive' })
      return
    }

    try {
      setIsCreating(true)
      const { data } = await api.post('/forum/threads', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        subjectId: formData.subjectId || null,
        lessonId: formData.lessonId || null,
      })
      toast({
        title: 'Thread created',
        description: `"${data.data.title}" has been posted.`,
      })
      setIsCreateDialogOpen(false)
      setFormData({ ...EMPTY_FORM })
      setPage(1)
      fetchThreads()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create thread.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handlePostReply = async () => {
    if (!activeThread || !replyContent.trim()) return

    try {
      setIsSubmittingReply(true)
      await api.post(`/forum/threads/${activeThread.id}/replies`, {
        content: replyContent.trim(),
      })
      toast({
        title: 'Reply posted',
        description: 'Your reply has been posted.',
      })
      setReplyContent('')
      // Refresh thread to include new reply
      fetchThread(activeThread.id)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to post reply.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handleSubjectFilter = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setPage(1)
  }

  // ============================================
  // Render - Thread Detail View
  // ============================================

  if (activeThread) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to all threads
        </Button>

        {threadLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading thread...</div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {activeThread.isPinned && (
                        <Badge variant="default" className="gap-1 bg-yellow-500 hover:bg-yellow-600">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      {activeThread.isLocked && (
                        <Badge variant="secondary" className="gap-1">
                          Locked
                        </Badge>
                      )}
                      {subjects.find((s) => s.id === activeThread.subjectId) && (
                        <Badge variant="outline">
                          {subjects.find((s) => s.id === activeThread.subjectId)?.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{activeThread.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activeThread.author.avatarUrl || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(activeThread.author.firstName, activeThread.author.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activeThread.author.firstName} {activeThread.author.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(activeThread.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{activeThread.viewCount} views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>{activeThread.replyCount} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{activeThread.content}</p>
              </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Replies ({activeThread.replyCount})
              </h2>

              {activeThread.replies.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                  </CardContent>
                </Card>
              ) : (
                activeThread.replies.map((reply) => (
                  <Card key={reply.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.author.avatarUrl || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(reply.author.firstName, reply.author.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">
                            {reply.author.firstName} {reply.author.lastName}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(reply.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Reply Form */}
            {!activeThread.isLocked && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Post a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="resize-y min-h-[100px]"
                  />
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    onClick={handlePostReply}
                    disabled={!replyContent.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </div>
    )
  }

  // ============================================
  // Render - Thread List View
  // ============================================

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Discussion Forum
          </h1>
          <p className="text-muted-foreground">{totalThreads} threads</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Thread
        </Button>
      </div>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads by title or content..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {subjects.length > 0 && (
          <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Thread List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading threads...</div>
        </div>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || selectedSubject !== 'all' ? 'No threads found' : 'No threads yet'}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery || selectedSubject !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start the first discussion thread!'}
            </p>
            {!searchQuery && selectedSubject === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create Thread
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onView={() => handleViewThread(thread.id)}
              subjects={subjects}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* ── Create Thread Dialog ───────────────────────────────── */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Start a new discussion. Other students and teachers will be able to see and reply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Help with quadratic equations"
              />
            </div>

            {/* Subject */}
            {subjects.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Subject (optional)</label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, subjectId: v === 'none' ? '' : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No subject</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-1 block">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your question or topic..."
                rows={6}
                className="resize-y min-h-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Create Thread
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Thread Card Component
// ============================================

function ThreadCard({
  thread,
  onView,
  subjects,
}: {
  thread: ForumThread
  onView: () => void
  subjects: Subject[]
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onView}
    >
      <CardContent className="pt-5">
        <div className="flex gap-4">
          {/* Upvote column (visual placeholder for future feature) */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">{thread.replyCount}</span>
            <span className="text-[10px] text-muted-foreground">replies</span>
          </div>

          {/* Thread content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              {thread.isPinned && (
                <Pin className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
              )}
              <h3 className="text-base font-semibold line-clamp-1">
                {thread.title}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {thread.content}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{thread.author.firstName} {thread.author.lastName}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTimeAgo(thread.createdAt)}</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{thread.viewCount}</span>
              </div>

              {/* Subject badge */}
              {thread.subjectId && subjects.find((s) => s.id === thread.subjectId) && (
                <Badge variant="outline" className="text-xs">
                  {subjects.find((s) => s.id === thread.subjectId)?.name}
                </Badge>
              )}

              {/* Locked badge */}
              {thread.isLocked && (
                <Badge variant="secondary" className="text-xs">
                  Locked
                </Badge>
              )}
            </div>
          </div>

          {/* Author avatar */}
          <div className="shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.author.avatarUrl || ''} />
              <AvatarFallback>
                {getInitials(thread.author.firstName, thread.author.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

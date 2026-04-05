import { useState, useEffect, useCallback } from 'react'
import {
  StickyNote, Plus, Search, Pin, Tag, Edit2, Trash2, Grid, List,
  Filter, X, Save, BookOpen, Palette, Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

// ─── Types ───────────────────────────────────────────────────────────
interface StudyNote {
  id: string
  studentId: string
  lessonId: string | null
  subjectId: string | null
  title: string
  content: string
  color: NoteColor
  isPinned: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
type ViewMode = 'grid' | 'list'

interface NoteFormData {
  title: string
  content: string
  color: NoteColor
  isPinned: boolean
  tags: string[]
  lessonId: string
  subjectId: string
}

interface Lesson {
  id: string
  title: string
  moduleId: string
}

// ─── Constants ───────────────────────────────────────────────────────
const NOTE_COLORS: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'purple']

const COLOR_CONFIG: Record<NoteColor, { bg: string; border: string; dot: string; label: string }> = {
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-400',
    label: 'Yellow',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-400',
    label: 'Blue',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-400',
    label: 'Green',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-300 dark:border-pink-700',
    dot: 'bg-pink-400',
    label: 'Pink',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-700',
    dot: 'bg-purple-400',
    label: 'Purple',
  },
}

const EMPTY_FORM: NoteFormData = {
  title: '',
  content: '',
  color: 'yellow',
  isPinned: false,
  tags: [],
  lessonId: '',
  subjectId: '',
}

// ─── Component ───────────────────────────────────────────────────────
export default function StudyNotes() {
  const { toast } = useToast()

  // Data state
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>('createdAt')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null)
  const [formData, setFormData] = useState<NoteFormData>({ ...EMPTY_FORM })
  const [newTag, setNewTag] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotes, setTotalNotes] = useState(0)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  // ─── Fetch Data ──────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: '20',
        sortBy,
        sortOrder: 'desc',
      }
      if (searchQuery) params.search = searchQuery
      if (filterTag) params.tags = filterTag

      const { data } = await api.get('/notes', { params })
      setNotes(data.data.notes)
      setTotalPages(data.data.pagination.totalPages)
      setTotalNotes(data.data.pagination.total)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load notes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, filterTag, sortBy, toast])

  const fetchLessonsAndSubjects = useCallback(async () => {
    // Lessons would be fetched per-module; placeholder for future integration
    setLessons([])
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    fetchLessonsAndSubjects()
  }, [fetchLessonsAndSubjects])

  // ─── Computed ────────────────────────────────────────────────────
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort()

  // ─── Handlers ────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingNote(null)
    setFormData({ ...EMPTY_FORM })
    setIsDialogOpen(true)
  }

  const openEditDialog = (note: StudyNote) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
      tags: [...note.tags],
      lessonId: note.lessonId || '',
      subjectId: note.subjectId || '',
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' })
      return
    }
    if (!formData.content.trim()) {
      toast({ title: 'Error', description: 'Content is required.', variant: 'destructive' })
      return
    }

    try {
      if (editingNote) {
        const { data } = await api.put(`/notes/${editingNote.id}`, formData)
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? data.data : n)))
        toast({ title: 'Note updated', description: `"${data.data.title}" has been saved.` })
      } else {
        const { data } = await api.post('/notes', formData)
        setNotes((prev) => [data.data, ...prev])
        setTotalNotes((t) => t + 1)
        toast({ title: 'Note created', description: `"${data.data.title}" has been saved.` })
      }
      setIsDialogOpen(false)
      setFormData({ ...EMPTY_FORM })
      setEditingNote(null)
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${editingNote ? 'update' : 'create'} note.`,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!noteToDelete) return
    try {
      await api.delete(`/notes/${noteToDelete}`)
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete))
      setTotalNotes((t) => Math.max(0, t - 1))
      toast({ title: 'Note deleted', description: 'The note has been removed.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete note.', variant: 'destructive' })
    } finally {
      setDeleteDialogOpen(false)
      setNoteToDelete(null)
    }
  }

  const handleTogglePin = async (note: StudyNote) => {
    try {
      const { data } = await api.put(`/notes/${note.id}`, { isPinned: !note.isPinned })
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data.data : n)))
    } catch {
      toast({ title: 'Error', description: 'Failed to pin note.', variant: 'destructive' })
    }
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const confirmDelete = (id: string) => {
    setNoteToDelete(id)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StickyNote className="h-6 w-6" />
            My Study Notes
          </h1>
          <p className="text-muted-foreground">{totalNotes} notes saved</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      {/* ── Search & Controls ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Filter by Tag</label>
                <Select
                  value={filterTag}
                  onValueChange={(v) => {
                    setFilterTag(v === '__none__' ? '' : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">All tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="updatedAt">Date Updated</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(filterTag || searchQuery) && (
              <div className="flex gap-2 mt-4">
                {filterTag && (
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {filterTag}
                    <button onClick={() => setFilterTag('')} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterTag('')
                    setSearchQuery('')
                    setPage(1)
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Notes ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading notes...</div>
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterTag ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || filterTag
                ? 'Try adjusting your search or filters'
                : 'Create your first study note to get started'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCardGrid
              key={note.id}
              note={note}
              onEdit={() => openEditDialog(note)}
              onDelete={() => confirmDelete(note.id)}
              onTogglePin={() => handleTogglePin(note)}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCardList
              key={note.id}
              note={note}
              onEdit={() => openEditDialog(note)}
              onDelete={() => confirmDelete(note.id)}
              onTogglePin={() => handleTogglePin(note)}
              formatDate={formatDate}
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

      {/* ── Create/Edit Dialog ──────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </DialogTitle>
            <DialogDescription>
              {editingNote ? 'Update your study note details.' : 'Write a new study note.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Summary of Fractions"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Note Color
              </label>
              <div className="flex gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${COLOR_CONFIG[color].dot
                      } ${formData.color === color
                        ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-primary'
                        : 'border-muted'
                      }`}
                    title={COLOR_CONFIG[color].label}
                  >
                    {formData.color === color && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-1 block">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your note here..."
                rows={8}
                className="resize-y min-h-[150px]"
              />
            </div>

            {/* Link to Lesson */}
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Link to Lesson (optional)
              </label>
              <Select
                value={formData.lessonId}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, lessonId: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No lesson</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
            </div>

            {/* Pin */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-note"
                checked={formData.isPinned}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isPinned: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="pin-note" className="text-sm flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pin this note
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {editingNote ? 'Update' : 'Create'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Grid Note Card ──────────────────────────────────────────────────
function NoteCardGrid({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  formatDate,
}: {
  note: StudyNote
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  formatDate: (d: string) => string
}) {
  const config = COLOR_CONFIG[note.color]

  return (
    <Card
      className={`flex flex-col border-2 transition-all hover:shadow-md ${config.bg} ${config.border}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{note.title}</CardTitle>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onTogglePin}>
              <Pin
                className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="mr-1 h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>{formatDate(note.updatedAt)}</span>
          <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} title={`${config.label} note`} />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── List Note Card ──────────────────────────────────────────────────
function NoteCardList({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  formatDate,
}: {
  note: StudyNote
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  formatDate: (d: string) => string
}) {
  const config = COLOR_CONFIG[note.color]

  return (
    <Card
      className={`flex border-2 transition-all hover:shadow-md ${config.bg} ${config.border}`}
    >
      <div className={`w-1.5 shrink-0 rounded-l ${config.dot}`} />
      <CardContent className="flex-1 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {note.isPinned && <Pin className="h-3.5 w-3.5 fill-primary text-primary shrink-0" />}
              <h3 className="font-semibold truncate">{note.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onTogglePin}>
              <Pin
                className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

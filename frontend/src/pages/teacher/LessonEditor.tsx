import { useState, useCallback } from 'react'
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  Image,
  FileText,
  Video,
  ListChecks,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  ImageIcon,
  Code,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useMarkdownSafe } from '@/hooks/useMarkdownSafe'

// --- Types ---
interface LessonSection {
  id: string
  type: 'heading' | 'paragraph' | 'list' | 'ordered-list' | 'image' | 'divider'
  content: string
  items?: string[]
  imageUrl?: string
  imageAlt?: string
}

interface LessonAttachment {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'image'
  size: string
  url?: string
}

interface LessonActivity {
  id: string
  type: 'quiz' | 'assignment' | 'discussion'
  title: string
  description: string
  points?: number
  dueDate?: string
}

interface LessonData {
  id?: string
  title: string
  subject: string
  grade: string
  module: string
  description: string
  sections: LessonSection[]
  attachments: LessonAttachment[]
  activities: LessonActivity[]
  status: 'draft' | 'published'
}

// --- Helpers ---
const generateId = () => Math.random().toString(36).substring(2, 9)

const initialLesson: LessonData = {
  title: '',
  subject: '',
  grade: '',
  module: '',
  description: '',
  sections: [],
  attachments: [],
  activities: [],
  status: 'draft',
}

// ---------------------------------------------------------------------------
// Safe markdown preview component for lesson editor
// ---------------------------------------------------------------------------
function MarkdownPreview({ content }: { content: string }) {
  const safeHtml = useMarkdownSafe(content)
  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}

// --- Main Component ---
export default function LessonEditor() {
  const [lesson, setLesson] = useState<LessonData>(initialLesson)
  const [activeTab, setActiveTab] = useState('editar')
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  // --- Section Operations ---
  const addSection = useCallback(
    (type: LessonSection['type']) => {
      const newSection: LessonSection = {
        id: generateId(),
        type,
        content: '',
        items: type === 'list' || type === 'ordered-list' ? [''] : undefined,
        imageUrl: type === 'image' ? '' : undefined,
        imageAlt: type === 'image' ? '' : undefined,
      }
      setLesson((prev) => ({ ...prev, sections: [...prev.sections, newSection] }))
      setActiveSectionId(newSection.id)
    },
    []
  )

  const updateSection = useCallback(
    (id: string, updates: Partial<LessonSection>) => {
      setLesson((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }))
    },
    []
  )

  const removeSection = useCallback((id: string) => {
    setLesson((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }))
  }, [])

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    setLesson((prev) => {
      const sections = [...prev.sections]
      const index = sections.findIndex((s) => s.id === id)
      if (index < 0) return prev
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= sections.length) return prev
        ;[sections[index], sections[newIndex]] = [sections[newIndex], sections[index]]
      return { ...prev, sections }
    })
  }, [])

  // --- Attachment Operations ---
  const addAttachment = useCallback((file: { name: string; type: string; size: number }) => {
    const attachmentType: LessonAttachment['type'] =
      file.type === 'application/pdf'
        ? 'pdf'
        : file.type.startsWith('video')
          ? 'video'
          : file.type.startsWith('image')
            ? 'image'
            : 'document'

    const newAttachment: LessonAttachment = {
      id: generateId(),
      name: file.name,
      type: attachmentType,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    }
    setLesson((prev) => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment],
    }))
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setLesson((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }))
  }, [])

  // --- Activity Operations ---
  const addActivity = useCallback((type: LessonActivity['type']) => {
    const newActivity: LessonActivity = {
      id: generateId(),
      type,
      title:
        type === 'quiz'
          ? 'Nueva Prueba'
          : type === 'assignment'
            ? 'Nueva Tarea'
            : 'Nueva Discusi\u00f3n',
      description: '',
      points: type === 'quiz' || type === 'assignment' ? 100 : undefined,
    }
    setLesson((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }))
  }, [])

  const updateActivity = useCallback(
    (id: string, updates: Partial<LessonActivity>) => {
      setLesson((prev) => ({
        ...prev,
        activities: prev.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }))
    },
    []
  )

  const removeActivity = useCallback((id: string) => {
    setLesson((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }))
  }, [])

  // --- Save / Publish ---
  const handleSave = (status: 'draft' | 'published') => {
    setLesson((prev) => ({ ...prev, status }))
    // TODO: Integrate with backend API
    // Example:
    // await api.post('/api/lessons', { ...lesson, status }, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // toast.success(status === 'draft' ? 'Borrador guardado' : 'Lección publicada')
    console.log(`[${status.toUpperCase()}] Saving lesson:`, { ...lesson, status })
  }

  const insertAtCursor = useCallback(
    (prefix: string, suffix: string = '') => {
      if (!activeSectionId) return
      const section = lesson.sections.find((s) => s.id === activeSectionId)
      if (!section || section.type !== 'paragraph') return

      const textarea = document.querySelector(
        `textarea[data-section-id="${activeSectionId}"]`
      ) as HTMLTextAreaElement | null
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selected = textarea.value.substring(start, end)
      const replacement = `${prefix}${selected || 'texto'}${suffix}`
      const newContent =
        textarea.value.substring(0, start) + replacement + textarea.value.substring(end)

      updateSection(activeSectionId, { content: newContent })

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
      }, 0)
    },
    [activeSectionId, lesson.sections, updateSection]
  )

  // --- Render Helpers ---
  const getSectionIcon = (type: LessonSection['type']) => {
    switch (type) {
      case 'heading':
        return <Heading1 className="h-4 w-4" />
      case 'paragraph':
        return <AlignLeft className="h-4 w-4" />
      case 'list':
        return <List className="h-4 w-4" />
      case 'ordered-list':
        return <ListOrdered className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'divider':
        return <Separator className="h-4 w-4" />
      default:
        return null
    }
  }

  const getAttachmentIcon = (type: LessonAttachment['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />
      case 'document':
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityBadge = (type: LessonActivity['type']) => {
    switch (type) {
      case 'quiz':
        return { label: 'Prueba', color: 'bg-purple-100 text-purple-700' }
      case 'assignment':
        return { label: 'Tarea', color: 'bg-blue-100 text-blue-700' }
      case 'discussion':
        return { label: 'Discusión', color: 'bg-green-100 text-green-700' }
    }
  }

  // --- Render Functions for Each Tab ---
  const renderEditTab = () => (
    <div className="space-y-6">
      {/* Lesson Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Información de la Lección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lesson-title">Título de la Lección</Label>
            <Input
              id="lesson-title"
              placeholder="Ej: Introducción a las fracciones"
              value={lesson.title}
              onChange={(e) => setLesson((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="lesson-desc">Descripción</Label>
            <Textarea
              id="lesson-desc"
              placeholder="Breve descripción de la lección..."
              value={lesson.description}
              onChange={(e) => setLesson((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lesson-subject">Materia</Label>
              {/* TODO: Fetch subjects from backend: GET /api/subjects */}
              <Select
                value={lesson.subject}
                onValueChange={(v) => setLesson((prev) => ({ ...prev, subject: v }))}
              >
                <SelectTrigger id="lesson-subject" className="mt-1">
                  <SelectValue placeholder="Selecciona materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matematicas">Matemáticas</SelectItem>
                  <SelectItem value="espanol">Español</SelectItem>
                  <SelectItem value="ciencias">Ciencias</SelectItem>
                  <SelectItem value="historia">Historia</SelectItem>
                  <SelectItem value="programacion">Programación</SelectItem>
                  <SelectItem value="arte">Arte</SelectItem>
                  <SelectItem value="musica">Música</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lesson-grade">Grado</Label>
              <Select
                value={lesson.grade}
                onValueChange={(v) => setLesson((prev) => ({ ...prev, grade: v }))}
              >
                <SelectTrigger id="lesson-grade" className="mt-1">
                  <SelectValue placeholder="Selecciona grado" />
                </SelectTrigger>
                <SelectContent>
                  {['Kindergarten', '1ro', '2do', '3ro', '4to', '5to', '6to'].map((g) => (
                    <SelectItem key={g} value={g.toLowerCase()}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lesson-module">Módulo</Label>
              {/* TODO: Fetch modules from backend: GET /api/modules?subject=X&grade=Y */}
              <Select
                value={lesson.module}
                onValueChange={(v) => setLesson((prev) => ({ ...prev, module: v }))}
              >
                <SelectTrigger id="lesson-module" className="mt-1">
                  <SelectValue placeholder="Selecciona módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mod1">Módulo 1</SelectItem>
                  <SelectItem value="mod2">Módulo 2</SelectItem>
                  <SelectItem value="mod3">Módulo 3</SelectItem>
                  <SelectItem value="mod4">Módulo 4</SelectItem>
                  <SelectItem value="mod5">Módulo 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contenido de la Lección</CardTitle>
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('heading')}
              title="Agregar encabezado"
            >
              <Heading1 className="h-4 w-4 mr-1" />
              H
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('paragraph')}
              title="Agregar párrafo"
            >
              <AlignLeft className="h-4 w-4 mr-1" />
              Párrafo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('list')}
              title="Agregar lista"
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('ordered-list')}
              title="Agregar lista numerada"
            >
              <ListOrdered className="h-4 w-4 mr-1" />
              Numerada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('image')}
              title="Agregar imagen"
            >
              <Image className="h-4 w-4 mr-1" />
              Imagen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('divider')}
              title="Agregar separador"
            >
              <Separator className="h-4 w-4 mr-1" />
              ---
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.sections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">Aún no hay contenido</p>
              <p className="text-sm mt-1">
                Usa los botones de arriba para agregar secciones a tu lección
              </p>
            </div>
          )}

          {lesson.sections.map((section, index) => (
            <div
              key={section.id}
              className={`border rounded-lg transition-all ${activeSectionId === section.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
                }`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  {getSectionIcon(section.type)}
                  <span className="text-sm font-medium capitalize">
                    {section.type === 'ordered-list' ? 'Lista Numerada' : section.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === lesson.sections.length - 1}
                    title="Mover abajo"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeSection(section.id)}
                    title="Eliminar sección"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-4">
                {section.type === 'heading' && (
                  <Input
                    placeholder="Escribe el encabezado..."
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    onFocus={() => setActiveSectionId(section.id)}
                    data-section-id={section.id}
                    className="text-xl font-bold"
                  />
                )}

                {section.type === 'paragraph' && (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-md border flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('**', '**')}
                        title="Negrita"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('*', '*')}
                        title="Itálica"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('_', '_')}
                        title="Subrayado"
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('`', '`')}
                        title="Código"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('[', '](url)')}
                        title="Enlace"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('> ')}
                        title="Cita"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => insertAtCursor('---\n')}
                        title="Separador"
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Escribe el contenido del párrafo...\n\nSoporta markdown: **negrita**, *itálica*, `código`, [enlace](url)"
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      onFocus={() => setActiveSectionId(section.id)}
                      onBlur={() => setActiveSectionId(null)}
                      data-section-id={section.id}
                      className="min-h-[120px] font-mono text-sm"
                    />
                  </div>
                )}

                {(section.type === 'list' || section.type === 'ordered-list') && (
                  <div className="space-y-2">
                    {section.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <span className="text-muted-foreground w-6 text-right text-sm">
                          {section.type === 'list' ? '-' : `${itemIndex + 1}.`}
                        </span>
                        <Input
                          placeholder={`Elemento ${itemIndex + 1}`}
                          value={item}
                          onChange={(e) => {
                            const newItems = [...(section.items || [])]
                            newItems[itemIndex] = e.target.value
                            updateSection(section.id, { items: newItems })
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => {
                            const newItems = (section.items || []).filter(
                              (_, i) => i !== itemIndex
                            )
                            updateSection(section.id, { items: newItems.length > 0 ? newItems : [''] })
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newItems = [...(section.items || []), '']
                        updateSection(section.id, { items: newItems })
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Agregar elemento
                    </Button>
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <Label>URL de la Imagen</Label>
                      <Input
                        placeholder="https://ejemplo.com/imagen.jpg o pega la URL"
                        value={section.imageUrl || ''}
                        onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Texto Alternativo</Label>
                      <Input
                        placeholder="Descripción de la imagen"
                        value={section.imageAlt || ''}
                        onChange={(e) => updateSection(section.id, { imageAlt: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    {/* TODO: Add image upload to backend: POST /api/lessons/:id/images */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Subir desde dispositivo
                      </Button>
                      {section.imageUrl && (
                        <img
                          src={section.imageUrl}
                          alt={section.imageAlt || ''}
                          className="max-h-40 rounded-md border object-contain mt-2"
                        />
                      )}
                    </div>
                  </div>
                )}

                {section.type === 'divider' && (
                  <div className="py-4">
                    <Separator />
                    <p className="text-xs text-muted-foreground text-center mt-2">Separador</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Estudiante
            </CardTitle>
            <Badge
              variant={lesson.status === 'published' ? 'default' : 'secondary'}
              className={
                lesson.status === 'published'
                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                  : ''
              }
            >
              {lesson.status === 'published' ? 'Publicado' : 'Borrador'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lesson Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{lesson.title || 'Sin título'}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {lesson.subject && (
                <Badge variant="outline">{lesson.subject}</Badge>
              )}
              {lesson.grade && (
                <Badge variant="outline">{lesson.grade}</Badge>
              )}
              {lesson.module && (
                <Badge variant="outline">{lesson.module}</Badge>
              )}
            </div>
            {lesson.description && (
              <p className="mt-3 text-muted-foreground">{lesson.description}</p>
            )}
          </div>

          <Separator className="my-6" />

          {/* Sections Preview */}
          {lesson.sections.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No hay contenido en esta lección aún.
            </p>
          )}

          {lesson.sections.map((section) => (
            <div key={section.id} className="mb-4">
              {section.type === 'heading' && (
                <h2 className="text-2xl font-semibold mt-6 mb-3">{section.content || 'Encabezado'}</h2>
              )}

              {section.type === 'paragraph' && (
                <MarkdownPreview content={section.content || ''} />
              )}

              {section.type === 'list' && (
                <ul className="list-disc ml-6 space-y-1">
                  {section.items
                    ?.filter((item) => item.trim())
                    .map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                </ul>
              )}

              {section.type === 'ordered-list' && (
                <ol className="list-decimal ml-6 space-y-1">
                  {section.items
                    ?.filter((item) => item.trim())
                    .map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                </ol>
              )}

              {section.type === 'image' && section.imageUrl && (
                <div className="my-4">
                  <img
                    src={section.imageUrl}
                    alt={section.imageAlt || ''}
                    className="max-w-full rounded-lg border"
                  />
                  {section.imageAlt && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      {section.imageAlt}
                    </p>
                  )}
                </div>
              )}

              {section.type === 'divider' && <Separator className="my-6" />}
            </div>
          ))}

          {/* Activities Preview */}
          {lesson.activities.length > 0 && (
            <>
              <Separator className="my-8" />
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Actividades
              </h3>
              <div className="space-y-3">
                {lesson.activities.map((activity) => {
                  const badge = getActivityBadge(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={badge.color}>{badge.label}</Badge>
                        <span className="font-medium">{activity.title}</span>
                        {activity.points && (
                          <span className="text-sm text-muted-foreground ml-auto">
                            {activity.points} puntos
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      {activity.dueDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Fecha límite: {activity.dueDate}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Attachments Preview */}
          {lesson.attachments.length > 0 && (
            <>
              <Separator className="my-8" />
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Materiales Adjuntos
              </h3>
              <div className="space-y-2">
                {lesson.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {getAttachmentIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{attachment.size}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderActivitiesTab = () => (
    <div className="space-y-6">
      {/* Add Activity Buttons */}
      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Agregar Prueba
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Prueba</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Título</Label>
                <Input placeholder="Ej: Prueba de fracciones" />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea placeholder="Instrucciones de la prueba..." rows={3} />
              </div>
              <div>
                <Label>Puntos</Label>
                <Input type="number" defaultValue={100} />
              </div>
              {/* TODO: Connect to quiz builder: POST /api/activities/quiz */}
              <Button className="w-full">Crear Prueba</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Agregar Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Título</Label>
                <Input placeholder="Ej: Ejercicios de práctica" />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea placeholder="Instrucciones de la tarea..." rows={3} />
              </div>
              <div>
                <Label>Puntos</Label>
                <Input type="number" defaultValue={100} />
              </div>
              <div>
                <Label>Fecha Límite</Label>
                <Input type="date" />
              </div>
              {/* TODO: Connect to assignment API: POST /api/activities/assignment */}
              <Button className="w-full">Crear Tarea</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Agregar Discusión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Discusión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Título</Label>
                <Input placeholder="Ej: Debate sobre el tema" />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea placeholder="Pregunta o tema de discusión..." rows={3} />
              </div>
              {/* TODO: Connect to discussion API: POST /api/activities/discussion */}
              <Button className="w-full">Crear Discusión</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Add (inline) */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Agregar rápido:</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          onClick={() => addActivity('quiz')}
        >
          <ListChecks className="h-4 w-4 mr-1" />
          Prueba
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => addActivity('assignment')}
        >
          <FileText className="h-4 w-4 mr-1" />
          Tarea
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => addActivity('discussion')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Discusión
        </Button>
      </div>

      {/* Activities List */}
      {lesson.activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No hay actividades aún</p>
            <p className="text-sm mt-1">
              Agrega pruebas, tareas o discusiones a tu lección
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {lesson.activities.map((activity, index) => {
          const badge = getActivityBadge(activity.type)
          return (
            <Card key={activity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm font-mono">
                      #{index + 1}
                    </span>
                    <Badge className={badge.color}>{badge.label}</Badge>
                    <Input
                      value={activity.title}
                      onChange={(e) =>
                        updateActivity(activity.id, { title: e.target.value })
                      }
                      className="font-semibold text-base border-none focus-visible:ring-0 p-0 h-auto bg-transparent w-auto max-w-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => {
                        // TODO: Add activity reordering: PATCH /api/activities/reorder
                        console.log('Reorder activity:', activity.id)
                      }}
                      title="Reordenar"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeActivity(activity.id)}
                      title="Eliminar actividad"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Descripción de la actividad..."
                  value={activity.description}
                  onChange={(e) =>
                    updateActivity(activity.id, { description: e.target.value })
                  }
                  rows={3}
                />
                <div className="flex items-center gap-4">
                  {(activity.type === 'quiz' || activity.type === 'assignment') && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Puntos:</Label>
                      <Input
                        type="number"
                        value={activity.points || 0}
                        onChange={(e) =>
                          updateActivity(activity.id, {
                            points: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 h-8"
                      />
                    </div>
                  )}
                  {activity.type === 'assignment' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Fecha límite:</Label>
                      <Input
                        type="date"
                        value={activity.dueDate || ''}
                        onChange={(e) =>
                          updateActivity(activity.id, { dueDate: e.target.value })
                        }
                        className="w-40 h-8"
                      />
                    </div>
                  )}
                </div>
                {/* TODO: Add activity-specific editors */}
                {/* Quiz: question builder with multiple choice, true/false, etc. */}
                {/* Assignment: file upload requirements, rubric builder */}
                {/* Discussion: prompt, guidelines, participation requirements */}
                {activity.type === 'quiz' && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: Integrate quiz question builder component */}
                      Haz clic para configurar las preguntas de la prueba.
                      Se abrirá el editor de preguntas.
                    </p>
                  </div>
                )}
                {activity.type === 'assignment' && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: Integrate assignment file upload and rubric builder */}
                      Configura los requisitos de entrega y la rúbrica de evaluación.
                    </p>
                  </div>
                )}
                {activity.type === 'discussion' && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: Integrate discussion settings component */}
                      Define las pautas de participación y el formato de discusión.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderAttachmentsTab = () => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      Array.from(files).forEach((file) => {
        addAttachment(file)
        // TODO: Upload file to backend: POST /api/lessons/:id/attachments
        // const formData = new FormData()
        // formData.append('file', file)
        // await api.post(`/api/lessons/${lesson.id}/attachments`, formData, {
        //   headers: { 'Content-Type': 'multipart/form-data' }
        // })
      })
    }

    return (
      <div className="space-y-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Archivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Haz clic para subir</span> o arrastra archivos aquí
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, videos, documentos, imágenes (máx. 50MB por archivo)
              </p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.mp4,.mp3,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
              />
            </label>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Agregar desde:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open file picker for PDFs
              const input = document.getElementById('file-upload') as HTMLInputElement
              input?.click()
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open file picker for videos
              const input = document.getElementById('file-upload') as HTMLInputElement
              input?.click()
            }}
          >
            <Video className="h-4 w-4 mr-1" />
            Video
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open file picker for documents
              const input = document.getElementById('file-upload') as HTMLInputElement
              input?.click()
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            Documento
          </Button>
        </div>

        {/* Files List */}
        {lesson.attachments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No hay archivos adjuntos</p>
              <p className="text-sm mt-1">
                Sube PDFs, videos, documentos o imágenes para tu lección
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {lesson.attachments.map((attachment) => (
            <Card key={attachment.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {getAttachmentIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {attachment.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{attachment.size}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    {/* TODO: Implement download: GET /api/attachments/:id/download */}
                    Descargar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeAttachment(attachment.id)}
                    title="Eliminar archivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // --- Main Render ---
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7" />
            Editor de Lección
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea y edita el contenido de tu lección
          </p>
        </div>

        {/* Save / Publish Actions */}
        <div className="flex items-center gap-3">
          <Badge
            variant={lesson.status === 'published' ? 'default' : 'secondary'}
            className={
              lesson.status === 'published'
                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                : ''
            }
          >
            {lesson.status === 'published' ? 'Publicado' : 'Borrador'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar Borrador
          </Button>
          <Button
            onClick={() => handleSave('published')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="editar">Editar</TabsTrigger>
          <TabsTrigger value="vista-previa">Vista Previa</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>

        <TabsContent value="editar" className="mt-6">
          {renderEditTab()}
        </TabsContent>

        <TabsContent value="vista-previa" className="mt-6">
          {renderPreviewTab()}
        </TabsContent>

        <TabsContent value="actividades" className="mt-6">
          {renderActivitiesTab()}
        </TabsContent>

        <TabsContent value="adjuntos" className="mt-6">
          {renderAttachmentsTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

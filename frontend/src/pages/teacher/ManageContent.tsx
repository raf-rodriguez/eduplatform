import { useState } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface Lesson {
  id: number
  title: string
  subject: string
  grade: string
  status: 'published' | 'draft'
  description?: string
}

const initialLessons: Lesson[] = [
  { id: 1, title: 'Multiplicación de fracciones', subject: 'Matemáticas', grade: '3ro', status: 'published', description: 'Aprende a multiplicar fracciones paso a paso' },
  { id: 2, title: 'Historia de Puerto Rico', subject: 'Historia', grade: '4to', status: 'published', description: 'Explora la rica historia de Puerto Rico' },
  { id: 3, title: 'Introducción a la programación', subject: 'Programación', grade: '5to', status: 'draft', description: 'Conceptos básicos de programación' },
  { id: 4, title: 'El sistema solar', subject: 'Ciencias', grade: '3ro', status: 'published', description: 'Conoce los planetas y estrellas del sistema solar' },
]

const subjects = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Programación', 'Inglés', 'Educación Física', 'Arte']
const grades = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo', '11mo', '12mo']

export default function ManageContent() {
  const { toast } = useToast()
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [searchQuery, setSearchQuery] = useState('')

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Edit dialog state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Delete dialog state
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

  // Form state for create
  const [createForm, setCreateForm] = useState({
    title: '',
    subject: '',
    grade: '',
    description: '',
  })

  // Form state for edit
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    grade: '',
    description: '',
    status: 'draft' as 'published' | 'draft',
  })

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateLesson = () => {
    if (!createForm.title || !createForm.subject || !createForm.grade) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      })
      return
    }

    const newLesson: Lesson = {
      id: Math.max(...lessons.map(l => l.id), 0) + 1,
      title: createForm.title,
      subject: createForm.subject,
      grade: createForm.grade,
      status: 'draft',
      description: createForm.description,
    }

    setLessons([...lessons, newLesson])
    setCreateForm({ title: '', subject: '', grade: '', description: '' })
    setIsCreateDialogOpen(false)

    toast({
      title: 'Éxito',
      description: `Lección "${newLesson.title}" creada correctamente`,
    })
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setEditForm({
      title: lesson.title,
      subject: lesson.subject,
      grade: lesson.grade,
      description: lesson.description || '',
      status: lesson.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditLesson = () => {
    if (!editingLesson) return

    if (!editForm.title || !editForm.subject || !editForm.grade) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      })
      return
    }

    setLessons(lessons.map(l =>
      l.id === editingLesson.id
        ? { ...l, ...editForm }
        : l
    ))

    setIsEditDialogOpen(false)
    setEditingLesson(null)

    toast({
      title: 'Éxito',
      description: `Lección "${editForm.title}" actualizada correctamente`,
    })
  }

  const openDeleteDialog = (lesson: Lesson) => {
    setDeletingLesson(lesson)
  }

  const handleDeleteLesson = () => {
    if (!deletingLesson) return

    setLessons(lessons.filter(l => l.id !== deletingLesson.id))

    toast({
      title: 'Eliminado',
      description: `Lección "${deletingLesson.title}" eliminada correctamente`,
    })

    setDeletingLesson(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestionar Contenido</h1>
          <p className="text-muted-foreground">Crea y edita lecciones</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Lección
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lecciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            {lessons.length} lecciones en total • {lessons.filter(l => l.status === 'published').length} publicadas • {lessons.filter(l => l.status === 'draft').length} borradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron lecciones</h3>
              <p className="text-muted-foreground">Intenta con otra búsqueda o crea una nueva lección</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lesson.subject} • {lesson.grade}
                    </p>
                    {lesson.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${lesson.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                    >
                      {lesson.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(lesson)}
                      title="Editar lección"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(lesson)}
                      title="Eliminar lección"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Lesson Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Lección</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva lección
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-title">Título *</Label>
              <Input
                id="create-title"
                placeholder="Título de la lección"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-desc">Descripción</Label>
              <Textarea
                id="create-desc"
                placeholder="Descripción de la lección (opcional)"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-subject">Materia *</Label>
                <select
                  id="create-subject"
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <option value="">Selecciona materia</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="create-grade">Grado *</Label>
                <select
                  id="create-grade"
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={createForm.grade}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, grade: e.target.value }))}
                >
                  <option value="">Selecciona grado</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLesson}>Crear Lección</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lección</DialogTitle>
            <DialogDescription>
              Modifica la información de la lección
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Descripción</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subject">Materia *</Label>
                <select
                  id="edit-subject"
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={editForm.subject}
                  onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <option value="">Selecciona materia</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-grade">Grado *</Label>
                <select
                  id="edit-grade"
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={editForm.grade}
                  onChange={(e) => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                >
                  <option value="">Selecciona grado</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Estado</Label>
              <select
                id="edit-status"
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleEditLesson}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLesson} onOpenChange={(open) => !open && setDeletingLesson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la lección <strong>"{deletingLesson?.title}"</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, BookOpen, Layers, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

// ============================================
// Simulated Data
// ============================================

interface Grade {
  id: number
  name: string
  level: number
  subjects: number
}

interface Subject {
  id: number
  name: string
  code: string
  lessons: number
  grade: string
}

interface Lesson {
  id: number
  title: string
  subject: string
  grade: string
  status: 'published' | 'draft'
}

const initialGrades: Grade[] = [
  { id: 1, name: 'Pre-Kínder', level: 0, subjects: 5 },
  { id: 2, name: 'Kínder', level: 1, subjects: 5 },
  { id: 3, name: '1er Grado', level: 2, subjects: 6 },
  { id: 4, name: '2do Grado', level: 3, subjects: 6 },
  { id: 5, name: '3er Grado', level: 4, subjects: 6 },
  { id: 6, name: '4to Grado', level: 5, subjects: 6 },
  { id: 7, name: '5to Grado', level: 6, subjects: 6 },
  { id: 8, name: '6to Grado', level: 7, subjects: 9 },
  { id: 9, name: '7mo Grado', level: 8, subjects: 9 },
  { id: 10, name: '8vo Grado', level: 9, subjects: 9 },
  { id: 11, name: '9no Grado', level: 10, subjects: 9 },
  { id: 12, name: '10mo Grado', level: 11, subjects: 9 },
  { id: 13, name: '11vo Grado', level: 12, subjects: 9 },
  { id: 14, name: '12vo Grado', level: 13, subjects: 9 },
]

const initialSubjects: Subject[] = [
  { id: 1, name: 'Español', code: 'ESP', lessons: 45, grade: '1er Grado' },
  { id: 2, name: 'Matemáticas', code: 'MAT', lessons: 50, grade: '1er Grado' },
  { id: 3, name: 'Ciencia', code: 'CIE', lessons: 35, grade: '1er Grado' },
  { id: 4, name: 'Historia', code: 'HIS', lessons: 30, grade: '1er Grado' },
  { id: 5, name: 'Inglés', code: 'ING', lessons: 40, grade: '1er Grado' },
  { id: 6, name: 'Inglés Conversacional', code: 'INC', lessons: 25, grade: '1er Grado' },
]

const initialLessons: Lesson[] = [
  { id: 1, title: 'Multiplicación de fracciones', subject: 'Matemáticas', grade: '3er Grado', status: 'published' },
  { id: 2, title: 'Historia de Puerto Rico', subject: 'Historia', grade: '4to Grado', status: 'published' },
  { id: 3, title: 'Introducción a la programación', subject: 'Robótica', grade: '7mo Grado', status: 'draft' },
]

// ============================================
// Component
// ============================================

export default function ContentManagement() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // State
  const [grades, setGrades] = useState<Grade[]>(initialGrades)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Grade | Subject | Lesson | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null)

  // Form state
  const [gradeForm, setGradeForm] = useState({ name: '', level: 0, description: '' })
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', gradeId: '', description: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', subject: '', grade: '', content: '', status: 'draft' as 'published' | 'draft' })

  // ============================================
  // Handlers - Grades
  // ============================================

  const openCreateGrade = () => {
    setEditingItem(null)
    setGradeForm({ name: '', level: grades.length, description: '' })
    setGradeDialogOpen(true)
  }

  const openEditGrade = (grade: Grade) => {
    setEditingItem(grade)
    setGradeForm({ name: grade.name, level: grade.level, description: '' })
    setGradeDialogOpen(true)
  }

  const handleSaveGrade = () => {
    if (!gradeForm.name.trim()) {
      toast({ title: 'Error', description: 'El nombre del grado es requerido', variant: 'destructive' })
      return
    }

    if (editingItem) {
      // Update
      setGrades((prev) => prev.map((g) => (g.id === (editingItem as Grade).id ? { ...g, name: gradeForm.name } : g)))
      toast({ title: 'Grado actualizado', description: `"${gradeForm.name}" ha sido actualizado.` })
    } else {
      // Create
      const newGrade: Grade = {
        id: Math.max(0, ...grades.map((g) => g.id)) + 1,
        name: gradeForm.name,
        level: gradeForm.level,
        subjects: 0,
      }
      setGrades((prev) => [...prev, newGrade])
      toast({ title: 'Grado creado', description: `"${gradeForm.name}" ha sido creado.` })
    }
    setGradeDialogOpen(false)
  }

  // ============================================
  // Handlers - Subjects
  // ============================================

  const openCreateSubject = () => {
    setEditingItem(null)
    setSubjectForm({ name: '', code: '', gradeId: '', description: '' })
    setSubjectDialogOpen(true)
  }

  const openEditSubject = (subject: Subject) => {
    setEditingItem(subject)
    setSubjectForm({ name: subject.name, code: subject.code, gradeId: '', description: '' })
    setSubjectDialogOpen(true)
  }

  const handleSaveSubject = () => {
    if (!subjectForm.name.trim()) {
      toast({ title: 'Error', description: 'El nombre de la materia es requerido', variant: 'destructive' })
      return
    }

    if (editingItem) {
      setSubjects((prev) => prev.map((s) => (s.id === (editingItem as Subject).id ? { ...s, name: subjectForm.name, code: subjectForm.code } : s)))
      toast({ title: 'Materia actualizada', description: `"${subjectForm.name}" ha sido actualizada.` })
    } else {
      const newSubject: Subject = {
        id: Math.max(0, ...subjects.map((s) => s.id)) + 1,
        name: subjectForm.name,
        code: subjectForm.code || subjectForm.name.substring(0, 3).toUpperCase(),
        lessons: 0,
        grade: subjectForm.gradeId || 'General',
      }
      setSubjects((prev) => [...prev, newSubject])
      toast({ title: 'Materia creada', description: `"${subjectForm.name}" ha sido creada.` })
    }
    setSubjectDialogOpen(false)
  }

  // ============================================
  // Handlers - Lessons
  // ============================================

  const openCreateLesson = () => {
    setEditingItem(null)
    setLessonForm({ title: '', subject: '', grade: '', content: '', status: 'draft' })
    setLessonDialogOpen(true)
  }

  const openEditLesson = (lesson: Lesson) => {
    setEditingItem(lesson)
    setLessonForm({ title: lesson.title, subject: lesson.subject, grade: lesson.grade, content: '', status: lesson.status })
    setLessonDialogOpen(true)
  }

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      toast({ title: 'Error', description: 'El título de la lección es requerido', variant: 'destructive' })
      return
    }

    if (editingItem) {
      setLessons((prev) => prev.map((l) => (l.id === (editingItem as Lesson).id ? { ...l, ...lessonForm } : l)))
      toast({ title: 'Lección actualizada', description: `"${lessonForm.title}" ha sido actualizada.` })
    } else {
      const newLesson: Lesson = {
        id: Math.max(0, ...lessons.map((l) => l.id)) + 1,
        ...lessonForm,
      }
      setLessons((prev) => [...prev, newLesson])
      toast({ title: 'Lección creada', description: `"${lessonForm.title}" ha sido creada.` })
    }
    setLessonDialogOpen(false)
  }

  // ============================================
  // Handlers - Delete
  // ============================================

  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'grade') {
      setGrades((prev) => prev.filter((g) => g.id !== deleteTarget.id))
    } else if (deleteTarget.type === 'subject') {
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    } else if (deleteTarget.type === 'lesson') {
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    }

    toast({ title: 'Eliminado', description: `"${deleteTarget.name}" ha sido eliminado.` })
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  // ============================================
  // Filtered data
  // ============================================

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLessons = lessons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Contenido</h1>
          <p className="text-muted-foreground">Administra grados, materias y lecciones</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades">Grados</TabsTrigger>
          <TabsTrigger value="subjects">Materias</TabsTrigger>
          <TabsTrigger value="lessons">Lecciones</TabsTrigger>
        </TabsList>

        {/* ==================== GRADES TAB ==================== */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar grados..." className="pl-10" />
                </div>
                <Button onClick={openCreateGrade}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Grado
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {grades.map((grade) => (
                  <Card key={grade.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <GraduationCap className="h-8 w-8 text-primary mb-3" />
                          <h3 className="font-semibold text-lg">{grade.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Nivel {grade.level} • {grade.subjects} materias
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditGrade(grade)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleteTarget({ type: 'grade', id: grade.id, name: grade.name }); setDeleteDialogOpen(true) }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SUBJECTS TAB ==================== */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar materias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={openCreateSubject}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Materia
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSubjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <BookOpen className="h-8 w-8 text-primary mb-3" />
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.code} • {subject.lessons} lecciones • {subject.grade}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditSubject(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleteTarget({ type: 'subject', id: subject.id, name: subject.name }); setDeleteDialogOpen(true) }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LESSONS TAB ==================== */}
        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar lecciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={openCreateLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Lección
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.subject} • {lesson.grade}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                        {lesson.status === 'published' ? 'Publicado' : 'Borrador'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setDeleteTarget({ type: 'lesson', id: lesson.id, name: lesson.title }); setDeleteDialogOpen(true) }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== CREATE/EDIT GRADE DIALOG ==================== */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Grado' : 'Crear Grado'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Actualiza la información del grado.' : 'Agrega un nuevo grado académico al sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="grade-name">Nombre</Label>
              <Input
                id="grade-name"
                value={gradeForm.name}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: 1er Grado"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade-level">Nivel</Label>
              <Input
                id="grade-level"
                type="number"
                value={gradeForm.level}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                min={0}
                max={13}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGrade}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== CREATE/EDIT SUBJECT DIALOG ==================== */}
      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Materia' : 'Crear Materia'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Actualiza la información de la materia.' : 'Agrega una nueva materia al sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject-name">Nombre</Label>
              <Input
                id="subject-name"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Matemáticas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-code">Código</Label>
              <Input
                id="subject-code"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="Ej: MAT"
                maxLength={5}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-grade">Grado</Label>
              <Select value={subjectForm.gradeId} onValueChange={(v) => setSubjectForm((prev) => ({ ...prev, gradeId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.name}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubject}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== CREATE/EDIT LESSON DIALOG ==================== */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Lección' : 'Crear Lección'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Actualiza la información de la lección.' : 'Agrega una nueva lección al sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Título</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Multiplicación de fracciones"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lesson-subject">Materia</Label>
                <Input
                  id="lesson-subject"
                  value={lessonForm.subject}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ej: Matemáticas"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lesson-grade">Grado</Label>
                <Input
                  id="lesson-grade"
                  value={lessonForm.grade}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, grade: e.target.value }))}
                  placeholder="Ej: 3er Grado"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-content">Contenido</Label>
              <Textarea
                id="lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Describe el contenido de la lección..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-status">Estado</Label>
              <Select value={lessonForm.status} onValueChange={(v: 'published' | 'draft') => setLessonForm((prev) => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{deleteTarget?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

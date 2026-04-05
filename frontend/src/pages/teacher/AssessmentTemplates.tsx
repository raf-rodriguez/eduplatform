import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Plus, Copy, Edit, Trash, Clock, CheckCircle, BookOpen,
  Search, AlertCircle, Info, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuestionTypeConfig {
  multipleChoice: number
  trueFalse: number
  shortAnswer: number
  openEnded: number
}

interface Template {
  id: string
  name: string
  description: string
  timeLimit: number // in minutes
  passingScore: number // percentage
  questionCounts: QuestionTypeConfig
  isDefault: boolean
  usageCount: number
  category: 'quiz' | 'exam' | 'practice' | 'diagnostic'
  createdAt: string
}

// ─── Simulated Data ─────────────────────────────────────────────────────────

// TODO: Fetch from API /api/assessment-templates
const defaultTemplates: Template[] = [
  {
    id: 'tmpl-1',
    name: 'Quiz Rápido',
    description: 'Evaluación corta para verificar comprensión inmediata de un tema reciente. Ideal para revisiones al final de clase.',
    timeLimit: 15,
    passingScore: 60,
    questionCounts: {
      multipleChoice: 5,
      trueFalse: 3,
      shortAnswer: 2,
      openEnded: 0,
    },
    isDefault: true,
    usageCount: 47,
    category: 'quiz',
    createdAt: '2025-01-15',
  },
  {
    id: 'tmpl-2',
    name: 'Examen Parcial',
    description: 'Evaluación de mitad de período que cubre múltiples unidades. Incluye variedad de tipos de preguntas para medir profundidad.',
    timeLimit: 60,
    passingScore: 70,
    questionCounts: {
      multipleChoice: 10,
      trueFalse: 5,
      shortAnswer: 5,
      openEnded: 3,
    },
    isDefault: true,
    usageCount: 28,
    category: 'exam',
    createdAt: '2025-01-15',
  },
  {
    id: 'tmpl-3',
    name: 'Examen Final',
    description: 'Evaluación integral que cubre todo el contenido del curso. Diseñada para medir el aprendizaje acumulado.',
    timeLimit: 90,
    passingScore: 70,
    questionCounts: {
      multipleChoice: 15,
      trueFalse: 10,
      shortAnswer: 8,
      openEnded: 5,
    },
    isDefault: true,
    usageCount: 15,
    category: 'exam',
    createdAt: '2025-01-15',
  },
  {
    id: 'tmpl-4',
    name: 'Práctica',
    description: 'Ejercicio sin calificación para que los estudiantes practiquen y se preparen para evaluaciones formales.',
    timeLimit: 30,
    passingScore: 0,
    questionCounts: {
      multipleChoice: 8,
      trueFalse: 4,
      shortAnswer: 3,
      openEnded: 2,
    },
    isDefault: true,
    usageCount: 63,
    category: 'practice',
    createdAt: '2025-01-15',
  },
  {
    id: 'tmpl-5',
    name: 'Diagnóstico',
    description: 'Evaluación inicial para medir conocimientos previos antes de iniciar un nuevo tema o unidad.',
    timeLimit: 20,
    passingScore: 0,
    questionCounts: {
      multipleChoice: 8,
      trueFalse: 5,
      shortAnswer: 2,
      openEnded: 0,
    },
    isDefault: true,
    usageCount: 35,
    category: 'diagnostic',
    createdAt: '2025-01-15',
  },
]

// TODO: Fetch custom templates from /api/assessment-templates/custom
const initialCustomTemplates: Template[] = [
  {
    id: 'custom-1',
    name: 'Evaluación de Lectura',
    description: 'Plantilla para evaluar comprensión lectora con énfasis en análisis de textos.',
    timeLimit: 45,
    passingScore: 75,
    questionCounts: {
      multipleChoice: 6,
      trueFalse: 2,
      shortAnswer: 4,
      openEnded: 3,
    },
    isDefault: false,
    usageCount: 8,
    category: 'exam',
    createdAt: '2025-03-10',
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const getCategoryColor = (category: Template['category']): string => {
  const colors: Record<Template['category'], string> = {
    quiz: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    exam: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    practice: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    diagnostic: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  }
  return colors[category]
}

const getCategoryLabel = (category: Template['category']): string => {
  const labels: Record<Template['category'], string> = {
    quiz: 'Quiz',
    exam: 'Examen',
    practice: 'Práctica',
    diagnostic: 'Diagnóstico',
  }
  return labels[category]
}

const totalQuestions = (qc: QuestionTypeConfig): number =>
  qc.multipleChoice + qc.trueFalse + qc.shortAnswer + qc.openEnded

// ─── Component ──────────────────────────────────────────────────────────────

export default function AssessmentTemplates() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [templates, setTemplates] = useState<Template[]>([
    ...defaultTemplates,
    ...initialCustomTemplates,
  ])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('plantillas')

  // Form state
  const emptyForm: Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'isDefault'> = {
    name: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questionCounts: {
      multipleChoice: 5,
      trueFalse: 2,
      shortAnswer: 2,
      openEnded: 1,
    },
    category: 'quiz',
  }
  const [form, setForm] = useState(emptyForm)

  // ── Dialog handlers ──

  const openCreateDialog = () => {
    setEditingTemplate(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (tmpl: Template) => {
    setEditingTemplate(tmpl)
    setForm({
      name: tmpl.name,
      description: tmpl.description,
      timeLimit: tmpl.timeLimit,
      passingScore: tmpl.passingScore,
      questionCounts: { ...tmpl.questionCounts },
      category: tmpl.category,
    })
    setDialogOpen(true)
  }

  const saveTemplate = () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio.', variant: 'destructive' })
      return
    }

    if (editingTemplate) {
      // TODO: PUT /api/assessment-templates/:id
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
              ...t,
              ...form,
            }
            : t
        )
      )
      toast({ title: 'Plantilla actualizada', description: `"${form.name}" se actualizó correctamente.` })
    } else {
      const newTmpl: Template = {
        ...form,
        id: `custom-${Date.now()}`,
        usageCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString().split('T')[0],
      }
      // TODO: POST /api/assessment-templates
      setTemplates((prev) => [...prev, newTmpl])
      toast({ title: 'Plantilla creada', description: `"${form.name}" se creó correctamente.` })
    }

    setDialogOpen(false)
  }

  const duplicateTemplate = (tmpl: Template) => {
    const dup: Template = {
      ...tmpl,
      id: `custom-${Date.now()}`,
      name: `${tmpl.name} (copia)`,
      isDefault: false,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    // TODO: POST /api/assessment-templates/duplicate
    setTemplates((prev) => [...prev, dup])
    toast({ title: 'Plantilla duplicada', description: `"${dup.name}" se creó correctamente.` })
  }

  const deleteTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id)
    // TODO: DELETE /api/assessment-templates/:id
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    setConfirmDeleteId(null)
    toast({ title: 'Plantilla eliminada', description: `"${tmpl?.name}" se eliminó correctamente.` })
  }

  const useTemplate = (tmpl: Template) => {
    // TODO: Track usage count POST /api/assessments/from-template
    setTemplates((prev) =>
      prev.map((t) => (t.id === tmpl.id ? { ...t, usageCount: t.usageCount + 1 } : t))
    )
    navigate('/teacher/assessment/create', { state: { templateId: tmpl.id, template: tmpl } })
    toast({ title: 'Usando plantilla', description: `Creando evaluación desde "${tmpl.name}".` })
  }

  // ── Filtering ──

  const defaultList = templates.filter(
    (t) =>
      t.isDefault &&
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const customList = templates.filter(
    (t) =>
      !t.isDefault &&
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const allList = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ── Form field update helpers ──

  const updateQuestionCount = (type: keyof QuestionTypeConfig, value: string) => {
    const num = Math.max(0, parseInt(value) || 0)
    setForm((prev) => ({
      ...prev,
      questionCounts: { ...prev.questionCounts, [type]: num },
    }))
  }

  // ── Template Card ──

  const TemplateCard = ({ tmpl }: { tmpl: Template }) => (
    <Card className="flex flex-col transition-all hover:shadow-lg border-2 hover:border-primary/50">
      {/* accent bar */}
      <div
        className={`h-1.5 rounded-t-lg ${tmpl.category === 'quiz'
            ? 'bg-blue-500'
            : tmpl.category === 'exam'
              ? 'bg-red-500'
              : tmpl.category === 'practice'
                ? 'bg-green-500'
                : 'bg-yellow-500'
          }`}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{tmpl.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={getCategoryColor(tmpl.category)}>
                {getCategoryLabel(tmpl.category)}
              </Badge>
              {tmpl.isDefault && (
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="mr-1 h-3 w-3" />
                  Predeterminada
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Copy className="h-3 w-3" />
              <span>Usada {tmpl.usageCount}x</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tmpl.description}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>{tmpl.timeLimit} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <span>Aprob. {tmpl.passingScore}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span>{totalQuestions(tmpl.questionCounts)} preg.</span>
          </div>
        </div>

        {/* Question type breakdown */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tmpl.questionCounts.multipleChoice > 0 && (
            <Badge variant="outline" className="text-[11px]">
              MC: {tmpl.questionCounts.multipleChoice}
            </Badge>
          )}
          {tmpl.questionCounts.trueFalse > 0 && (
            <Badge variant="outline" className="text-[11px]">
              V/F: {tmpl.questionCounts.trueFalse}
            </Badge>
          )}
          {tmpl.questionCounts.shortAnswer > 0 && (
            <Badge variant="outline" className="text-[11px]">
              Resp. corta: {tmpl.questionCounts.shortAnswer}
            </Badge>
          )}
          {tmpl.questionCounts.openEnded > 0 && (
            <Badge variant="outline" className="text-[11px]">
              Abierta: {tmpl.questionCounts.openEnded}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t">
          <Button size="sm" className="flex-1" onClick={() => useTemplate(tmpl)}>
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Usar
          </Button>
          {!tmpl.isDefault && (
            <>
              <Button size="sm" variant="outline" onClick={() => openEditDialog(tmpl)}>
                <Edit className="mr-1.5 h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => duplicateTemplate(tmpl)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDeleteId(tmpl.id)}
              >
                <Trash className="mr-1.5 h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {tmpl.isDefault && (
            <Button size="sm" variant="outline" onClick={() => duplicateTemplate(tmpl)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Duplicar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // ── Library stats ──

  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0)
  const totalQCount = templates.reduce(
    (sum, t) => sum + totalQuestions(t.questionCounts),
    0
  )

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plantillas de Evaluación</h1>
          <p className="text-muted-foreground">
            Usa plantillas prediseñadas o crea las tuyas propias
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar plantillas..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="crear">Crear Plantilla</TabsTrigger>
          <TabsTrigger value="biblioteca">Mi Biblioteca</TabsTrigger>
        </TabsList>

        {/* ──── TAB: Plantillas ──── */}
        <TabsContent value="plantillas" className="space-y-4">
          {defaultList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>No se encontraron plantillas predeterminadas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {defaultList.map((tmpl) => (
                <TemplateCard key={tmpl.id} tmpl={tmpl} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── TAB: Crear Plantilla ──── */}
        <TabsContent value="crear" className="space-y-4">
          <Card className="border-2 border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Crear Nueva Plantilla
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="ct-name">Nombre</Label>
                <Input
                  id="ct-name"
                  placeholder="Ej: Evaluación de Matemáticas"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="ct-desc">Descripción</Label>
                <Textarea
                  id="ct-desc"
                  placeholder="Describe el propósito de esta plantilla..."
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="ct-category">Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      category: v as Template['category'],
                    }))
                  }
                >
                  <SelectTrigger id="ct-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Examen</SelectItem>
                    <SelectItem value="practice">Práctica</SelectItem>
                    <SelectItem value="diagnostic">Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time & Passing Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ct-time">Tiempo límite (min)</Label>
                  <Input
                    id="ct-time"
                    type="number"
                    min={0}
                    value={form.timeLimit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        timeLimit: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ct-pass">Puntuación mínima (%)</Label>
                  <Input
                    id="ct-pass"
                    type="number"
                    min={0}
                    max={100}
                    value={form.passingScore}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        passingScore: Math.min(100, parseInt(e.target.value) || 0),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Question counts */}
              <div>
                <Label className="mb-2 block">Cantidad de Preguntas por Tipo</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm text-muted-foreground">Opción Múltiple</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.questionCounts.multipleChoice}
                      onChange={(e) => updateQuestionCount('multipleChoice', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-muted-foreground">Verdadero / Falso</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.questionCounts.trueFalse}
                      onChange={(e) => updateQuestionCount('trueFalse', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-muted-foreground">Respuesta Corta</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.questionCounts.shortAnswer}
                      onChange={(e) => updateQuestionCount('shortAnswer', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-muted-foreground">Pregunta Abierta</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.questionCounts.openEnded}
                      onChange={(e) => updateQuestionCount('openEnded', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Total de preguntas:{' '}
                  <span className="font-semibold">
                    {totalQuestions(form.questionCounts)}
                  </span>
                </div>
              </div>

              {/* Summary card */}
              {form.name && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="text-sm font-semibold mb-1">Vista previa</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {form.timeLimit} min
                      <span className="mx-1">|</span>
                      <CheckCircle className="h-3.5 w-3.5" /> Aprob. {form.passingScore}%
                      <span className="mx-1">|</span>
                      <FileText className="h-3.5 w-3.5" /> {totalQuestions(form.questionCounts)} preg.
                    </div>
                    {form.description && (
                      <p className="text-xs text-muted-foreground mt-2">{form.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button onClick={saveTemplate} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Crear Plantilla
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── TAB: Mi Biblioteca ──── */}
        <TabsContent value="biblioteca" className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">Total Plantillas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{totalUsage}</div>
                <p className="text-xs text-muted-foreground">Veces Usadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{customList.length}</div>
                <p className="text-xs text-muted-foreground">Personalizadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{totalQCount}</div>
                <p className="text-xs text-muted-foreground">Total Preguntas</p>
              </CardContent>
            </Card>
          </div>

          {customList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Info className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p className="mb-3">Aún no tienes plantillas personalizadas.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear mi primera plantilla
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customList.map((tmpl) => (
                <TemplateCard key={tmpl.id} tmpl={tmpl} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ──── Create / Edit Dialog ──── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Modifica los campos de la plantilla.'
                : 'Define la configuración de tu nueva plantilla.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="dlg-name">Nombre</Label>
              <Input
                id="dlg-name"
                placeholder="Nombre de la plantilla"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="dlg-desc">Descripción</Label>
              <Textarea
                id="dlg-desc"
                placeholder="Describe el propósito..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, category: v as Template['category'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Examen</SelectItem>
                  <SelectItem value="practice">Práctica</SelectItem>
                  <SelectItem value="diagnostic">Diagnóstico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time & Passing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dlg-time">Tiempo límite (min)</Label>
                <Input
                  id="dlg-time"
                  type="number"
                  min={0}
                  value={form.timeLimit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dlg-pass">Puntuación mínima (%)</Label>
                <Input
                  id="dlg-pass"
                  type="number"
                  min={0}
                  max={100}
                  value={form.passingScore}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      passingScore: Math.min(100, parseInt(e.target.value) || 0),
                    }))
                  }
                />
              </div>
            </div>

            {/* Question counts */}
            <div>
              <Label className="mb-2 block">Preguntas por Tipo</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Opción Múltiple</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.questionCounts.multipleChoice}
                    onChange={(e) => updateQuestionCount('multipleChoice', e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Verdadero / Falso</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.questionCounts.trueFalse}
                    onChange={(e) => updateQuestionCount('trueFalse', e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Respuesta Corta</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.questionCounts.shortAnswer}
                    onChange={(e) => updateQuestionCount('shortAnswer', e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Pregunta Abierta</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.questionCounts.openEnded}
                    onChange={(e) => updateQuestionCount('openEnded', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total:{' '}
                <span className="font-semibold text-foreground">
                  {totalQuestions(form.questionCounts)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveTemplate}>
              {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── Delete Confirmation Dialog ──── */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Eliminar Plantilla
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && deleteTemplate(confirmDeleteId)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

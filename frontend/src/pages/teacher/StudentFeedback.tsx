import { useState } from 'react'
import {
  MessageSquare,
  Star,
  AlertTriangle,
  ThumbsUp,
  Search,
  Users,
  Plus,
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

// ===================== TYPES =====================

type FeedbackType = 'positive' | 'constructive' | 'warning' | 'general'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
}

interface Feedback {
  id: string
  studentId: string
  studentName: string
  type: FeedbackType
  message: string
  subject?: string
  assessment?: string
  createdAt: string
  createdBy: string
}

interface FeedbackStats {
  total: number
  byType: Record<FeedbackType, number>
  byStudent: { studentId: string; studentName: string; count: number }[]
}

// ===================== SIMULATED DATA =====================

// TODO: Replace with backend API calls
// GET  /api/feedback/students
// POST /api/feedback
// GET  /api/feedback/:studentId
// GET  /api/feedback/stats

const MOCK_STUDENTS: Student[] = [
  { id: 's1', firstName: 'Carlos', lastName: 'Mendez', email: 'carlos.m@edu.com' },
  { id: 's2', firstName: 'Maria', lastName: 'Lopez', email: 'maria.l@edu.com' },
  { id: 's3', firstName: 'Jose', lastName: 'Ramirez', email: 'jose.r@edu.com' },
  { id: 's4', firstName: 'Ana', lastName: 'Torres', email: 'ana.t@edu.com' },
  { id: 's5', firstName: 'Pedro', lastName: 'Garcia', email: 'pedro.g@edu.com' },
  { id: 's6', firstName: 'Lucia', lastName: 'Fernandez', email: 'lucia.f@edu.com' },
  { id: 's7', firstName: 'Diego', lastName: 'Morales', email: 'diego.m@edu.com' },
  { id: 's8', firstName: 'Sofia', lastName: 'Vargas', email: 'sofia.v@edu.com' },
]

const MOCK_SUBJECTS = [
  'Matematicas',
  'Ciencias',
  'Lengua y Literatura',
  'Historia',
  'Ingles',
  'Educacion Fisica',
]

const MOCK_ASSESSMENTS = [
  'Examen Parcial - Unidad 1',
  'Proyecto Final',
  'Tarea #5',
  'Quiz Semanal',
  'Presentacion Oral',
  'Laboratorio #3',
]

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'f1', studentId: 's1', studentName: 'Carlos Mendez',
    type: 'positive', message: 'Excelente participacion en clase. Siempre aporta ideas valiosas.',
    subject: 'Matematicas', createdAt: '2026-03-28T10:00:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f2', studentId: 's1', studentName: 'Carlos Mendez',
    type: 'constructive', message: 'Debe mejorar la presentacion de sus tareas escritas.',
    assessment: 'Tarea #5', createdAt: '2026-03-25T14:30:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f3', studentId: 's2', studentName: 'Maria Lopez',
    type: 'positive', message: 'Sobresaliente en el proyecto final. Demostró gran creatividad.',
    subject: 'Ciencias', assessment: 'Proyecto Final',
    createdAt: '2026-03-30T09:15:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f4', studentId: 's2', studentName: 'Maria Lopez',
    type: 'warning', message: 'Entrego la ultima evaluacion fuera de fecha. Hablar con el estudiante.',
    assessment: 'Examen Parcial - Unidad 1',
    createdAt: '2026-03-22T11:00:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f5', studentId: 's3', studentName: 'Jose Ramirez',
    type: 'general', message: 'Ha mejorado notablemente su comprension lectora.',
    subject: 'Lengua y Literatura',
    createdAt: '2026-03-29T16:00:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f6', studentId: 's4', studentName: 'Ana Torres',
    type: 'positive', message: 'Liderazgo destacado en trabajo grupal de historia.',
    subject: 'Historia',
    createdAt: '2026-03-27T08:45:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f7', studentId: 's4', studentName: 'Ana Torres',
    type: 'constructive', message: 'Necesita reforzar conceptos de gramatica inglesa.',
    subject: 'Ingles',
    createdAt: '2026-03-20T13:20:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f8', studentId: 's5', studentName: 'Pedro Garcia',
    type: 'warning', message: 'Falto a tres clases consecutivas sin justificacion.',
    createdAt: '2026-03-26T07:30:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f9', studentId: 's5', studentName: 'Pedro Garcia',
    type: 'constructive', message: 'Puede mejorar su rendimiento con mas estudio en casa.',
    subject: 'Matematicas', assessment: 'Quiz Semanal',
    createdAt: '2026-03-24T10:00:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f10', studentId: 's6', studentName: 'Lucia Fernandez',
    type: 'positive', message: 'Excelente exposicion sobre el sistema solar.',
    subject: 'Ciencias', assessment: 'Presentacion Oral',
    createdAt: '2026-04-01T11:30:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f11', studentId: 's7', studentName: 'Diego Morales',
    type: 'general', message: 'Buen comportamiento en clase. Sigue asi.',
    createdAt: '2026-03-31T15:00:00Z', createdBy: 'Prof. Rodriguez',
  },
  {
    id: 'f12', studentId: 's8', studentName: 'Sofia Vargas',
    type: 'positive', message: 'Resultados sobresalientes en el laboratorio.',
    subject: 'Ciencias', assessment: 'Laboratorio #3',
    createdAt: '2026-04-02T09:00:00Z', createdBy: 'Prof. Rodriguez',
  },
]

// ===================== HELPERS =====================

const FEEDBACK_TYPE_CONFIG: Record<FeedbackType, {
  label: string
  icon: React.ReactNode
  color: string
  bgClass: string
  badgeVariant: 'default' | 'secondary' | 'destructive'
}> = {
  positive: {
    label: 'Positivo',
    icon: <ThumbsUp className="h-4 w-4" />,
    color: 'text-green-600',
    bgClass: 'bg-green-50 border-green-200',
    badgeVariant: 'default',
  },
  constructive: {
    label: 'Constructivo',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200',
    badgeVariant: 'secondary',
  },
  warning: {
    label: 'Advertencia',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-red-600',
    bgClass: 'bg-red-50 border-red-200',
    badgeVariant: 'destructive',
  },
  general: {
    label: 'General',
    icon: <Star className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgClass: 'bg-yellow-50 border-yellow-200',
    badgeVariant: 'secondary',
  },
}

function getInitials(student: Student) {
  return `${student.firstName[0]}${student.lastName[0]}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function computeStats(feedback: Feedback[]): FeedbackStats {
  const byType: Record<FeedbackType, number> = { positive: 0, constructive: 0, warning: 0, general: 0 }
  const studentMap = new Map<string, { studentId: string; studentName: string; count: number }>()

  feedback.forEach((f) => {
    byType[f.type] = (byType[f.type] || 0) + 1
    const existing = studentMap.get(f.studentId)
    if (existing) {
      existing.count += 1
    } else {
      studentMap.set(f.studentId, { studentId: f.studentId, studentName: f.studentName, count: 1 })
    }
  })

  return {
    total: feedback.length,
    byType,
    byStudent: Array.from(studentMap.values()).sort((a, b) => b.count - a.count),
  }
}

// ===================== COMPONENT =====================

export default function StudentFeedback() {
  const [students] = useState<Student[]>(MOCK_STUDENTS)
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(MOCK_FEEDBACK)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('feedback')

  // New feedback dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newType, setNewType] = useState<FeedbackType>('general')
  const [newMessage, setNewMessage] = useState('')
  const [newSubject, setNewSubject] = useState<string>('')
  const [newAssessment, setNewAssessment] = useState<string>('')
  const [newStudentId, setNewStudentId] = useState<string>('')

  const stats = computeStats(feedbackList)

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    const hasFeedback =
      filterType === 'all' ||
      feedbackList.some((f) => f.studentId === s.id && f.type === filterType)
    const matchesSubject =
      filterSubject === 'all' ||
      feedbackList.some((f) => f.studentId === s.id && f.subject === filterSubject)
    const matchesStudent =
      selectedStudent === 'all' || s.id === selectedStudent
    return matchesSearch && (hasFeedback || filterType === 'all') && (matchesSubject || filterSubject === 'all') && (matchesStudent || selectedStudent === 'all')
  })

  const getStudentFeedback = (studentId: string) =>
    feedbackList
      .filter((f) => f.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSaveFeedback = () => {
    if (!newStudentId || !newMessage.trim()) return

    const student = students.find((s) => s.id === newStudentId)
    if (!student) return

    const entry: Feedback = {
      id: `f${Date.now()}`,
      studentId: newStudentId,
      studentName: `${student.firstName} ${student.lastName}`,
      type: newType,
      message: newMessage.trim(),
      subject: newSubject || undefined,
      assessment: newAssessment || undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'Prof. Rodriguez', // TODO: get from auth context
    }

    setFeedbackList((prev) => [entry, ...prev])
    setIsDialogOpen(false)
    setNewMessage('')
    setNewSubject('')
    setNewAssessment('')
    setNewStudentId('')
    setNewType('general')
  }

  const resetDialog = () => {
    setNewMessage('')
    setNewSubject('')
    setNewAssessment('')
    setNewStudentId('')
    setNewType('general')
  }

  // ---------- STATS CARDS ----------

  const StatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <MessageSquare className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Retroalimentaciones</p>
        </CardContent>
      </Card>

      {(Object.keys(FEEDBACK_TYPE_CONFIG) as FeedbackType[]).map((type) => {
        const cfg = FEEDBACK_TYPE_CONFIG[type]
        return (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{cfg.label}</CardTitle>
              <span className={cfg.color}>{cfg.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType[type]}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.byType[type] / stats.total) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  // ---------- FEEDBACK ROW ----------

  const FeedbackRow = ({ feedback }: { feedback: Feedback }) => {
    const cfg = FEEDBACK_TYPE_CONFIG[feedback.type]
    return (
      <div className={`p-4 rounded-lg border ${cfg.bgClass} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cfg.color}>{cfg.icon}</span>
            <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(feedback.createdAt)}
          </div>
        </div>
        <p className="text-sm">{feedback.message}</p>
        <div className="flex gap-3 flex-wrap">
          {feedback.subject && (
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {feedback.subject}
            </span>
          )}
          {feedback.assessment && (
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              {feedback.assessment}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ---------- NEW FEEDBACK DIALOG ----------

  const NewFeedbackDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetDialog() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Retroalimentacion</DialogTitle>
          <DialogDescription>
            Escribe un comentario o retroalimentacion para un estudiante
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Student */}
          <div className="grid gap-2">
            <Label htmlFor="fb-student">Estudiante</Label>
            <Select value={newStudentId} onValueChange={setNewStudentId}>
              <SelectTrigger id="fb-student">
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label>Tipo de Feedback</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FEEDBACK_TYPE_CONFIG) as FeedbackType[]).map((type) => {
                const cfg = FEEDBACK_TYPE_CONFIG[type]
                const selected = newType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                      ${selected ? `${cfg.bgClass} border-current ${cfg.color}` : 'border-input hover:bg-accent'}`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div className="grid gap-2">
            <Label htmlFor="fb-message">Mensaje</Label>
            <Textarea
              id="fb-message"
              placeholder="Escribe tu retroalimentacion..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Subject (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="fb-subject">Materia (opcional)</Label>
            <Select value={newSubject} onValueChange={setNewSubject}>
              <SelectTrigger id="fb-subject">
                <SelectValue placeholder="Sin materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin materia</SelectItem>
                {MOCK_SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assessment (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="fb-assessment">Evaluacion (opcional)</Label>
            <Select value={newAssessment} onValueChange={setNewAssessment}>
              <SelectTrigger id="fb-assessment">
                <SelectValue placeholder="Sin evaluacion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin evaluacion</SelectItem>
                {MOCK_ASSESSMENTS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveFeedback}
            disabled={!newStudentId || !newMessage.trim()}
          >
            Guardar Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ===================== RENDER =====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Retroalimentacion de Estudiantes</h1>
          <p className="text-muted-foreground">
            Gestiona comentarios y feedback individual para cada estudiante
          </p>
        </div>
        <NewFeedbackDialog />
      </div>

      {/* Overall Stats */}
      <StatsCards />

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de feedback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {(Object.keys(FEEDBACK_TYPE_CONFIG) as FeedbackType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {FEEDBACK_TYPE_CONFIG[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Materia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las materias</SelectItem>
            {MOCK_SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estudiante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estudiantes</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Dar Feedback
          </TabsTrigger>
          <TabsTrigger value="historial">
            <BarChart3 className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="estudiante">
            <Users className="h-4 w-4 mr-2" />
            Por Estudiante
          </TabsTrigger>
        </TabsList>

        {/* ---- TAB: Dar Feedback ---- */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de Estudiantes</h2>
            <span className="text-sm text-muted-foreground">
              {filteredStudents.length} estudiante(s)
            </span>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="grid gap-3">
              {filteredStudents.map((student) => {
                const studentFeedback = getStudentFeedback(student.id)
                const positiveCount = studentFeedback.filter((f) => f.type === 'positive').length
                const warningCount = studentFeedback.filter((f) => f.type === 'warning').length

                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {getInitials(student)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>

                        {/* Quick stats */}
                        <div className="hidden sm:flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {studentFeedback.length} feedback(s)
                          </span>
                          {positiveCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {positiveCount} {positiveCount === 1 ? 'positivo' : 'positivos'}
                            </Badge>
                          )}
                          {warningCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {warningCount} {warningCount === 1 ? 'advertencia' : 'advertencias'}
                            </Badge>
                          )}
                        </div>

                        {/* Quick feedback button */}
                        <Button
                          size="sm"
                          onClick={() => {
                            setNewStudentId(student.id)
                            setIsDialogOpen(true)
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                      </div>

                      {/* Recent feedback preview */}
                      {studentFeedback.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Ultimo feedback:</p>
                          <FeedbackRow feedback={studentFeedback[0]} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No se encontraron estudiantes
                </h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de busqueda
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---- TAB: Historial ---- */}
        <TabsContent value="historial" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Historial de Retroalimentacion</h2>
            <span className="text-sm text-muted-foreground">
              {feedbackList.length} registro(s)
            </span>
          </div>

          {/* Distribution bar */}
          {stats.total > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribucion por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(FEEDBACK_TYPE_CONFIG) as FeedbackType[]).map((type) => {
                  const cfg = FEEDBACK_TYPE_CONFIG[type]
                  const pct = stats.total > 0 ? Math.round((stats.byType[type] / stats.total) * 100) : 0
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1">
                          <span className={cfg.color}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        <span className="font-medium">{stats.byType[type]} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* All feedback list */}
          <div className="space-y-3">
            {feedbackList
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((fb) => {
                const cfg = FEEDBACK_TYPE_CONFIG[fb.type]
                return (
                  <div key={fb.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <span className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{fb.studentName}</span>
                          <Badge variant={cfg.badgeVariant} className="text-xs">{cfg.label}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(fb.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{fb.message}</p>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {fb.subject && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {fb.subject}
                          </span>
                        )}
                        {fb.assessment && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {fb.assessment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </TabsContent>

        {/* ---- TAB: Por Estudiante ---- */}
        <TabsContent value="estudiante" className="space-y-4">
          <h2 className="text-xl font-semibold">Retroalimentacion por Estudiante</h2>

          {students
            .map((student) => {
              const fb = getStudentFeedback(student.id)
              return { student, feedback: fb }
            })
            .filter(({ feedback }) => feedback.length > 0)
            .sort((a, b) => b.feedback.length - a.feedback.length)
            .map(({ student, feedback }) => {
              const isExpanded = expandedStudent === student.id
              const typeBreakdown = feedback.reduce(
                (acc, f) => {
                  acc[f.type] = (acc[f.type] || 0) + 1
                  return acc
                },
                {} as Record<FeedbackType, number>
              )

              return (
                <Card key={student.id}>
                  <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {getInitials(student)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {student.firstName} {student.lastName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Type badges */}
                        <div className="hidden sm:flex gap-2">
                          {(Object.keys(typeBreakdown) as FeedbackType[]).map((type) => {
                            const cfg = FEEDBACK_TYPE_CONFIG[type]
                            return (
                              <Badge key={type} variant={cfg.badgeVariant} className="text-xs">
                                {typeBreakdown[type]} {cfg.label}
                              </Badge>
                            )
                          })}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {feedback.length} feedback(s)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-3 pt-0">
                      {feedback.map((fb) => (
                        <FeedbackRow key={fb.id} feedback={fb} />
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setNewStudentId(student.id)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Feedback a {student.firstName}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              )
            })}

          {stats.byStudent.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sin retroalimentacion registrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza dando feedback a tus estudiantes
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

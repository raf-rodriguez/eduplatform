import { useState } from 'react'
import {
  Users,
  Send,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  Search,
  Plus,
  Clock,
  Phone,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ============================================================
// Types
// ============================================================

type DeliveryFrequency = 'semanal' | 'quincenal' | 'mensual'
type CommunicationType = 'reporte' | 'mensaje' | 'citacion'
type MessageStatus = 'enviado' | 'leido' | 'pendiente'

interface ParentInfo {
  email: string
  phone: string
  relationship: string
}

interface StudentWithParent {
  id: string
  name: string
  grade: number
  parent: ParentInfo
  lastReportSent: string
  reportCount: number
  engagementScore: number
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  frequency: DeliveryFrequency
}

interface ScheduledReport {
  id: string
  studentName: string
  template: string
  frequency: DeliveryFrequency
  nextDelivery: string
  active: boolean
}

interface CommunicationRecord {
  id: string
  type: CommunicationType
  studentName: string
  parentName: string
  subject: string
  date: string
  status: MessageStatus
  content: string
}

// ============================================================
// Simulated Data (TODO: Replace with API calls)
// ============================================================

const MOCK_STUDENTS_WITH_PARENTS: StudentWithParent[] = [
  {
    id: 's1',
    name: 'Maria Garcia',
    grade: 92,
    parent: { email: 'ana.garcia@email.com', phone: '+52 555 123 4567', relationship: 'Madre' },
    lastReportSent: '2026-04-01',
    reportCount: 12,
    engagementScore: 95,
  },
  {
    id: 's2',
    name: 'Carlos Rodriguez',
    grade: 85,
    parent: { email: 'pedro.rodriguez@email.com', phone: '+52 555 234 5678', relationship: 'Padre' },
    lastReportSent: '2026-04-01',
    reportCount: 10,
    engagementScore: 78,
  },
  {
    id: 's3',
    name: 'Ana Martinez',
    grade: 78,
    parent: { email: 'lucia.martinez@email.com', phone: '+52 555 345 6789', relationship: 'Madre' },
    lastReportSent: '2026-03-25',
    reportCount: 8,
    engagementScore: 60,
  },
  {
    id: 's4',
    name: 'Jose Lopez',
    grade: 95,
    parent: { email: 'rosa.lopez@email.com', phone: '+52 555 456 7890', relationship: 'Madre' },
    lastReportSent: '2026-04-01',
    reportCount: 14,
    engagementScore: 100,
  },
  {
    id: 's5',
    name: 'Sofia Hernandez',
    grade: 88,
    parent: { email: 'miguel.hernandez@email.com', phone: '+52 555 567 8901', relationship: 'Padre' },
    lastReportSent: '2026-03-28',
    reportCount: 11,
    engagementScore: 85,
  },
  {
    id: 's6',
    name: 'Diego Ramirez',
    grade: 72,
    parent: { email: 'carmen.ramirez@email.com', phone: '+52 555 678 9012', relationship: 'Madre' },
    lastReportSent: '2026-03-20',
    reportCount: 6,
    engagementScore: 45,
  },
  {
    id: 's7',
    name: 'Valentina Torres',
    grade: 91,
    parent: { email: 'jorge.torres@email.com', phone: '+52 555 789 0123', relationship: 'Padre' },
    lastReportSent: '2026-04-01',
    reportCount: 13,
    engagementScore: 92,
  },
  {
    id: 's8',
    name: 'Mateo Diaz',
    grade: 83,
    parent: { email: 'patricia.diaz@email.com', phone: '+52 555 890 1234', relationship: 'Madre' },
    lastReportSent: '2026-03-30',
    reportCount: 9,
    engagementScore: 70,
  },
]

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 't1', name: 'Reporte Semanal de Progreso', description: 'Resumen semanal del avance academico y tareas completadas', frequency: 'semanal' },
  { id: 't2', name: 'Boletin de Calificaciones', description: 'Reporte detallado de calificaciones del periodo', frequency: 'mensual' },
  { id: 't3', name: 'Informe de Asistencia', description: 'Registro de asistencia y puntualidad del estudiante', frequency: 'quincenal' },
  { id: 't4', name: 'Reporte de Comportamiento', description: 'Evaluacion de conducta y participacion en clase', frequency: 'mensual' },
  { id: 't5', name: 'Resumen Quincenal', description: 'Actualizacion de progreso cada dos semanas', frequency: 'quincenal' },
  { id: 't6', name: 'Alerta Academica', description: 'Notificacion de bajo rendimiento o ausencias', frequency: 'semanal' },
]

const MOCK_SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'sch1', studentName: 'Maria Garcia', template: 'Reporte Semanal de Progreso', frequency: 'semanal', nextDelivery: '2026-04-07', active: true },
  { id: 'sch2', studentName: 'Carlos Rodriguez', template: 'Boletin de Calificaciones', frequency: 'mensual', nextDelivery: '2026-05-01', active: true },
  { id: 'sch3', studentName: 'Jose Lopez', template: 'Reporte Semanal de Progreso', frequency: 'semanal', nextDelivery: '2026-04-07', active: true },
  { id: 'sch4', studentName: 'Sofia Hernandez', template: 'Resumen Quincenal', frequency: 'quincenal', nextDelivery: '2026-04-15', active: true },
  { id: 'sch5', studentName: 'Diego Ramirez', template: 'Alerta Academica', frequency: 'semanal', nextDelivery: '2026-04-07', active: true },
  { id: 'sch6', studentName: 'Ana Martinez', template: 'Boletin de Calificaciones', frequency: 'mensual', nextDelivery: '2026-05-01', active: false },
]

const MOCK_COMMUNICATION_HISTORY: CommunicationRecord[] = [
  { id: 'c1', type: 'reporte', studentName: 'Maria Garcia', parentName: 'Ana Garcia', subject: 'Reporte Semanal - Semana 13', date: '2026-04-01T10:00:00', status: 'leido', content: 'Reporte automatico enviado al padre/tutor con el progreso semanal.' },
  { id: 'c2', type: 'mensaje', studentName: 'Carlos Rodriguez', parentName: 'Pedro Rodriguez', subject: 'Reunion de progreso', date: '2026-03-30T14:30:00', status: 'leido', content: 'Mensaje personalizado solicitando reunion para discutir el progreso del estudiante.' },
  { id: 'c3', type: 'reporte', studentName: 'Jose Lopez', parentName: 'Rosa Lopez', subject: 'Boletin de Calificaciones - Marzo', date: '2026-03-28T09:00:00', status: 'leido', content: 'Boletin de calificaciones del mes de marzo enviado automaticamente.' },
  { id: 'c4', type: 'citacion', studentName: 'Diego Ramirez', parentName: 'Carmen Ramirez', subject: 'Citacion urgente - Bajo rendimiento', date: '2026-03-25T11:00:00', status: 'pendiente', content: 'Citacion enviada al padre/tutor para discutir el rendimiento academico.' },
  { id: 'c5', type: 'reporte', studentName: 'Sofia Hernandez', parentName: 'Miguel Hernandez', subject: 'Resumen Quincenal - Primera quincena', date: '2026-03-20T08:00:00', status: 'leido', content: 'Resumen quincenal enviado automaticamente.' },
  { id: 'c6', type: 'mensaje', studentName: 'Ana Martinez', parentName: 'Lucia Martinez', subject: 'Felicitaciones por mejora', date: '2026-03-18T16:00:00', status: 'leido', content: 'Mensaje de felicitacion por la mejora reciente en calificaciones.' },
  { id: 'c7', type: 'reporte', studentName: 'Valentina Torres', parentName: 'Jorge Torres', subject: 'Reporte Semanal - Semana 12', date: '2026-03-15T10:00:00', status: 'leido', content: 'Reporte semanal automatico enviado.' },
  { id: 'c8', type: 'mensaje', studentName: 'Mateo Diaz', parentName: 'Patricia Diaz', subject: 'Recordatorio de proyecto', date: '2026-03-12T13:00:00', status: 'enviado', content: 'Recordatorio enviado sobre la fecha limite del proyecto final.' },
]

const FREQUENCY_LABELS: Record<DeliveryFrequency, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
}

// ============================================================
// Helper Components
// ============================================================

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase()
}

function EngagementBadge({ score }: { score: number }) {
  const variant = score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'
  const label = score >= 80 ? 'Alta' : score >= 60 ? 'Media' : 'Baja'
  return <Badge variant={variant as 'default' | 'secondary' | 'destructive'}>{label} ({score}%)</Badge>
}

function StatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'leido':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'enviado':
      return <Mail className="h-4 w-4 text-blue-500" />
    case 'pendiente':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }
}

function CommunicationTypeBadge({ type }: { type: CommunicationType }) {
  const config: Record<CommunicationType, { label: string; icon: typeof FileText }> = {
    reporte: { label: 'Reporte', icon: FileText },
    mensaje: { label: 'Mensaje', icon: MessageSquare },
    citacion: { label: 'Citacion', icon: Calendar },
  }
  const { label, icon: Icon } = config[type]
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function ParentIntegration() {
  const [searchQuery, setSearchQuery] = useState('')
  const [students] = useState<StudentWithParent[]>(MOCK_STUDENTS_WITH_PARENTS)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(MOCK_SCHEDULED_REPORTS)
  const [communicationHistory] = useState<CommunicationRecord[]>(MOCK_COMMUNICATION_HISTORY)

  // Dialog states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithParent | null>(null)

  // Form states
  const [scheduleStudentId, setScheduleStudentId] = useState('')
  const [scheduleTemplateId, setScheduleTemplateId] = useState('')
  const [scheduleFrequency, setScheduleFrequency] = useState<DeliveryFrequency>('semanal')
  const [msgStudentId, setMsgStudentId] = useState('')
  const [msgSubject, setMsgSubject] = useState('')
  const [msgContent, setMsgContent] = useState('')

  // Filtered students
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.parent.phone.includes(searchQuery)
  )

  // Filtered communication history
  const filteredHistory = communicationHistory.filter((c) =>
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const totalReportsSent = scheduledReports.filter((r) => r.active).length
  const avgEngagement = Math.round(students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length)
  const totalCommunications = communicationHistory.length
  const readRate = Math.round((communicationHistory.filter((c) => c.status === 'leido').length / totalCommunications) * 100)

  // Handlers
  const handleScheduleReport = () => {
    // TODO: Replace with actual API call to schedule report delivery
    if (!scheduleStudentId || !scheduleTemplateId) return

    const student = students.find((s) => s.id === scheduleStudentId)
    const template = REPORT_TEMPLATES.find((t) => t.id === scheduleTemplateId)
    if (!student || !template) return

    const newScheduled: ScheduledReport = {
      id: `sch-${Date.now()}`,
      studentName: student.name,
      template: template.name,
      frequency: scheduleFrequency,
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
    }

    setScheduledReports((prev) => [...prev, newScheduled])
    setShowScheduleDialog(false)
    setScheduleStudentId('')
    setScheduleTemplateId('')
    setScheduleFrequency('semanal')
  }

  const handleSendCustomMessage = () => {
    // TODO: Replace with actual API call to send custom message to parent
    if (!msgStudentId || !msgSubject || !msgContent) return

    const student = students.find((s) => s.id === msgStudentId)
    if (!student) return

    const newComm: CommunicationRecord = {
      id: `c-${Date.now()}`,
      type: 'mensaje',
      studentName: student.name,
      parentName: student.parent.relationship === 'Madre' ? student.parent.email.split('.')[0].replace('.', ' ') : student.parent.email.split('.')[0].replace('.', ' '),
      subject: msgSubject,
      date: new Date().toISOString(),
      status: 'enviado',
      content: msgContent,
    }

    communicationHistory.unshift(newComm)
    setShowMessageDialog(false)
    setMsgStudentId('')
    setMsgSubject('')
    setMsgContent('')
  }

  const handleToggleSchedule = (scheduleId: string) => {
    // TODO: Replace with actual API call to toggle schedule active state
    setScheduledReports((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, active: !s.active } : s))
    )
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    // TODO: Replace with actual API call to delete scheduled report
    setScheduledReports((prev) => prev.filter((s) => s.id !== scheduleId))
  }

  const handleSendInstantReport = (student: StudentWithParent) => {
    // TODO: Replace with actual API call to send instant report to parent
    setSelectedStudent(student)
    setShowTemplateDialog(true)
  }

  const handleSendFromTemplate = (template: ReportTemplate) => {
    // TODO: Replace with actual API call to send report using template
    console.log('TODO: Send report using template', template.name, 'to', selectedStudent?.parent.email)
    setShowTemplateDialog(false)
    setSelectedStudent(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integracion con Padres</h1>
          <p className="text-muted-foreground">Gestiona la comunicacion con padres y tutores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMessageDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Mensaje
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Programar Reporte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reportes Programados</p>
                <p className="text-2xl font-bold">{totalReportsSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engagement Promedio</p>
                <p className="text-2xl font-bold">{avgEngagement}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comunicaciones Totales</p>
                <p className="text-2xl font-bold">{totalCommunications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Lectura</p>
                <p className="text-2xl font-bold">{readRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="parents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parents">Padres/Tutores</TabsTrigger>
          <TabsTrigger value="send-reports">Enviar Reportes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="scheduling">Programacion</TabsTrigger>
        </TabsList>

        {/* ============================================
            Tab 1: Padres/Tutores
            ============================================ */}
        <TabsContent value="parents" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar estudiante, email o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No se encontraron resultados</h3>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otra busqueda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">Promedio: {student.grade}</p>
                      </div>
                      <EngagementBadge score={student.engagementScore} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{student.parent.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{student.parent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{student.parent.relationship}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ultimo reporte: {new Date(student.lastReportSent).toLocaleDateString('es-ES')}</span>
                      <span>{student.reportCount} reportes enviados</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSendInstantReport(student)}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Enviar Reporte
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setMsgStudentId(student.id); setShowMessageDialog(true) }}
                      >
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Mensaje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============================================
            Tab 2: Enviar Reportes
            ============================================ */}
        <TabsContent value="send-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Reporte Individual</CardTitle>
              <CardDescription>Selecciona un estudiante y envia un reporte inmediato a su padre/tutor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estudiante</label>
                  <Select value={msgStudentId} onValueChange={setMsgStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estudiante..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - {s.parent.relationship} ({s.parent.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    const student = students.find((s) => s.id === msgStudentId)
                    if (student) handleSendInstantReport(student)
                  }}
                  disabled={!msgStudentId}
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enviar Reporte Ahora
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Reportes</CardTitle>
              <CardDescription>Usa plantillas predefinidas para enviar reportes rapidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelectedStudent(students[0])
                      handleSendFromTemplate(template)
                    }}
                  >
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{FREQUENCY_LABELS[template.frequency]}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enviar Mensaje Personalizado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enviar Mensaje Personalizado
              </CardTitle>
              <CardDescription>Envia un mensaje personalizado a cualquier padre/tutor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estudiante (Padre/Tutor)</label>
                  <Select value={msgStudentId} onValueChange={setMsgStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estudiante..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - {s.parent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Asunto</label>
                  <input
                    type="text"
                    placeholder="Asunto del mensaje..."
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mensaje</label>
                  <Textarea
                    placeholder="Escribe tu mensaje aqui..."
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button onClick={handleSendCustomMessage} disabled={!msgStudentId || !msgSubject || !msgContent}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================
            Tab 3: Historial
            ============================================ */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en historial de comunicacion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No se encontraron comunicaciones</h3>
                <p className="text-sm text-muted-foreground mt-1">Intenta con otra busqueda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((comm) => (
                <Card key={comm.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <StatusIcon status={comm.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CommunicationTypeBadge type={comm.type} />
                            <h3 className="font-medium text-sm truncate">{comm.subject}</h3>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {comm.studentName}
                            </span>
                            <span>Para: {comm.parentName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{comm.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0 ml-4">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(comm.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============================================
            Tab 4: Programacion
            ============================================ */}
        <TabsContent value="scheduling" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Reportes Programados</h2>
              <p className="text-sm text-muted-foreground">Gestiona la entrega automatica de reportes a padres/tutores</p>
            </div>
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Programacion
            </Button>
          </div>

          {scheduledReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No hay reportes programados</h3>
                <p className="text-sm text-muted-foreground mt-1">Programa tu primer reporte automatico</p>
                <Button className="mt-4" onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Reporte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scheduledReports.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{schedule.studentName}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{schedule.template}</span>
                            <Badge variant="outline">{FREQUENCY_LABELS[schedule.frequency]}</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            Proxima entrega: {new Date(schedule.nextDelivery).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={schedule.active ? 'default' : 'secondary'}>
                          {schedule.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleSchedule(schedule.id)}
                          title={schedule.active ? 'Desactivar' : 'Activar'}
                        >
                          {schedule.active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============================================
          Dialog: Programar Reporte
          ============================================ */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Programar Entrega de Reporte
            </DialogTitle>
            <DialogDescription>
              Configura el envio automatico de reportes a padres/tutores
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estudiante</label>
              <Select value={scheduleStudentId} onValueChange={setScheduleStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.parent.relationship} ({s.parent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Plantilla de Reporte</label>
              <Select value={scheduleTemplateId} onValueChange={setScheduleTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frecuencia de Entrega</label>
              <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v as DeliveryFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal (cada lunes)</SelectItem>
                  <SelectItem value="quincenal">Quincenal (1 y 15 de cada mes)</SelectItem>
                  <SelectItem value="mensual">Mensual (primer dia del mes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleReport} disabled={!scheduleStudentId || !scheduleTemplateId}>
              <Calendar className="mr-2 h-4 w-4" />
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Dialog: Enviar Mensaje Personalizado
          ============================================ */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Mensaje a Padre/Tutor
            </DialogTitle>
            <DialogDescription>
              Envia un mensaje personalizado al padre o tutor del estudiante
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estudiante</label>
              <Select value={msgStudentId} onValueChange={setMsgStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.parent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Asunto</label>
              <input
                type="text"
                placeholder="Asunto del mensaje..."
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Mensaje</label>
              <Textarea
                placeholder="Escribe tu mensaje aqui..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                rows={6}
              />
            </div>

            {msgStudentId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-md bg-muted/50">
                <Mail className="h-4 w-4" />
                Se enviara a: {students.find((s) => s.id === msgStudentId)?.parent.email}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMessageDialog(false); setMsgSubject(''); setMsgContent('') }}>
              Cancelar
            </Button>
            <Button onClick={handleSendCustomMessage} disabled={!msgStudentId || !msgSubject || !msgContent}>
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Dialog: Seleccionar Plantilla para Envio Rapido
          ============================================ */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Plantilla de Reporte</DialogTitle>
            <DialogDescription>
              Elige una plantilla para enviar a {selectedStudent?.parent.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {REPORT_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSendFromTemplate(template)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{FREQUENCY_LABELS[template.frequency]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

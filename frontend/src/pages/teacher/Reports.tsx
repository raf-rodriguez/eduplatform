import { useState } from 'react'
import {
  FileText,
  Download,
  Printer,
  Users,
  FileSpreadsheet,
  Eye,
  Calendar,
  BarChart3,
  GraduationCap,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Filter,
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

// ============================================================
// Types
// ============================================================

type ReportType = 'calificaciones' | 'progreso' | 'asistencia' | 'rendimiento'
type ReportScope = 'student' | 'class'
type ReportStatus = 'generado' | 'pendiente' | 'error'

interface Student {
  id: string
  name: string
  grade: number
}

interface ReportTemplate {
  id: string
  name: string
  type: ReportType
  description: string
  icon: string
}

interface GeneratedReport {
  id: string
  name: string
  type: ReportType
  scope: ReportScope
  studentName?: string
  createdAt: string
  status: ReportStatus
  pages: number
}

interface ReportPreviewData {
  title: string
  generatedAt: string
  scope: string
  data: Record<string, any>[]
  summary: Record<string, string | number>
}

// ============================================================
// Simulated Data (TODO: Replace with API calls)
// ============================================================

const REPORT_TYPES: { value: ReportType; label: string; description: string; icon: typeof FileText }[] = [
  { value: 'calificaciones', label: 'Calificaciones', description: 'Reporte detallado de calificaciones por estudiante', icon: FileSpreadsheet },
  { value: 'progreso', label: 'Progreso', description: 'Avance del estudiante en el curso', icon: TrendingUp },
  { value: 'asistencia', label: 'Asistencia', description: 'Registro de asistencia y puntualidad', icon: Calendar },
  { value: 'rendimiento', label: 'Rendimiento', description: 'Análisis de rendimiento y métricas', icon: BarChart3 },
]

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 't1', name: 'Boletín de Calificaciones', type: 'calificaciones', description: 'Reporte oficial de calificaciones del período', icon: 'FileSpreadsheet' },
  { id: 't2', name: 'Informe de Progreso Mensual', type: 'progreso', description: 'Resumen del avance académico del mes', icon: 'TrendingUp' },
  { id: 't3', name: 'Registro de Asistencia Semanal', type: 'asistencia', description: 'Control de asistencia de la semana', icon: 'Calendar' },
  { id: 't4', name: 'Análisis de Rendimiento', type: 'rendimiento', description: 'Evaluación integral del rendimiento estudiantil', icon: 'BarChart3' },
  { id: 't5', name: 'Reporte de Calificaciones Parciales', type: 'calificaciones', description: 'Calificaciones de evaluaciones parciales', icon: 'FileSpreadsheet' },
  { id: 't6', name: 'Reporte de Asistencia Mensual', type: 'asistencia', description: 'Resumen completo de asistencia del mes', icon: 'Calendar' },
]

const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'María García', grade: 92 },
  { id: 's2', name: 'Carlos Rodríguez', grade: 85 },
  { id: 's3', name: 'Ana Martínez', grade: 78 },
  { id: 's4', name: 'José López', grade: 95 },
  { id: 's5', name: 'Sofía Hernández', grade: 88 },
  { id: 's6', name: 'Diego Ramírez', grade: 72 },
  { id: 's7', name: 'Valentina Torres', grade: 91 },
  { id: 's8', name: 'Mateo Díaz', grade: 83 },
]

const MOCK_GENERATED_REPORTS: GeneratedReport[] = [
  { id: 'r1', name: 'Calificaciones - Marzo 2026', type: 'calificaciones', scope: 'class', createdAt: '2026-04-01T10:30:00', status: 'generado', pages: 5 },
  { id: 'r2', name: 'Progreso - María García', type: 'progreso', scope: 'student', studentName: 'María García', createdAt: '2026-03-28T14:15:00', status: 'generado', pages: 3 },
  { id: 'r3', name: 'Asistencia - Semana 13', type: 'asistencia', scope: 'class', createdAt: '2026-03-25T09:00:00', status: 'generado', pages: 2 },
  { id: 'r4', name: 'Rendimiento General Q1', type: 'rendimiento', scope: 'class', createdAt: '2026-03-20T16:45:00', status: 'generado', pages: 8 },
  { id: 'r5', name: 'Calificaciones - Carlos Rodríguez', type: 'calificaciones', scope: 'student', studentName: 'Carlos Rodríguez', createdAt: '2026-03-18T11:20:00', status: 'generado', pages: 2 },
  { id: 'r6', name: 'Progreso - Pendiente', type: 'progreso', scope: 'class', createdAt: '2026-04-03T08:00:00', status: 'pendiente', pages: 0 },
]

const generatePreviewData = (type: ReportType, scope: ReportScope, studentName?: string): ReportPreviewData => {
  // TODO: Replace with actual API call to generate report data
  const now = new Date().toLocaleString('es-ES')

  if (type === 'calificaciones') {
    return {
      title: scope === 'student' ? `Calificaciones - ${studentName}` : 'Calificaciones - Clase Completa',
      generatedAt: now,
      scope: scope === 'student' ? studentName || '' : 'Todos los estudiantes',
      summary: scope === 'student'
        ? { promedio: 92, evaluaciones: 12, aprobadas: 11, reprobadas: 1 }
        : { promedioGeneral: 85.5, totalEstudiantes: 8, aprobados: 7, reprobados: 1 },
      data: scope === 'student'
        ? [
          { evaluacion: 'Examen Parcial 1', fecha: '2026-02-15', calificacion: 95, peso: '30%' },
          { evaluacion: 'Examen Parcial 2', fecha: '2026-03-15', calificacion: 88, peso: '30%' },
          { evaluacion: 'Tarea 1', fecha: '2026-02-01', calificacion: 100, peso: '10%' },
          { evaluacion: 'Tarea 2', fecha: '2026-02-20', calificacion: 90, peso: '10%' },
          { evaluacion: 'Proyecto Final', fecha: '2026-03-28', calificacion: 92, peso: '20%' },
        ]
        : MOCK_STUDENTS.map((s) => ({ estudiante: s.name, promedio: s.grade, estado: s.grade >= 70 ? 'Aprobado' : 'Reprobado' })),
    }
  }

  if (type === 'progreso') {
    return {
      title: scope === 'student' ? `Progreso - ${studentName}` : 'Progreso - Clase Completa',
      generatedAt: now,
      scope: scope === 'student' ? studentName || '' : 'Todos los estudiantes',
      summary: { modulosCompletados: 8, modulosTotales: 12, porcentaje: 67, tiempoPromedio: '4.5h' },
      data: [
        { modulo: 'Módulo 1: Introducción', estado: 'Completado', fecha: '2026-01-15', calificacion: 95 },
        { modulo: 'Módulo 2: Fundamentos', estado: 'Completado', fecha: '2026-01-28', calificacion: 88 },
        { modulo: 'Módulo 3: Conceptos Básicos', estado: 'Completado', fecha: '2026-02-10', calificacion: 92 },
        { modulo: 'Módulo 4: Intermedio', estado: 'Completado', fecha: '2026-02-25', calificacion: 85 },
        { modulo: 'Módulo 5: Avanzado I', estado: 'En Progreso', fecha: '-', calificacion: 0 },
        { modulo: 'Módulo 6: Avanzado II', estado: 'Pendiente', fecha: '-', calificacion: 0 },
      ],
    }
  }

  if (type === 'asistencia') {
    return {
      title: scope === 'student' ? `Asistencia - ${studentName}` : 'Asistencia - Clase Completa',
      generatedAt: now,
      scope: scope === 'student' ? studentName || '' : 'Todos los estudiantes',
      summary: { totalClases: 40, asistencias: 36, ausencias: 4, porcentaje: 90 },
      data: [
        { fecha: '2026-04-01', dia: 'Miércoles', estado: 'Presente', hora: '08:00' },
        { fecha: '2026-03-31', dia: 'Martes', estado: 'Presente', hora: '08:05' },
        { fecha: '2026-03-30', dia: 'Lunes', estado: 'Presente', hora: '08:02' },
        { fecha: '2026-03-27', dia: 'Viernes', estado: 'Ausente', hora: '-' },
        { fecha: '2026-03-26', dia: 'Jueves', estado: 'Presente', hora: '08:10' },
        { fecha: '2026-03-25', dia: 'Miércoles', estado: 'Presente', hora: '07:58' },
      ],
    }
  }

  return {
    title: scope === 'student' ? `Rendimiento - ${studentName}` : 'Rendimiento - Clase Completa',
    generatedAt: now,
    scope: scope === 'student' ? studentName || '' : 'Todos los estudiantes',
    summary: { rendimientoGeneral: 85, fortalezas: 3, areasMejora: 2, tendencia: 'Positiva' },
    data: [
      { categoria: 'Participación', puntuacion: 90, nivel: 'Excelente' },
      { categoria: 'Entrega de Tareas', puntuacion: 85, nivel: 'Muy Bien' },
      { categoria: 'Trabajo en Equipo', puntuacion: 92, nivel: 'Excelente' },
      { categoria: 'Comprensión', puntuacion: 78, nivel: 'Bien' },
      { categoria: 'Creatividad', puntuacion: 88, nivel: 'Muy Bien' },
    ],
  }
}

// ============================================================
// Helper Components
// ============================================================

function ReportTypeIcon({ type }: { type: ReportType }) {
  const config = REPORT_TYPES.find((r) => r.value === type)
  const Icon = config?.icon || FileText
  return <Icon className="h-4 w-4" />
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const variants: Record<ReportStatus, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
    generado: { variant: 'default', label: 'Generado' },
    pendiente: { variant: 'secondary', label: 'Pendiente' },
    error: { variant: 'destructive', label: 'Error' },
  }
  const config = variants[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function ReportPreviewView({ data, reportType }: { data: ReportPreviewData; reportType: ReportType }) {
  const printReport = () => {
    window.print()
  }

  const downloadReport = () => {
    // TODO: Implement actual PDF download using jsPDF or similar library
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="flex gap-2 no-print">
        <Button onClick={printReport} variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={downloadReport} size="sm">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>

      {/* Report Header */}
      <div className="report-header border rounded-lg p-6 bg-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.title}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Generado: {data.generatedAt}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Alcance: {data.scope}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Tipo: {REPORT_TYPES.find((r) => r.value === reportType)?.label}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            EduPlatForm
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data.summary).map(([key, value]) => {
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
            .replace(/_/g, ' ')
          return (
            <Card key={key}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground capitalize">{label}</p>
                <p className="text-xl font-bold mt-1">{String(value)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {data.data.length > 0 &&
                    Object.keys(data.data[0]).map((key) => (
                      <th key={key} className="text-left py-2 px-3 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="py-2 px-3">
                        {typeof value === 'number' && (value >= 0 && value <= 100) ? (
                          <span
                            className={
                              value >= 90
                                ? 'text-green-600 font-medium'
                                : value >= 70
                                  ? 'text-blue-600'
                                  : 'text-red-600'
                            }
                          >
                            {value}
                          </span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>Reporte generado por EduPlatForm - {new Date().getFullYear()}</p>
        <p className="mt-1">Este documento es de uso interno y confidencial.</p>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function Reports() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [selectedScope, setSelectedScope] = useState<ReportScope>('class')
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [preview, setPreview] = useState<ReportPreviewData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports] = useState<GeneratedReport[]>(MOCK_GENERATED_REPORTS)
  const [searchQuery, setSearchQuery] = useState('')

  const handleGenerateReport = () => {
    if (!selectedType) return

    setIsGenerating(true)

    // TODO: Replace with actual API call to generate report
    setTimeout(() => {
      const previewData = generatePreviewData(selectedType, selectedScope, selectedStudent)
      setPreview(previewData)
      setIsGenerating(false)
      setOpen(false)
    }, 1500)
  }

  const handleViewReport = (report: GeneratedReport) => {
    // TODO: Replace with actual API call to fetch report data
    const previewData = generatePreviewData(report.type, report.scope, report.studentName)
    setPreview(previewData)
  }

  const handleUseTemplate = (template: ReportTemplate) => {
    setSelectedType(template.type)
    setOpen(true)
  }

  const resetForm = () => {
    setSelectedType(null)
    setSelectedScope('class')
    setSelectedStudent('')
    setPreview(null)
  }

  const filteredReports = generatedReports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setPreview(null)}>
            <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
            Volver a Reportes
          </Button>
        </div>
        <ReportPreviewView data={preview} reportType={selectedType || 'calificaciones'} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Exportables</h1>
          <p className="text-muted-foreground">Genera, visualiza y exporta reportes académicos</p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generar Reporte</TabsTrigger>
          <TabsTrigger value="saved">Reportes Guardados</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.value}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setSelectedType(type.value)
                    setOpen(true)
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reportes este mes</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descargas totales</p>
                    <p className="text-2xl font-bold">48</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último reporte</p>
                    <p className="text-sm font-medium">Hace 2 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar reportes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No se encontraron reportes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Intenta con otra búsqueda' : 'Genera tu primer reporte para comenzar'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <ReportTypeIcon type={report.type} />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString('es-ES')}
                            </span>
                            <span>{report.pages} páginas</span>
                            {report.studentName && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {report.studentName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={report.status} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReport(report)}
                          title="Vista previa"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Plantillas de Reportes</h2>
            <p className="text-sm text-muted-foreground">
              Usa plantillas predefinidas para generar reportes rápidamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((template) => {
              const IconComponent =
                template.icon === 'FileSpreadsheet'
                  ? FileSpreadsheet
                  : template.icon === 'TrendingUp'
                    ? TrendingUp
                    : template.icon === 'Calendar'
                      ? Calendar
                      : BarChart3

              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-full bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {REPORT_TYPES.find((r) => r.value === template.type)?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Usar Plantilla
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Custom Template CTA */}
          <Card className="mt-4 border-dashed">
            <CardContent className="py-8 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">Crear Plantilla Personalizada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Diseña tu propia plantilla de reporte con campos personalizados
              </p>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Crear Plantilla
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Generation Dialog */}
      <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generar Nuevo Reporte</DialogTitle>
            <DialogDescription>
              Configura las opciones para generar el reporte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <div className="grid grid-cols-2 gap-3">
                {REPORT_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      <div className={`p-2 rounded-full ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Alcance del Reporte</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${selectedScope === 'class'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedScope('class')}
                >
                  <Users className="h-4 w-4" />
                  Clase Completa
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${selectedScope === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedScope('student')}
                >
                  <GraduationCap className="h-4 w-4" />
                  Estudiante Individual
                </button>
              </div>
            </div>

            {/* Student Selection (conditional) */}
            {selectedScope === 'student' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Seleccionar Estudiante</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_STUDENTS.map((student) => (
                      <SelectItem key={student.id} value={student.name}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range (TODO: Add date picker) */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Período</label>
              <Select defaultValue="current-month">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mes Actual (Abril 2026)</SelectItem>
                  <SelectItem value="last-month">Mes Anterior (Marzo 2026)</SelectItem>
                  <SelectItem value="current-quarter">Trimestre Actual (Q1 2026)</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {/* TODO: Add date range picker for custom period */}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedType || (selectedScope === 'student' && !selectedStudent) || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-header { box-shadow: none !important; }
        }
      `}</style>
    </div >
  )
}

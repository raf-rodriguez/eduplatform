import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  Save,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
// TODO: Backend integration - import useAuthStore for user ID
// import { useAuthStore } from '@/stores/authStore'

// TODO: Backend integration - replace with actual API endpoints
// const ATTENDANCE_ENDPOINTS = {
//   save: '/attendance',
//   getByDate: '/attendance/date',
//   getHistory: '/attendance/history',
//   getStudents: '/attendance/students',
//   export: '/attendance/export',
// }

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | null

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  gradeLevel: number
}

interface AttendanceHistoryEntry {
  date: string
  totalStudents: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// Simulated data
const SIMULATED_STUDENTS: Student[] = [
  { id: '1', firstName: 'María', lastName: 'García', email: 'maria.garcia@escuela.edu', gradeLevel: 3 },
  { id: '2', firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos.rodriguez@escuela.edu', gradeLevel: 3 },
  { id: '3', firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@escuela.edu', gradeLevel: 3 },
  { id: '4', firstName: 'José', lastName: 'López', email: 'jose.lopez@escuela.edu', gradeLevel: 3 },
  { id: '5', firstName: 'Sofía', lastName: 'Hernández', email: 'sofia.hernandez@escuela.edu', gradeLevel: 3 },
  { id: '6', firstName: 'Diego', lastName: 'González', email: 'diego.gonzalez@escuela.edu', gradeLevel: 3 },
  { id: '7', firstName: 'Valentina', lastName: 'Pérez', email: 'valentina.perez@escuela.edu', gradeLevel: 3 },
  { id: '8', firstName: 'Andrés', lastName: 'Sánchez', email: 'andres.sanchez@escuela.edu', gradeLevel: 3 },
  { id: '9', firstName: 'Isabella', lastName: 'Ramírez', email: 'isabella.ramirez@escuela.edu', gradeLevel: 3 },
  { id: '10', firstName: 'Mateo', lastName: 'Torres', email: 'mateo.torres@escuela.edu', gradeLevel: 3 },
]

function generateHistoryData(): AttendanceHistoryEntry[] {
  const entries: AttendanceHistoryEntry[] = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const total = SIMULATED_STUDENTS.length
    const present = Math.floor(Math.random() * 4) + total - 4
    const absent = Math.floor(Math.random() * 2)
    const late = Math.floor(Math.random() * 2)
    const excused = total - present - absent - late

    entries.push({
      date: date.toISOString().split('T')[0],
      totalStudents: total,
      present,
      absent,
      late,
      excused: Math.max(0, excused),
      percentage: Math.round((present / total) * 100),
    })
  }
  return entries.reverse()
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateDisplay(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function AttendancePage() {
  const { toast } = useToast()
  // TODO: Backend integration - use user.id for attendance records
  // const user = useAuthStore((state) => state.user)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [students] = useState<Student[]>(SIMULATED_STUDENTS)
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('tomar')

  useEffect(() => {
    setHistory(generateHistoryData())
  }, [])

  useEffect(() => {
    // TODO: Backend integration - fetch existing attendance for selected date
    // const fetchAttendance = async () => {
    //   try {
    //     const response = await api.get(`/attendance/date/${formatDate(selectedDate)}`)
    //     const records = response.data.data
    //     const attMap: Record<string, AttendanceStatus> = {}
    //     records.forEach((r: AttendanceRecord) => { attMap[r.studentId] = r.status })
    //     setAttendance(attMap)
    //   } catch (error) {
    //     console.error('Error fetching attendance:', error)
    //   }
    // }
    // fetchAttendance()

    // Reset attendance when date changes (simulated)
    setAttendance({})
  }, [selectedDate])

  const markAll = useCallback((status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceStatus> = {}
    students.forEach((student) => {
      newAttendance[student.id] = status
    })
    setAttendance(newAttendance)
  }, [students])

  const setStudentAttendance = useCallback((studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: prev[studentId] === status ? null : status }))
  }, [])

  const getStats = useCallback(() => {
    let present = 0
    let absent = 0
    let late = 0
    let excused = 0
    let unmarked = 0

    students.forEach((student) => {
      const status = attendance[student.id]
      if (status === 'present') present++
      else if (status === 'absent') absent++
      else if (status === 'late') late++
      else if (status === 'excused') excused++
      else unmarked++
    })

    return { present, absent, late, excused, unmarked, total: students.length }
  }, [students, attendance])

  const handleSaveAttendance = async () => {
    const stats = getStats()
    if (stats.unmarked > 0) {
      toast({
        title: 'Estudiantes sin marcar',
        description: `Hay ${stats.unmarked} estudiante(s) sin asistencia marcada.`,
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    setSaveDialogOpen(true)

    try {
      // TODO: Backend integration - save attendance to server
      // await api.post('/attendance', {
      //   date: formatDate(selectedDate),
      //   records: Object.entries(attendance).map(([studentId, status]) => ({
      //     studentId,
      //     status,
      //   })),
      //   teacherId: user?.id,
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: 'Asistencia guardada',
        description: `Se guardó la asistencia del ${formatDateDisplay(selectedDate)} correctamente.`,
      })

      // Update history
      const newEntry: AttendanceHistoryEntry = {
        date: formatDate(selectedDate),
        totalStudents: stats.total,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        excused: stats.excused,
        percentage: Math.round((stats.present / stats.total) * 100),
      }
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.date !== newEntry.date)
        return [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date))
      })
    } catch (error) {
      // TODO: Backend integration - handle real error
      toast({
        title: 'Error al guardar',
        description: 'Hubo un error al guardar la asistencia. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportReport = () => {
    // TODO: Backend integration - generate real CSV/XLSX export
    const csvHeader = 'Fecha,Estudiante,Estado\n'
    const csvRows = students.map((s) => {
      const status = attendance[s.id] || 'Sin marcar'
      const statusLabel =
        status === 'present'
          ? 'Presente'
          : status === 'absent'
            ? 'Ausente'
            : status === 'late'
              ? 'Tardanza'
              : status === 'excused'
                ? 'Justificado'
                : 'Sin marcar'
      return `${formatDate(selectedDate)},${s.firstName} ${s.lastName},${statusLabel}`
    }).join('\n')

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `asistencia_${formatDate(selectedDate)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Reporte descargado',
      description: 'El archivo CSV de asistencia se descargó correctamente.',
    })
  }

  const navigateMonth = (direction: number) => {
    let newMonth = calendarMonth + direction
    let newYear = calendarYear
    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }
    setCalendarMonth(newMonth)
    setCalendarYear(newYear)
  }

  const selectDay = (day: number) => {
    const newDate = new Date(calendarYear, calendarMonth, day)
    setSelectedDate(newDate)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      calendarMonth === today.getMonth() &&
      calendarYear === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      calendarMonth === selectedDate.getMonth() &&
      calendarYear === selectedDate.getFullYear()
    )
  }

  const stats = getStats()
  const today = new Date()
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth)
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth)

  // TODO: Backend integration - use getStatusBadge for history/detail views
  // const getStatusBadge = (status: AttendanceStatus) => {
  //   if (!status) return <Badge variant="outline">Sin marcar</Badge>
  //   switch (status) {
  //     case 'present':
  //       return <Badge className="bg-green-500 hover:bg-green-600">Presente</Badge>
  //     case 'absent':
  //       return <Badge variant="destructive">Ausente</Badge>
  //     case 'late':
  //       return <Badge className="bg-amber-500 hover:bg-amber-600">Tardanza</Badge>
  //     case 'excused':
  //       return <Badge className="bg-blue-500 hover:bg-blue-600">Justificado</Badge>
  //   }
  // }

  const renderCalendar = () => {
    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) calendarDays.push(null)
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day)
    while (calendarDays.length % 7 !== 0) calendarDays.push(null)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {MONTHS_ES[calendarMonth]} {calendarYear}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_ES.map((day) => (
              <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                disabled={!day}
                onClick={() => day && selectDay(day)}
                className={`
                  h-10 rounded-md text-sm font-medium transition-all
                  ${!day ? 'invisible' : ''}
                  ${day && isSelected(day)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : day && isToday(day)
                      ? 'ring-2 ring-primary bg-primary/10'
                      : day && selectedDate.getDay() !== 0 && selectedDate.getDay() !== 6
                        ? 'hover:bg-muted cursor-pointer'
                        : day ? 'text-muted-foreground' : ''
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              <Calendar className="h-4 w-4 inline mr-1" />
              Fecha seleccionada: <strong>{formatDateDisplay(selectedDate)}</strong>
            </p>
            {selectedDate > today && (
              <p className="text-xs text-amber-600 text-center mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Fecha futura - solo se permite marcar asistencia para hoy o días pasados
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStudentRow = (student: Student) => (
    <div
      key={student.id}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {student.firstName[0]}{student.lastName[0]}
          </span>
        </div>
        <div>
          <p className="font-medium">{student.firstName} {student.lastName}</p>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStudentAttendance(student.id, 'present')}
          className={attendance[student.id] === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Presente
        </Button>
        <Button
          variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStudentAttendance(student.id, 'absent')}
          className={attendance[student.id] === 'absent' ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Ausente
        </Button>
        <Button
          variant={attendance[student.id] === 'late' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStudentAttendance(student.id, 'late')}
          className={attendance[student.id] === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
        >
          <Clock className="h-4 w-4 mr-1" />
          Tardanza
        </Button>
        <Button
          variant={attendance[student.id] === 'excused' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStudentAttendance(student.id, 'excused')}
          className={attendance[student.id] === 'excused' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Justificado
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground">
            Registra y da seguimiento a la asistencia de tus estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleSaveAttendance} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tomar" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tomar Asistencia
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tomar Asistencia */}
        <TabsContent value="tomar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              {renderCalendar()}
            </div>

            {/* Students list */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick actions */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium mr-2">Marcar todos:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAll('present')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Presentes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAll('absent')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Ausentes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAll(null)}
                    >
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-xs text-muted-foreground">Presentes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <XCircle className="h-5 w-5 mx-auto text-red-500 mb-1" />
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-xs text-muted-foreground">Ausentes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                    <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
                    <p className="text-xs text-muted-foreground">Tardanzas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                    <p className="text-xs text-muted-foreground">Justificados</p>
                  </CardContent>
                </Card>
              </div>

              {stats.unmarked > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    <strong>{stats.unmarked}</strong> estudiante(s) sin marcar
                  </p>
                </div>
              )}

              {/* Student list */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {students.length} estudiantes
                  </span>
                </div>
                {students.map(renderStudentRow)}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Asistencia
              </CardTitle>
              <CardDescription>
                Registro de asistencia de los últimos 14 días hábiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((entry) => {
                    const entryDate = new Date(entry.date + 'T12:00:00')
                    return (
                      <div
                        key={entry.date}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{formatDateDisplay(entryDate)}</p>
                            <p className="text-xs text-muted-foreground">
                              {DAYS_ES[entryDate.getDay()]}, {entry.totalStudents} estudiantes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Badge className="bg-green-500">{entry.present}</Badge>
                            <span className="text-xs text-muted-foreground">P</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="destructive">{entry.absent}</Badge>
                            <span className="text-xs text-muted-foreground">A</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className="bg-amber-500">{entry.late}</Badge>
                            <span className="text-xs text-muted-foreground">T</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className="bg-blue-500">{entry.excused}</Badge>
                            <span className="text-xs text-muted-foreground">J</span>
                          </div>
                          <div className="ml-2">
                            <span className={`text-sm font-bold ${entry.percentage >= 90
                              ? 'text-green-600'
                              : entry.percentage >= 75
                                ? 'text-amber-600'
                                : 'text-red-600'
                              }`}>
                              {entry.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Sin historial</h3>
                  <p className="text-muted-foreground">
                    Aún no hay registros de asistencia. Comienza tomando asistencia.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Reportes */}
        <TabsContent value="reportes" className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Promedio Asistencia</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {history.length > 0
                    ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / history.length)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">Últimos 14 días hábiles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Presentes</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {history.reduce((acc, h) => acc + h.present, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Ausentes</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {history.reduce((acc, h) => acc + h.absent, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tardanzas</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {history.reduce((acc, h) => acc + h.late, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-student summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Resumen por Estudiante
              </CardTitle>
              <CardDescription>
                Estadísticas simuladas de asistencia individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* TODO: Backend integration - fetch real per-student attendance stats */}
                {students.map((student) => {
                  const simulatedPresent = Math.floor(Math.random() * 5) + 8
                  const simulatedTotal = 14
                  const pct = Math.round((simulatedPresent / simulatedTotal) * 100)
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {simulatedPresent}/{simulatedTotal} días asistidos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Asistencia</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 90
                                ? 'bg-green-500'
                                : pct >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                                }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <Badge
                          variant={pct >= 90 ? 'default' : pct >= 75 ? 'secondary' : 'destructive'}
                          className={
                            pct >= 90
                              ? 'bg-green-500'
                              : pct >= 75
                                ? 'bg-amber-500'
                                : ''
                          }
                        >
                          {pct >= 90 ? 'Excelente' : pct >= 75 ? 'Regular' : 'Deficiente'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Export actions */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Reportes</CardTitle>
              <CardDescription>
                Descarga reportes de asistencia en diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={handleExportReport}>
                  <Download className="h-5 w-5" />
                  <span>Asistencia del Día (CSV)</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    // TODO: Backend integration - export full history
                    toast({
                      title: 'Función próximamente',
                      description: 'La exportación de historial completo estará disponible pronto.',
                    })
                  }}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Historial Completo (XLSX)</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    // TODO: Backend integration - export per-student report
                    toast({
                      title: 'Función próximamente',
                      description: 'El reporte por estudiante estará disponible pronto.',
                    })
                  }}
                >
                  <Users className="h-5 w-5" />
                  <span>Reporte por Estudiante</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save confirmation dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Asistencia Guardada
            </DialogTitle>
            <DialogDescription>
              La asistencia del {formatDateDisplay(selectedDate)} se ha registrado correctamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-green-700">Presentes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="h-6 w-6 mx-auto text-red-500 mb-1" />
              <p className="text-xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-red-700">Ausentes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold text-amber-600">{stats.late}</p>
              <p className="text-xs text-amber-700">Tardanzas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Calendar className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold text-blue-600">{stats.excused}</p>
              <p className="text-xs text-blue-700">Justificados</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSaveDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

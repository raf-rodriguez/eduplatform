import { useState, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MapPin,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

// TODO: Replace with actual API integration
// import api from '@/services/api'

// --- Types ---

interface ClassSession {
  id: string
  subject: string
  subjectColor: string
  grade: string
  room?: string
  dayOfWeek: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string // "HH:MM" 24h
  endTime: string // "HH:MM" 24h
  recurring: boolean
}

interface UpcomingEvent {
  id: string
  title: string
  date: string // "YYYY-MM-DD"
  time: string
  type: 'exam' | 'assignment' | 'meeting' | 'holiday'
}

// --- Color palette for subjects ---

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  matematicas: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', badge: 'bg-blue-500' },
  espanol: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  ciencias: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', badge: 'bg-amber-500' },
  ingles: { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800', badge: 'bg-violet-500' },
  historia: { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', badge: 'bg-rose-500' },
  arte: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', badge: 'bg-pink-500' },
  educacion_fisica: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-500' },
  tecnologia: { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-800', badge: 'bg-cyan-500' },
}

const SUBJECT_OPTIONS = [
  { value: 'matematicas', label: 'Matemáticas' },
  { value: 'espanol', label: 'Español' },
  { value: 'ciencias', label: 'Ciencias' },
  { value: 'ingles', label: 'Inglés' },
  { value: 'historia', label: 'Historia' },
  { value: 'arte', label: 'Arte' },
  { value: 'educacion_fisica', label: 'Educación Física' },
  { value: 'tecnologia', label: 'Tecnología' },
]

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const HOURS = Array.from({ length: 9 }, (_, i) => i + 8) // 8am - 4pm (index 8 = 16:00)

const INITIAL_CLASSES: ClassSession[] = [
  // Solo las clases de ESTE maestro (en producción vienen de la API)
  { id: '1', subject: 'espanol', subjectColor: 'espanol', grade: 'Español 7mo', room: 'Aula 205', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', recurring: true },
  { id: '3', subject: 'espanol', subjectColor: 'espanol', grade: 'Español 7mo', room: 'Aula 205', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', recurring: true },
  { id: '5', subject: 'espanol', subjectColor: 'espanol', grade: 'Español 8vo', room: 'Aula 206', dayOfWeek: 3, startTime: '09:00', endTime: '10:30', recurring: true },
  { id: '7', subject: 'espanol', subjectColor: 'espanol', grade: 'Español 7mo', room: 'Aula 205', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', recurring: true },
  { id: '9', subject: 'espanol', subjectColor: 'espanol', grade: 'Español 9no', room: 'Aula 207', dayOfWeek: 5, startTime: '10:00', endTime: '11:30', recurring: true },
]

const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'e1', title: 'Examen de Español 7mo', date: '2026-04-06', time: '08:00', type: 'exam' },
  { id: 'e2', title: 'Entrega de Ensayo - 8vo', date: '2026-04-08', time: '09:00', type: 'assignment' },
  { id: 'e3', title: 'Reunión de Padres', date: '2026-04-10', time: '15:00', type: 'meeting' },
  { id: 'e4', title: 'Día Festivo - No hay clases', date: '2026-04-14', time: '00:00', type: 'holiday' },
  { id: 'e5', title: 'Examen de Comprensión 9no', date: '2026-04-15', time: '10:00', type: 'exam' },
  { id: 'e6', title: 'Feria de Literatura', date: '2026-04-20', time: '09:00', type: 'meeting' },
]

const EVENT_TYPE_CONFIG = {
  exam: { label: 'Examen', color: 'bg-red-100 text-red-800 border-red-300' },
  assignment: { label: 'Entrega', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  meeting: { label: 'Reunión', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  holiday: { label: 'Día Festivo', color: 'bg-gray-100 text-gray-800 border-gray-300' },
}

// --- Helpers ---

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatDateFull(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getSubjectLabel(value: string): string {
  return SUBJECT_OPTIONS.find((o) => o.value === value)?.label || value
}

// --- Component ---

export default function ClassCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<ClassSession[]>(INITIAL_CLASSES)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null)
  const [activeTab, setActiveTab] = useState('semanal')

  // Form state
  const [formSubject, setFormSubject] = useState('matematicas')
  const [formGrade, setFormGrade] = useState('')
  const [formRoom, setFormRoom] = useState('')
  const [formDay, setFormDay] = useState('1')
  const [formStartTime, setFormStartTime] = useState('08:00')
  const [formEndTime, setFormEndTime] = useState('09:30')

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate])
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])

  const weekLabel = useMemo(() => {
    const start = weekDates[0]
    const end = weekDates[4]
    const startMonth = start.toLocaleDateString('es-ES', { month: 'long' })
    const endMonth = end.toLocaleDateString('es-ES', { month: 'long' })
    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth} ${start.getFullYear()}`
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`
  }, [weekDates])

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const resetForm = () => {
    setFormSubject('matematicas')
    setFormGrade('')
    setFormRoom('')
    setFormDay('1')
    setFormStartTime('08:00')
    setFormEndTime('09:30')
    setEditingSession(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (session: ClassSession) => {
    setEditingSession(session)
    setFormSubject(session.subject)
    setFormGrade(session.grade)
    setFormRoom(session.room || '')
    setFormDay(String(session.dayOfWeek))
    setFormStartTime(session.startTime)
    setFormEndTime(session.endTime)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // TODO: Send to backend API
    // await api.post('/schedule', { ... })
    if (editingSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSession.id
            ? {
              ...s,
              subject: formSubject,
              grade: formGrade,
              room: formRoom,
              dayOfWeek: Number(formDay),
              startTime: formStartTime,
              endTime: formEndTime,
            }
            : s
        )
      )
    } else {
      const newSession: ClassSession = {
        id: Date.now().toString(),
        subject: formSubject,
        subjectColor: formSubject,
        grade: formGrade,
        room: formRoom,
        dayOfWeek: Number(formDay),
        startTime: formStartTime,
        endTime: formEndTime,
        recurring: true,
      }
      setSessions((prev) => [...prev, newSession])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    // TODO: Send delete to backend API
    // await api.delete(`/schedule/${id}`)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setIsDialogOpen(false)
    resetForm()
  }

  // Classes grouped by (dayIndex, hour) for the weekly grid
  const classesBySlot = useMemo(() => {
    const map: Record<string, ClassSession[]> = {}
    sessions.forEach((s) => {
      const startHour = parseInt(s.startTime.split(':')[0])
      const key = `${s.dayOfWeek}-${startHour}`
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [sessions])

  const today = formatDateFull(new Date())
  const todayDayOfWeek = new Date().getDay() // 0=Sun

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...UPCOMING_EVENTS].sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  // Flattened class list for the "Lista de Clases" tab
  const sortedClasses = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })
  }, [sessions])

  const colors = SUBJECT_COLORS[formSubject] || SUBJECT_COLORS.matematicas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Calendario de Clases
          </h1>
          <p className="text-muted-foreground">Gestiona tu horario semanal</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Clase
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="lista">Lista de Clases</TabsTrigger>
          <TabsTrigger value="eventos">Próximos Eventos</TabsTrigger>
        </TabsList>

        {/* ---- SEMANAL TAB ---- */}
        <TabsContent value="semanal" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{weekLabel}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-6 border-b" style={{ gridTemplateColumns: '70px repeat(5, 1fr)' }}>
                    <div className="p-2 text-xs font-medium text-muted-foreground text-center border-r">
                      Hora
                    </div>
                    {weekDates.map((date, i) => {
                      const dateStr = formatDateFull(date)
                      const isToday = dateStr === today
                      return (
                        <div
                          key={i}
                          className={`p-2 text-center border-r last:border-r-0 ${isToday ? 'bg-primary/5' : ''
                            }`}
                        >
                          <div className="text-xs font-medium text-muted-foreground">
                            {DAY_SHORT[i]}
                          </div>
                          <div
                            className={`text-lg font-bold mt-0.5 ${isToday
                              ? 'rounded-full w-8 h-8 flex items-center justify-center mx-auto bg-primary text-primary-foreground'
                              : ''
                              }`}
                          >
                            {date.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time slots */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-6 border-b last:border-b-0"
                      style={{ gridTemplateColumns: '70px repeat(5, 1fr)' }}
                    >
                      <div className="p-2 text-xs font-medium text-muted-foreground text-center border-r flex items-center justify-center">
                        {formatTimeDisplay(`${hour.toString().padStart(2, '0')}:00`)}
                      </div>
                      {weekDates.map((_, dayIdx) => {
                        const dayNum = dayIdx + 1 // Mon=1..Fri=5
                        const key = `${dayNum}-${hour}`
                        const slotClasses = classesBySlot[key] || []
                        return (
                          <div
                            key={dayIdx}
                            className="p-1 border-r last:border-r-0 min-h-[60px] relative"
                          >
                            {slotClasses.map((cls) => {
                              const c = SUBJECT_COLORS[cls.subjectColor] || SUBJECT_COLORS.matematicas
                              return (
                                <button
                                  key={cls.id}
                                  onClick={() => openEditDialog(cls)}
                                  className={`w-full text-left rounded-md p-2 mb-1 border-l-4 ${c.bg} ${c.border} hover:shadow-md transition-shadow cursor-pointer`}
                                >
                                  <div className={`text-xs font-semibold ${c.text} truncate`}>
                                    {getSubjectLabel(cls.subject)}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    {cls.grade}
                                  </div>
                                  {cls.room && (
                                    <div className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5 mt-0.5">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {cls.room}
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events Sidebar (inline below calendar) */}
          <div className="grid gap-4 mt-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5" />
                  Resumen del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions
                    .filter((s) => s.dayOfWeek === (new Date().getDay() || 7))
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((cls) => {
                      const c = SUBJECT_COLORS[cls.subjectColor] || SUBJECT_COLORS.matematicas
                      return (
                        <div
                          key={cls.id}
                          className={`rounded-lg border-l-4 p-3 ${c.bg} ${c.border}`}
                        >
                          <div className={`font-semibold text-sm ${c.text}`}>
                            {getSubjectLabel(cls.subject)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeDisplay(cls.startTime)} - {formatTimeDisplay(cls.endTime)}
                          </div>
                          {cls.room && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cls.room}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  {sessions.filter((s) => s.dayOfWeek === (new Date().getDay() || 7)).length === 0 && (
                    <div className="col-span-full text-center py-6 text-muted-foreground">
                      No hay clases programadas para hoy
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedEvents.slice(0, 4).map((event) => {
                    const cfg = EVENT_TYPE_CONFIG[event.type]
                    const eventDate = new Date(event.date + 'T12:00:00')
                    return (
                      <div key={event.id} className="flex items-start gap-3">
                        <div
                          className={`rounded-lg border px-2 py-1.5 text-center min-w-[48px] ${cfg.color}`}
                        >
                          <div className="text-xs font-bold">{eventDate.getDate()}</div>
                          <div className="text-[10px] uppercase">
                            {eventDate.toLocaleDateString('es-ES', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {event.time !== '00:00' ? formatTimeDisplay(event.time) : 'Todo el día'}
                          </div>
                          <Badge variant="outline" className={`mt-1 text-[10px] ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- LISTA DE CLASES TAB ---- */}
        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lista de Clases Semanal
                </CardTitle>
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedClasses.length > 0 ? (
                <div className="space-y-3">
                  {DAY_NAMES.map((dayName, idx) => {
                    const dayNum = idx + 1
                    const dayClasses = sortedClasses.filter((s) => s.dayOfWeek === dayNum)
                    if (dayClasses.length === 0) return null
                    return (
                      <div key={dayName}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {dayName}
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {dayClasses.map((cls) => {
                            const c = SUBJECT_COLORS[cls.subjectColor] || SUBJECT_COLORS.matematicas
                            return (
                              <Card
                                key={cls.id}
                                className={`border-l-4 ${c.border} cursor-pointer hover:shadow-md transition-shadow`}
                                onClick={() => openEditDialog(cls)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <Badge
                                        className={`mb-1.5 ${c.badge} text-white border-0`}
                                      >
                                        {getSubjectLabel(cls.subject)}
                                      </Badge>
                                      <div className="text-sm font-medium truncate">
                                        {cls.grade}
                                      </div>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {formatTimeDisplay(cls.startTime)} -{' '}
                                          {formatTimeDisplay(cls.endTime)}
                                        </span>
                                      </div>
                                      {cls.room && (
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {cls.room}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openEditDialog(cls)
                                        }}
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDelete(cls.id)
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No hay clases registradas</p>
                  <p className="text-sm mt-1">Agrega tu primera clase para comenzar</p>
                  <Button className="mt-4" onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Clase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- PRÓXIMOS EVENTOS TAB ---- */}
        <TabsContent value="eventos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedEvents.length > 0 ? (
                <div className="space-y-4">
                  {sortedEvents.map((event) => {
                    const cfg = EVENT_TYPE_CONFIG[event.type]
                    const eventDate = new Date(event.date + 'T12:00:00')
                    const isPast = event.date < today
                    return (
                      <div
                        key={event.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${isPast ? 'opacity-60' : 'hover:bg-muted/50'
                          }`}
                      >
                        <div
                          className={`rounded-xl border-2 px-3 py-2 text-center min-w-[60px] ${cfg.color}`}
                        >
                          <div className="text-xl font-bold">{eventDate.getDate()}</div>
                          <div className="text-[10px] uppercase font-medium">
                            {eventDate.toLocaleDateString('es-ES', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{event.title}</h3>
                            <Badge variant="outline" className={cfg.color}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time !== '00:00' ? formatTimeDisplay(event.time) : 'Todo el día'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {eventDate.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No hay eventos próximos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---- ADD / EDIT DIALOG ---- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingSession ? (
                <>
                  <Edit className="h-5 w-5" />
                  Editar Clase
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Nueva Clase
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingSession
                ? 'Modifica los detalles de la clase'
                : 'Agrega una nueva clase a tu horario semanal'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Subject */}
            <div className="grid gap-2">
              <Label htmlFor="subject">Materia</Label>
              <Select value={formSubject} onValueChange={setFormSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade */}
            <div className="grid gap-2">
              <Label htmlFor="grade">Grado y Sección</Label>
              <Input
                id="grade"
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                placeholder="Ej: 3er Grado - Sección A"
              />
            </div>

            {/* Room */}
            <div className="grid gap-2">
              <Label htmlFor="room" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Aula / Salón
              </Label>
              <Input
                id="room"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="Ej: Aula 101"
              />
            </div>

            {/* Day */}
            <div className="grid gap-2">
              <Label htmlFor="day">Día de la Semana</Label>
              <Select value={formDay} onValueChange={setFormDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((name, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Hora Inicio
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Hora Fin
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Color preview */}
            <div className="flex items-center gap-2 pt-2">
              <div className={`w-4 h-4 rounded-full ${colors.badge}`} />
              <span className="text-sm text-muted-foreground">
                Color: {getSubjectLabel(formSubject)}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {editingSession && (
              <Button
                variant="destructive"
                className="mr-auto"
                onClick={() => handleDelete(editingSession.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingSession ? 'Guardar Cambios' : 'Agregar Clase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

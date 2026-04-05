import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Clock, Check, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ScheduleItem {
  id: string
  day: string
  time: string
  subject: string
  duration: number
  completed: boolean
}

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const subjects = [
  'Español', 'Matemáticas', 'Ciencia', 'Historia',
  'Inglés', 'Inglés Conversacional', 'Robótica', 'Finanzas', 'Salud'
]

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export default function StudySchedule() {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('study-schedule')
    return saved ? JSON.parse(saved) : []
  })
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({ day: days[0], time: '08:00', subject: subjects[0], duration: 45 })

  const saveSchedule = (updated: ScheduleItem[]) => {
    setSchedule(updated)
    localStorage.setItem('study-schedule', JSON.stringify(updated))
  }

  const addScheduleItem = () => {
    const item: ScheduleItem = {
      id: Date.now().toString(),
      ...newItem,
      completed: false,
    }
    saveSchedule([...schedule, item])
    setIsAdding(false)
    setNewItem({ day: days[0], time: '08:00', subject: subjects[0], duration: 45 })
    toast({ title: 'Horario actualizado', description: `Sesión de ${newItem.subject} agregada.` })
  }

  const removeScheduleItem = (id: string) => {
    saveSchedule(schedule.filter((s) => s.id !== id))
    toast({ title: 'Sesión eliminada', description: 'La sesión fue removida del horario.' })
  }

  const toggleComplete = (id: string) => {
    saveSchedule(
      schedule.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }

  const getScheduleByDay = (day: string) =>
    schedule
      .filter((s) => s.day === day)
      .sort((a, b) => a.time.localeCompare(b.time))

  const getCompletionStats = () => {
    const total = schedule.length
    const completed = schedule.filter((s) => s.completed).length
    const percentage = total > 0 ? (completed / total) * 100 : 0
    return { total, completed, percentage }
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Horario de Estudio</h1>
          <p className="text-muted-foreground">Planifica tu semana de aprendizaje</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Sesión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Sesiones Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.percentage.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Sesión de Estudio</CardTitle>
            <CardDescription>Configura una nueva sesión en tu horario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="day">Día</Label>
                <select
                  id="day"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newItem.day}
                  onChange={(e) => setNewItem({ ...newItem, day: e.target.value })}
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="time">Hora</Label>
                <select
                  id="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newItem.time}
                  onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="subject">Materia</Label>
                <select
                  id="subject"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newItem.subject}
                  onChange={(e) => setNewItem({ ...newItem, subject: e.target.value })}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Duración (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  max={120}
                  step={15}
                  value={newItem.duration}
                  onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) || 45 })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={addScheduleItem}>
                <Plus className="mr-2 h-4 w-4" /> Agregar
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {days.map((day) => {
          const items = getScheduleByDay(day)
          if (items.length === 0) return null

          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        item.completed
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {item.completed && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.time} · {item.duration} min
                        </p>
                      </div>
                      <button
                        onClick={() => removeScheduleItem(item.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {schedule.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tu horario está vacío</h3>
            <p className="text-muted-foreground text-center mb-4">
              Agrega sesiones de estudio para organizar tu semana
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Crear mi horario
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

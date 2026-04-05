import { useState, useEffect, useCallback } from 'react'
import { Users, BookOpen, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

export default function TeacherAssignments() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ teacherId: '', subjectId: '', gradeId: '' })
  const [creating, setCreating] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [assignRes, teachersRes, subjectsRes, gradesRes] = await Promise.all([
        api.get('/teachers/assignments'),
        api.get('/users?role=TEACHER&limit=100'),
        api.get('/content/grades'),
        api.get('/content/grades'),
      ])
      setAssignments(assignRes.data.data)
      setTeachers(teachersRes.data.data.users || [])
      setSubjects(gradesRes.data.data.flatMap((g: any) => g.subjects.map((s: any) => ({ ...s, gradeName: g.name, gradeId: g.id }))))
      setGrades(gradesRes.data.data)
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos', variant: 'destructive' })
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    if (!form.teacherId || !form.subjectId || !form.gradeId) {
      toast({ title: 'Error', description: 'Completa todos los campos', variant: 'destructive' })
      return
    }
    setCreating(true)
    try {
      await api.post('/teachers/assignments', {
        teacherId: form.teacherId,
        subjectId: form.subjectId,
        gradeId: form.gradeId,
      })
      toast({ title: 'Éxito', description: 'Maestro asignado' })
      setShowDialog(false)
      setForm({ teacherId: '', subjectId: '', gradeId: '' })
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' })
    } finally { setCreating(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/teachers/assignments/${deleteId}`)
      toast({ title: 'Éxito', description: 'Asignación eliminada' })
      setDeleteId(null)
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  // Group assignments by teacher
  const byTeacher: Record<string, any[]> = {}
  assignments.forEach(a => {
    const key = a.teacher.id
    if (!byTeacher[key]) byTeacher[key] = []
    byTeacher[key].push(a)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-7 w-7 text-primary" /></div>
            Asignación de Maestros
          </h1>
          <p className="text-muted-foreground mt-1">Asigna maestros a materias y grados específicos</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />Nueva Asignación
        </Button>
      </div>

      {loading ? (<div className="text-center py-12 text-muted-foreground">Cargando...</div>)
        : Object.keys(byTeacher).length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Sin asignaciones</h3>
            <p className="text-sm">Asigna un maestro para comenzar</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {Object.entries(byTeacher).map(([teacherId, assigns]) => {
              const teacher = assigns[0]?.teacher
              return (
                <Card key={teacherId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
                      </div>
                      <div>
                        {teacher?.firstName} {teacher?.lastName}
                        <p className="text-sm text-muted-foreground font-normal">{teacher?.email}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {assigns.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 group">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{a.subject.name}</span>
                          <span className="text-muted-foreground">→</span>
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{a.grade.name}</span>
                          <button
                            onClick={() => setDeleteId(a.id)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                            title="Eliminar asignación"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Asignación</DialogTitle><DialogDescription>Asigna un maestro a una materia y grado.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Maestro</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm(p => ({ ...p, teacherId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona maestro" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Grado</Label>
              <Select value={form.gradeId} onValueChange={(v) => setForm(p => ({ ...p, gradeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona grado" /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Materia</Label>
              <Select value={form.subjectId} onValueChange={(v) => setForm(p => ({ ...p, subjectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona materia" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.gradeName})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating}>{creating ? 'Asignando...' : 'Asignar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará esta asignación de maestro.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

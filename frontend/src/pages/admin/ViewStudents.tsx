import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Key, Ban, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import api from '@/services/api'
import { getInitials } from '@/lib/utils'

const gradeLabels: Record<number, string> = {
  0: 'Pre-Kínder', 1: 'Kínder', 2: '1er Grado', 3: '2do Grado', 4: '3er Grado',
  5: '4to Grado', 6: '5to Grado', 7: '6to Grado', 8: '7mo Grado', 9: '8vo Grado',
  10: '9no Grado', 11: '10mo Grado', 12: '11vo Grado', 13: '12vo Grado',
}

export default function ViewStudents() {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Reset password dialog
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Deactivate dialog
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      const res = await api.get('/users/students', { params })
      setStudents(res.data.data.students)
      setTotal(res.data.data.pagination.total)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los estudiantes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleResetPassword = async () => {
    if (!resetUserId || newPassword.length < 8) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 8 caracteres', variant: 'destructive' })
      return
    }
    setResetLoading(true)
    try {
      await api.post(`/users/${resetUserId}/reset-password`, { newPassword })
      toast({ title: 'Éxito', description: 'Contraseña reseteada correctamente' })
      setResetUserId(null)
      setNewPassword('')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error al resetear', variant: 'destructive' })
    } finally {
      setResetLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateId) return
    setDeactivateLoading(true)
    try {
      await api.delete(`/users/${deactivateId}`)
      toast({ title: 'Éxito', description: 'Estudiante desactivado' })
      setDeactivateId(null)
      fetchStudents()
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar', variant: 'destructive' })
    } finally {
      setDeactivateLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-7 w-7 text-primary" />
            </div>
            Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">
            {total} estudiantes registrados
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setPage(1); fetchStudents() }}>Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron estudiantes</h3>
              <p className="text-muted-foreground">Intenta con otra búsqueda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${!student.isActive ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatarUrl} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {student.name}
                        {!student.isActive && (
                          <Badge variant="secondary" className="text-xs">Desactivado</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {gradeLabels[student.gradeLevel] || 'Sin grado'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setResetUserId(student.id); setNewPassword('') }}
                        title="Resetear contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeactivateId(student.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title={student.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {student.isActive ? <Ban className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {students.length} de {total} estudiantes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Página {page} de {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUserId} onOpenChange={(open) => !open && setResetUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa la nueva contraseña para este estudiante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Nueva contraseña (mínimo 8 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUserId(null)}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? 'Reseteando...' : 'Resetear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la cuenta del estudiante. El estudiante no podrá acceder a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivateLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {deactivateLoading ? 'Procesando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

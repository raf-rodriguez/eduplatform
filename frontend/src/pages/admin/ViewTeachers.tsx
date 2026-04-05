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

export default function ViewTeachers() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      const res = await api.get('/users/teachers', { params })
      setTeachers(res.data.data.teachers)
      setTotal(res.data.data.pagination.total)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los maestros', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])

  const handleResetPassword = async () => {
    if (!resetUserId || newPassword.length < 8) {
      toast({ title: 'Error', description: 'Mínimo 8 caracteres', variant: 'destructive' })
      return
    }
    setResetLoading(true)
    try {
      await api.post(`/users/${resetUserId}/reset-password`, { newPassword })
      toast({ title: 'Éxito', description: 'Contraseña reseteada' })
      setResetUserId(null)
      setNewPassword('')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' })
    } finally {
      setResetLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateId) return
    setDeactivateLoading(true)
    try {
      await api.delete(`/users/${deactivateId}`)
      toast({ title: 'Éxito', description: 'Maestro desactivado' })
      setDeactivateId(null)
      fetchTeachers()
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar', variant: 'destructive' })
    } finally {
      setDeactivateLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-7 w-7 text-primary" />
            </div>
            Maestros
          </h1>
          <p className="text-muted-foreground mt-1">{total} maestros registrados</p>
        </div>
      </div>

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
            <Button onClick={() => { setPage(1); fetchTeachers() }}>Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron maestros</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    !teacher.isActive ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={teacher.avatarUrl} />
                      <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {teacher.name}
                        {!teacher.isActive && (
                          <Badge variant="secondary" className="text-xs">Desactivado</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setResetUserId(teacher.id); setNewPassword('') }}
                      title="Resetear contraseña"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeactivateId(teacher.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title={teacher.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {teacher.isActive ? <Ban className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {teachers.length} de {total} maestros
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Página {page} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
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
            <DialogDescription>Ingresa la nueva contraseña para este maestro.</DialogDescription>
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
              Esta acción desactivará la cuenta del maestro. No podrá acceder a la plataforma.
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

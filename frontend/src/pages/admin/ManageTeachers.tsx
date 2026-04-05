import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Key, Ban, Eye, ChevronLeft, ChevronRight, Edit, Download, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'
import { getInitials } from '@/lib/utils'

export default function ManageTeachers() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const [resetId, setResetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [editLoading, setEditLoading] = useState(false)

  // Quick create
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [createLoading, setCreateLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      const res = await api.get('/users/teachers', { params })
      setTeachers(res.data.data.teachers)
      setTotal(res.data.data.pagination.total)
    } catch { toast({ title: 'Error', description: 'No se pudieron cargar', variant: 'destructive' }) }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleResetPassword = async () => {
    if (!resetId || newPassword.length < 8) { toast({ title: 'Error', description: 'Mínimo 8 caracteres', variant: 'destructive' }); return }
    setResetLoading(true)
    try { await api.post(`/users/${resetId}/reset-password`, { newPassword }); toast({ title: 'Éxito', description: 'Contraseña reseteada' }); setResetId(null); setNewPassword('') }
    catch (e: any) { toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' }) }
    finally { setResetLoading(false) }
  }

  const handleDeactivate = async () => {
    if (!deactivateId) return
    setDeactivateLoading(true)
    try { await api.delete(`/users/${deactivateId}`); toast({ title: 'Éxito', description: 'Maestro actualizado' }); setDeactivateId(null); fetchData() }
    catch { toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' }) }
    finally { setDeactivateLoading(false) }
  }

  const handleEdit = async () => {
    if (!editUser) return
    setEditLoading(true)
    try { await api.put(`/users/${editUser.id}`, editForm); toast({ title: 'Éxito', description: 'Maestro actualizado' }); setEditUser(null); fetchData() }
    catch (e: any) { toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' }) }
    finally { setEditLoading(false) }
  }

  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
      toast({ title: 'Error', description: 'Completa todos los campos obligatorios', variant: 'destructive' })
      return
    }
    setCreateLoading(true)
    try {
      await api.post('/auth/register', {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone,
        role: 'TEACHER',
      })
      toast({ title: 'Éxito', description: `Maestro ${createForm.firstName} creado` })
      setShowCreate(false)
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', phone: '' })
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error al crear', variant: 'destructive' })
    } finally { setCreateLoading(false) }
  }

  const handleExportCsv = () => {
    const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Estado', 'Creado']
    const rows = teachers.map(t => [t.firstName, t.lastName, t.email, t.phone || '', t.isActive ? 'Activo' : 'Desactivado', new Date(t.createdAt).toLocaleDateString()])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `maestros_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Users className="h-7 w-7 text-primary" /></div>Gestión de Maestros</h1>
          <p className="text-muted-foreground mt-1">{total} maestros registrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)}><UserPlus className="mr-2 h-4 w-4" />Crear Maestro</Button>
          <Button variant="outline" onClick={handleExportCsv} disabled={!teachers.length}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10" /></div>
            <Button onClick={() => { setPage(1); fetchData() }}>Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="text-center py-12 text-muted-foreground">Cargando...</div>)
            : !teachers.length ? (<div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><h3 className="font-medium mb-2">Sin resultados</h3></div>)
              : (<div className="space-y-3">
                {teachers.map((t) => (
                  <div key={t.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${!t.isActive ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10"><AvatarImage src={t.avatarUrl} /><AvatarFallback>{getInitials(t.name)}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-medium flex items-center gap-2">{t.name}{!t.isActive && <Badge variant="secondary" className="text-xs">Desactivado</Badge>}</h3>
                        <p className="text-sm text-muted-foreground">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditUser(t); setEditForm({ firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone || '' }) }} title="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setResetId(t.id); setNewPassword('') }} title="Resetear contraseña"><Key className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeactivateId(t.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title={t.isActive ? 'Desactivar' : 'Activar'}>{t.isActive ? <Ban className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                ))}
              </div>)}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={!!resetId} onOpenChange={(open) => !open && setResetId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Resetear Contraseña</DialogTitle><DialogDescription>Nueva contraseña.</DialogDescription></DialogHeader>
          <Input type="password" placeholder="Mínimo 8 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setResetId(null)}>Cancelar</Button><Button onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? '...' : 'Resetear'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Desactivará la cuenta del maestro.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={deactivateLoading}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeactivate} disabled={deactivateLoading} className="bg-destructive text-destructive-foreground">{deactivateLoading ? '...' : 'Confirmar'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent><DialogHeader><DialogTitle>Editar Maestro</DialogTitle><DialogDescription>Modifica los datos.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Nombre</Label><Input value={editForm.firstName} onChange={(e) => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div><div className="space-y-2"><Label>Apellido</Label><Input value={editForm.lastName} onChange={(e) => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button><Button onClick={handleEdit} disabled={editLoading}>{editLoading ? '...' : 'Guardar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Teacher Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crear Maestro</DialogTitle><DialogDescription>Completa los datos del nuevo maestro.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} placeholder="María" /></div>
              <div className="space-y-2"><Label>Apellido *</Label><Input value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} placeholder="García" /></div>
            </div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="maestro@escuela.edu" /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={createForm.phone} onChange={(e) => setCreateForm(p => ({ ...p, phone: e.target.value }))} placeholder="(787) 555-1234" /></div>
            <div className="space-y-2"><Label>Contraseña *</Label><Input type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? 'Creando...' : 'Crear Maestro'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

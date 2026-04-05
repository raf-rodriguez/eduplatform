import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Key, Ban, Eye, ChevronLeft, ChevronRight, Edit, Download, Upload, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'
import { getInitials } from '@/lib/utils'

const gradeLabels: Record<number, string> = {
  0: 'Pre-Kínder', 1: 'Kínder', 2: '1er Grado', 3: '2do Grado', 4: '3er Grado',
  5: '4to Grado', 6: '5to Grado', 7: '6to Grado', 8: '7mo Grado', 9: '8vo Grado',
  10: '9no Grado', 11: '10mo Grado', 12: '11vo Grado', 13: '12vo Grado',
}

const gradeOptions = Array.from({ length: 14 }, (_, i) => ({ value: i, label: gradeLabels[i] }))

export default function ManageStudents() {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Reset password
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Deactivate
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  // Edit
  const [editUser, setEditUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', gradeLevel: 0, phone: '' })
  const [editLoading, setEditLoading] = useState(false)

  // CSV Upload
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Change role
  const [changeRoleId, setChangeRoleId] = useState<string | null>(null)
  const [changeRoleLoading, setChangeRoleLoading] = useState(false)

  // Quick create
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '', gradeLevel: 0, phone: '' })
  const [createLoading, setCreateLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      const res = await api.get('/users/students', { params })
      setStudents(res.data.data.students)
      setTotal(res.data.data.pagination.total)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar', variant: 'destructive' })
    } finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset password
  const handleResetPassword = async () => {
    if (!resetId || newPassword.length < 8) {
      toast({ title: 'Error', description: 'Mínimo 8 caracteres', variant: 'destructive' })
      return
    }
    setResetLoading(true)
    try {
      await api.post(`/users/${resetId}/reset-password`, { newPassword })
      toast({ title: 'Éxito', description: 'Contraseña reseteada' })
      setResetId(null); setNewPassword('')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' })
    } finally { setResetLoading(false) }
  }

  // Deactivate/Activate
  const handleDeactivate = async () => {
    if (!deactivateId) return
    setDeactivateLoading(true)
    try {
      await api.delete(`/users/${deactivateId}`)
      toast({ title: 'Éxito', description: 'Estudiante actualizado' })
      setDeactivateId(null)
      fetchData()
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    } finally { setDeactivateLoading(false) }
  }

  // Edit
  const openEdit = (s: any) => {
    setEditUser(s)
    setEditForm({ firstName: s.firstName, lastName: s.lastName, email: s.email, gradeLevel: s.gradeLevel || 0, phone: s.phone || '' })
  }

  const handleEdit = async () => {
    if (!editUser) return
    setEditLoading(true)
    try {
      await api.put(`/users/${editUser.id}`, editForm)
      toast({ title: 'Éxito', description: 'Estudiante actualizado' })
      setEditUser(null)
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' })
    } finally { setEditLoading(false) }
  }

  // Change role
  const handleChangeRole = async (userId: string, newRole: string) => {
    setChangeRoleId(userId)
    setChangeRoleLoading(true)
    try {
      await api.put(`/users/${userId}/role`, { newRole })
      toast({ title: 'Éxito', description: `Rol cambiado a ${newRole}` })
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error', variant: 'destructive' })
    } finally { setChangeRoleLoading(false); setChangeRoleId(null) }
  }

  // Quick create student
  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password || !createForm.gradeLevel) {
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
        gradeLevel: createForm.gradeLevel,
        phone: createForm.phone,
        role: 'STUDENT',
      })
      toast({ title: 'Éxito', description: `Estudiante ${createForm.firstName} creado` })
      setShowCreate(false)
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', gradeLevel: 0, phone: '' })
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error al crear', variant: 'destructive' })
    } finally { setCreateLoading(false) }
  }

  // CSV Upload
  const handleCsvUpload = async () => {
    if (!csvFile) return
    setUploading(true)
    try {
      const text = await csvFile.text()
      const lines = text.trim().split('\n').slice(1) // skip header
      const users = lines.map(line => {
        const [firstName, lastName, email, gradeLevel, phone] = line.split(',').map(s => s.trim().replace(/"/g, ''))
        return { firstName, lastName, email, gradeLevel: parseInt(gradeLevel) || 0, phone, role: 'STUDENT' }
      }).filter(u => u.email)

      await api.post('/users/bulk-import', { users })
      toast({ title: 'Éxito', description: `${users.length} estudiantes importados` })
      setCsvFile(null)
      fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error al importar', variant: 'destructive' })
    } finally { setUploading(false) }
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Nombre', 'Apellido', 'Email', 'Grado', 'Teléfono', 'Estado', 'Creado']
    const rows = students.map(s => [s.firstName, s.lastName, s.email, gradeLabels[s.gradeLevel] || '', s.phone || '', s.isActive ? 'Activo' : 'Desactivado', new Date(s.createdAt).toLocaleDateString()])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-7 w-7 text-primary" /></div>
            Gestión de Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">{total} estudiantes registrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-2 h-4 w-4" />Crear Estudiante
          </Button>
          <Button variant="outline" onClick={handleExportCsv} disabled={!students.length}>
            <Download className="mr-2 h-4 w-4" />Exportar CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista de Estudiantes</TabsTrigger>
          <TabsTrigger value="importar">Importar CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
                </div>
                <Button onClick={() => { setPage(1); fetchData() }}>Buscar</Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando...</div>
              ) : !students.length ? (
                <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><h3 className="font-medium mb-2">Sin resultados</h3></div>
              ) : (
                <div className="space-y-3">
                  {students.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${!s.isActive ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'}`}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10"><AvatarImage src={s.avatarUrl} /><AvatarFallback>{getInitials(s.name)}</AvatarFallback></Avatar>
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {s.name}
                            {!s.isActive && <Badge variant="secondary" className="text-xs">Desactivado</Badge>}
                          </h3>
                          <p className="text-sm text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{gradeLabels[s.gradeLevel] || 'Sin grado'}</Badge>
                        <Select
                          disabled={changeRoleId === s.id}
                          onValueChange={(v) => handleChangeRole(s.id, v)}
                          defaultValue={undefined}
                        >
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue placeholder="Cambiar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEACHER">Maestro</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="PARENT">Padre</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Editar"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setResetId(s.id); setNewPassword('') }} title="Resetear contraseña"><Key className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeactivateId(s.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title={s.isActive ? 'Desactivar' : 'Activar'}>
                            {s.isActive ? <Ban className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="importar" className="mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2"><Upload className="h-5 w-5" />Importar Estudiantes desde CSV</h3>
              <p className="text-sm text-muted-foreground">Formato: firstName,lastName,email,gradeLevel,phone</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              <Button onClick={handleCsvUpload} disabled={!csvFile || uploading}>{uploading ? 'Importando...' : 'Importar'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetId} onOpenChange={(open) => !open && setResetId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resetear Contraseña</DialogTitle><DialogDescription>Nueva contraseña para este estudiante.</DialogDescription></DialogHeader>
          <Input type="password" placeholder="Mínimo 8 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetId(null)}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? 'Reseteando...' : 'Resetear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción desactivará/activará la cuenta del estudiante.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} disabled={deactivateLoading} className="bg-destructive text-destructive-foreground">
              {deactivateLoading ? 'Procesando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Create Student Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crear Estudiante</DialogTitle><DialogDescription>Completa los datos del nuevo estudiante.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Juan" /></div>
              <div className="space-y-2"><Label>Apellido *</Label><Input value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Pérez" /></div>
            </div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="estudiante@escuela.edu" /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={createForm.phone} onChange={(e) => setCreateForm(p => ({ ...p, phone: e.target.value }))} placeholder="(787) 555-1234" /></div>
            <div className="space-y-2"><Label>Grado *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={createForm.gradeLevel} onChange={(e) => setCreateForm(p => ({ ...p, gradeLevel: parseInt(e.target.value) }))}>
                <option value="">Selecciona grado</option>
                {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Contraseña *</Label><Input type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? 'Creando...' : 'Crear Estudiante'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Estudiante</DialogTitle><DialogDescription>Modifica los datos del estudiante.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editForm.firstName} onChange={(e) => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={editForm.lastName} onChange={(e) => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Grado</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={editForm.gradeLevel} onChange={(e) => setEditForm(p => ({ ...p, gradeLevel: parseInt(e.target.value) }))}>
                {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

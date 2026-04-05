import { useState, useEffect } from 'react'
import {
  Upload, FileText, FileSpreadsheet, Presentation, ClipboardList, BookOpen,
  Plus, Edit, Trash2, Download, Search, Eye, EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  presentation: { label: 'Presentación', icon: Presentation, color: 'bg-blue-500/10 text-blue-600' },
  exam: { label: 'Examen', icon: ClipboardList, color: 'bg-red-500/10 text-red-600' },
  quiz: { label: 'Quiz', icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600' },
  practice: { label: 'Práctica', icon: FileText, color: 'bg-green-500/10 text-green-600' },
  document: { label: 'Documento', icon: FileText, color: 'bg-gray-500/10 text-gray-600' },
  spreadsheet: { label: 'Hoja de Cálculo', icon: FileSpreadsheet, color: 'bg-emerald-500/10 text-emerald-600' },
}

interface Material {
  id: string
  title: string
  description: string
  type: string
  fileName: string
  fileSize: string
  published: boolean
  createdAt: string
}

export default function TeacherSubject() {
  const { toast } = useToast()
  const [materials, setMaterials] = useState<Material[]>([])
  const [search, setSearch] = useState('')

  // Create/Edit dialog
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', type: 'document' })

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Replace with API call
    const mockData: Material[] = [
      { id: '1', title: 'Introducción a la Literatura', description: 'Conceptos básicos de literatura española', type: 'presentation', fileName: 'literatura_intro.pptx', fileSize: '2.4 MB', published: true, createdAt: '2026-04-01' },
      { id: '2', title: 'Examen de Comprensión Lectora', description: 'Evaluación del módulo 3', type: 'exam', fileName: 'examen_mod3.pdf', fileSize: '856 KB', published: false, createdAt: '2026-04-03' },
      { id: '3', title: 'Quiz de Gramática', description: 'Preguntas sobre verbos y conjugaciones', type: 'quiz', fileName: 'quiz_gramatica.pdf', fileSize: '432 KB', published: true, createdAt: '2026-04-02' },
      { id: '4', title: 'Práctica de Escritura', description: 'Ejercicios de redacción creativa', type: 'practice', fileName: 'practica_escritura.docx', fileSize: '1.1 MB', published: true, createdAt: '2026-04-04' },
    ]
    setMaterials(mockData)
  }, [])

  const handleCreate = () => {
    if (!form.title) { toast({ title: 'Error', description: 'El título es obligatorio', variant: 'destructive' }); return }
    const newMaterial: Material = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      type: form.type,
      fileName: `archivo_${Date.now()}.pdf`,
      fileSize: 'N/A',
      published: false,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setMaterials(prev => [newMaterial, ...prev])
    setShowDialog(false)
    setForm({ title: '', description: '', type: 'document' })
    toast({ title: 'Éxito', description: 'Material creado' })
  }

  const handleEdit = () => {
    if (!form.title || !editingId) return
    setMaterials(prev => prev.map(m => m.id === editingId ? { ...m, title: form.title, description: form.description, type: form.type } : m))
    setShowDialog(false)
    setEditingId(null)
    setForm({ title: '', description: '', type: 'document' })
    toast({ title: 'Éxito', description: 'Material actualizado' })
  }

  const handleDelete = () => {
    if (!deleteId) return
    setMaterials(prev => prev.filter(m => m.id !== deleteId))
    setDeleteId(null)
    toast({ title: 'Éxito', description: 'Material eliminado' })
  }

  const togglePublish = (id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, published: !m.published } : m))
  }

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><BookOpen className="h-7 w-7 text-primary" /></div>
            Mi Materia
          </h1>
          <p className="text-muted-foreground mt-1">Sube y gestiona el contenido que tus estudiantes verán</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ title: '', description: '', type: 'document' }); setShowDialog(true) }}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{materials.filter(m => m.type === 'presentation').length}</div>
            <p className="text-sm text-muted-foreground">Presentaciones</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{materials.filter(m => m.type === 'exam').length + materials.filter(m => m.type === 'quiz').length}</div>
            <p className="text-sm text-muted-foreground">Exámenes y Quizzes</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{materials.filter(m => m.type === 'practice').length}</div>
            <p className="text-sm text-muted-foreground">Prácticas</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{materials.filter(m => m.published).length}</div>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar material..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="published">Publicados</TabsTrigger>
              <TabsTrigger value="draft">Borradores</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-4">
              <MaterialList materials={filtered} onEdit={(m) => { setEditingId(m.id); setForm({ title: m.title, description: m.description, type: m.type }); setShowDialog(true) }} onDelete={(id) => setDeleteId(id)} onTogglePublish={togglePublish} />
            </TabsContent>
            <TabsContent value="published" className="mt-4">
              <MaterialList materials={filtered.filter(m => m.published)} onEdit={(m) => { setEditingId(m.id); setForm({ title: m.title, description: m.description, type: m.type }); setShowDialog(true) }} onDelete={(id) => setDeleteId(id)} onTogglePublish={togglePublish} />
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              <MaterialList materials={filtered.filter(m => !m.published)} onEdit={(m) => { setEditingId(m.id); setForm({ title: m.title, description: m.description, type: m.type }); setShowDialog(true) }} onDelete={(id) => setDeleteId(id)} onTogglePublish={togglePublish} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifica los datos del material' : 'Agrega nuevo contenido para tus estudiantes'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Presentación del Módulo 3" /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Breve descripción del material" /></div>
            <div className="space-y-2"><Label>Tipo de Material</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <button key={key} type="button" className={`p-2 rounded-lg border text-xs font-medium transition-colors ${form.type === key ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`} onClick={() => setForm(p => ({ ...p, type: key }))}>
                    <cfg.icon className="h-4 w-4 mx-auto mb-1" />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Archivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Subir archivo</p>
                <p className="text-xs text-muted-foreground">PDF, PPTX, DOCX, XLSX (máx 25MB)</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={editingId ? handleEdit : handleCreate}>{editingId ? 'Guardar Cambios' : 'Crear Material'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Este material se eliminará permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MaterialList({ materials, onEdit, onDelete, onTogglePublish }: { materials: Material[]; onEdit: (m: Material) => void; onDelete: (id: string) => void; onTogglePublish: (id: string) => void }) {
  if (!materials.length) return <div className="text-center py-12 text-muted-foreground">No hay material</div>
  return (
    <div className="space-y-3">
      {materials.map(m => {
        const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.document
        const Icon = cfg.icon
        return (
          <div key={m.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${!m.published ? 'opacity-70' : 'hover:bg-muted/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${cfg.color}`}><Icon className="h-5 w-5" /></div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {m.title}
                  {m.published ? <Badge variant="default" className="text-xs">Publicado</Badge> : <Badge variant="secondary" className="text-xs">Borrador</Badge>}
                </h3>
                <p className="text-sm text-muted-foreground">{m.description} • {m.fileName} ({m.fileSize})</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onTogglePublish(m.id)} title={m.published ? 'Ocultar' : 'Publicar'}>{m.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
              <Button variant="ghost" size="sm" title="Descargar"><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(m)} title="Editar"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(m.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

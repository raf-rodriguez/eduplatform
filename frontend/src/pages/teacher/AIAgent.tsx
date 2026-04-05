import { useState, useRef, useEffect } from 'react'
import {
  Send, Bot, Sparkles, FileText, ClipboardList, BookOpen, ListChecks,
  BookMarked, Presentation, GraduationCap, Download, Copy, RefreshCw,
  Loader2, ChevronDown, Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

const SUBJECTS = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Programación', 'Inglés', 'Arte', 'Educación Física']
const GRADES = ['Pre-Kínder', 'Kínder', '1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado', '7mo Grado', '8vo Grado', '9no Grado', '10mo Grado', '11vo Grado', '12vo Grado']

const QUICK_TASKS = [
  { id: 'quiz', label: 'Quiz', icon: ClipboardList, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { id: 'exam', label: 'Examen', icon: FileText, color: 'bg-red-500/10 text-red-600 border-red-200' },
  { id: 'lesson-plan', label: 'Plan de Lección', icon: BookOpen, color: 'bg-green-500/10 text-green-600 border-green-200' },
  { id: 'worksheet', label: 'Hoja de Trabajo', icon: ListChecks, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { id: 'rubric', label: 'Rúbrica', icon: BookMarked, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { id: 'pptx-outline', label: 'Presentación', icon: Presentation, color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
  { id: 'study-guide', label: 'Guía de Estudio', icon: GraduationCap, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  { id: 'pdf-content', label: 'Documento PDF', icon: FileText, color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
]

export default function AITeacherAgent() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('generador')
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Generator state
  const [selectedTask, setSelectedTask] = useState('quiz')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [topic, setTopic] = useState('')
  const [details, setDetails] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  // Chat with AI
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: chatInput, context: chatMessages })
      const reply = res.data.data.reply
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      toast({ title: 'Error', description: 'No se pudo conectar con el agente IA', variant: 'destructive' })
    } finally { setChatLoading(false) }
  }

  // Generate content
  const handleGenerate = async () => {
    if (!subject || !grade || !topic) {
      toast({ title: 'Error', description: 'Completa materia, grado y tema', variant: 'destructive' })
      return
    }
    setGenerating(true)
    try {
      const res = await api.post('/ai/generate', {
        task: selectedTask,
        subject,
        grade,
        topic,
        details: details || undefined,
        count: questionCount,
        language: 'es',
      })
      setResult(res.data.data.content)
      toast({ title: 'Éxito', description: 'Contenido generado correctamente' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Error generando contenido', variant: 'destructive' })
    } finally { setGenerating(false) }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
    toast({ title: 'Copiado', description: 'Contenido copiado al portapapeles' })
  }

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTask}_${topic.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadText = () => {
    const formatContent = (obj: any, indent = ''): string => {
      if (typeof obj === 'string') return obj
      if (Array.isArray(obj)) return obj.map(item => formatContent(item, indent + '  ')).join('\n')
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).map(([k, v]) => `${indent}${k}: ${formatContent(v as any, indent + '  ')}`).join('\n')
      }
      return String(obj)
    }
    const blob = new Blob([formatContent(result)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTask}_${topic.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          Asistente IA del Maestro
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea exámenes, quizzes, planes de lección, rúbricas y más con inteligencia artificial
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="generador" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Generador de Contenido
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> Chat Libre
          </TabsTrigger>
        </TabsList>

        {/* ==================== CONTENT GENERATOR ==================== */}
        <TabsContent value="generador" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Generar Contenido Educativo</CardTitle>
                <CardDescription>Selecciona el tipo de contenido y completa los campos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick task buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_TASKS.map(t => (
                    <Button
                      key={t.id}
                      variant={selectedTask === t.id ? 'default' : 'outline'}
                      className={`flex flex-col items-center gap-1 h-auto py-3 text-xs ${selectedTask === t.id ? '' : t.color}`}
                      onClick={() => setSelectedTask(t.id)}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Materia *</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger><SelectValue placeholder="Selecciona materia" /></SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grado *</label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger><SelectValue placeholder="Selecciona grado" /></SelectTrigger>
                      <SelectContent>
                        {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tema *</label>
                  <Input placeholder="Ej: Fracciones, Historia de PR, El sistema solar..." value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>

                {(selectedTask === 'quiz' || selectedTask === 'exam') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de preguntas</label>
                    <Input type="number" min={1} max={50} value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)} />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Detalles adicionales (opcional)</label>
                  <Textarea
                    placeholder="Instrucciones específicas, nivel de dificultad, temas específicos a incluir..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleGenerate} disabled={generating} className="w-full">
                  {generating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>) : (<><Sparkles className="mr-2 h-4 w-4" />Generar {QUICK_TASKS.find(t => t.id === selectedTask)?.label}</>)}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Resultado
                  {result && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result)} title="Copiar"><Copy className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={downloadJson} title="Descargar JSON"><Download className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={downloadText} title="Descargar TXT"><FileText className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setResult(null)} title="Limpiar"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result && !generating && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p>El contenido generado aparecerá aquí</p>
                  </div>
                )}
                {generating && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Generando contenido con IA...</p>
                  </div>
                )}
                {result && !generating && (
                  <div className="max-h-[60vh] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/50 p-4 rounded-lg">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== FREE CHAT ==================== */}
        <TabsContent value="chat" className="mt-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Chat con Asistente IA</CardTitle>
              <CardDescription>Haz cualquier pregunta sobre enseñanza, pedagogía, o pide que genere contenido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-4 p-4 bg-muted/20 rounded-lg">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p>Pregúntame algo como:</p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                      {['¿Cómo enseñar fracciones?', 'Dame ideas para actividades de ciencias', 'Cómo evaluar comprensión lectora?', 'Tips para manejo de clase'].map(q => (
                        <Badge key={q} variant="outline" className="cursor-pointer" onClick={() => { setChatInput(q); sendChatMessage(); }}>{q}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                      {msg.role === 'assistant' && <div className="flex items-center gap-2 mb-1"><Bot className="h-3 w-3 text-primary" /><span className="text-xs font-medium">Asistente IA</span></div>}
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background border rounded-lg p-3"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                  placeholder="Escribe tu pregunta..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} className="self-end">
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

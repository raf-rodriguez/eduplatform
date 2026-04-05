import { useState } from 'react'
import { Plus, Trash2, Save, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  question: string
  options: { text: string; isCorrect: boolean }[]
  correctAnswer?: string
  points: number
}

export default function CreateAssessment() {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [passingScore, setPassingScore] = useState('70')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      points: 10,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = { ...newOptions[optionIndex], text }
          return { ...q, options: newOptions }
        }
        return q
      })
    )
  }

  const setCorrectOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt, idx) => ({
              ...opt,
              isCorrect: idx === optionIndex,
            })),
          }
        }
        return q
      })
    )
  }

  const handleGenerateWithAI = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const generatedQuestions: Question[] = [
        {
          id: Date.now().toString(),
          type: 'multiple_choice',
          question: '¿Cuál es el resultado de 1/2 × 1/3?',
          options: [
            { text: '1/5', isCorrect: false },
            { text: '1/6', isCorrect: true },
            { text: '2/5', isCorrect: false },
            { text: '3/2', isCorrect: false },
          ],
          points: 10,
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'multiple_choice',
          question: '¿Qué es el numerador en una fracción?',
          options: [
            { text: 'El número de abajo', isCorrect: false },
            { text: 'El número de arriba', isCorrect: true },
            { text: 'El resultado de la división', isCorrect: false },
            { text: 'El número entero', isCorrect: false },
          ],
          points: 10,
        },
      ]
      setQuestions([...questions, ...generatedQuestions])
      setIsGenerating(false)
      toast({
        title: 'Preguntas generadas',
        description: 'La IA ha generado 2 preguntas para tu evaluación.',
      })
    }, 2000)
  }

  const handleSave = () => {
    toast({
      title: 'Evaluación guardada',
      description: 'La evaluación se ha creado correctamente.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crear Evaluación</h1>
          <p className="text-muted-foreground">Diseña una nueva evaluación para tus estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateWithAI} disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : 'Generar con IA'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Examen de Matemáticas - Módulo 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la evaluación..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="timeLimit">Tiempo límite (minutos)</Label>
              <Input
                id="timeLimit"
                type="number"
                placeholder="30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="passingScore">Puntuación mínima (%)</Label>
              <Input
                id="passingScore"
                type="number"
                placeholder="70"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Preguntas ({questions.length})</h2>
          <Button onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar pregunta
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pregunta {index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Pregunta</Label>
                <Textarea
                  placeholder="Escribe tu pregunta aquí..."
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, { question: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Opciones (selecciona la correcta)</Label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(question.id, optIndex)}
                      className="h-4 w-4"
                    />
                    <Input
                      placeholder={`Opción ${optIndex + 1}`}
                      value={option.text}
                      onChange={(e) =>
                        updateOption(question.id, optIndex, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <Label>Puntos</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(question.id, { points: parseInt(e.target.value) })
                  }
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No has agregado preguntas aún.{' '}
                <Button variant="link" onClick={addQuestion}>
                  Agregar una pregunta
                </Button>{' '}
                o{' '}
                <Button variant="link" onClick={handleGenerateWithAI}>
                  generar con IA
                </Button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

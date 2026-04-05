import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

export default function Assessment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await api.get(`/assessments/${id}`)
        setAssessment(response.data.data.assessment)
        
        // Start attempt
        const attemptRes = await api.post(`/assessments/${id}/start`)
        setAttempt(attemptRes.data.data)
        
        // Set timer if time limit exists
        if (response.data.data.assessment.timeLimit) {
          setTimeLeft(response.data.data.assessment.timeLimit * 60)
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'No se pudo cargar la evaluación',
          variant: 'destructive',
        })
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [id, navigate, toast])

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Submit all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        await api.post('/assessments/submit-answer', {
          attemptId: attempt.attemptId,
          questionId,
          answer,
        })
      }

      // Complete assessment
      const result = await api.post('/assessments/complete', {
        attemptId: attempt.attemptId,
      })

      toast({
        title: result.data.data.passed ? '¡Felicidades!' : 'Evaluación completada',
        description: `Puntuación: ${result.data.data.score}%`,
      })

      navigate(`/student/assessment/${id}/results`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la evaluación',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const questions = assessment?.quizzes?.[0]?.questions || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assessment?.title}</h1>
          <p className="text-muted-foreground">{assessment?.lesson?.module?.subject?.name}</p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-muted'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Progreso</span>
            <span>{Object.keys(answers).length} / {questions.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question: any, index: number) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) => handleAnswer(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options?.map((option: any, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option.text} id={`${question.id}-${optIndex}`} />
                      <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Puntuación mínima para aprobar: {assessment?.passingScore}%</span>
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length < questions.length}
        >
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Enviar evaluación
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

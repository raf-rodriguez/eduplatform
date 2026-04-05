import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface Lesson {
  id: string
  title: string
  orderIndex: number
  duration?: number
  progress?: Array<{ status: string }>
}

interface Module {
  id: string
  name: string
  orderIndex: number
  lessons?: Lesson[]
}

interface Progress {
  total: number
  completed: number
  percentage: number
}

interface Subject {
  id: string
  name: string
  code: string
  description?: string
  isStem?: boolean
  progress?: Progress
  modules?: Module[]
}

interface Grade {
  id: string
  name: string
  level: number
  subjects: Subject[]
}

interface CurriculumResponse {
  grade: Grade
  subjects: Subject[]
}

const subjectIcons: Record<string, string> = {
  ESP: '📖',
  MAT: '🔢',
  CIE: '🔬',
  HIS: '🌍',
  ING: '🇬🇧',
  INC: '💬',
  ROB: '🤖',
  FIN: '💰',
  SAL: '🏃',
  LEC: '✏️',
  MBAS: '🔵',
  EXP: '🌱',
  ART: '🎨',
  MUS: '🎵',
}

export default function Curriculum() {
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCurriculum()
  }, [])

  const fetchCurriculum = async () => {
    try {
      const res = await api.get('/content/my-curriculum')
      setCurriculum(res.data.data || res.data)
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el currículo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getSubjectCategory = (subject: Subject): string => {
    const stemSubjects = ['ROB']
    const specialSubjects = ['FIN', 'SAL']
    const coreSubjects = ['ESP', 'MAT', 'CIE', 'HIS', 'ING', 'INC']
    const preschoolSubjects = ['LEC', 'MBAS', 'EXP', 'ART', 'MUS']

    const code = subject.code.split('_')[0]
    if (stemSubjects.includes(code)) return 'stem'
    if (specialSubjects.includes(code)) return 'special'
    if (coreSubjects.includes(code)) return 'core'
    if (preschoolSubjects.includes(code)) return 'preschool'
    return 'other'
  }

  const getSubjectColor = (subject: Subject): string => {
    const category = getSubjectCategory(subject)
    switch (category) {
      case 'stem':
        return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
      case 'special':
        return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
      case 'core':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      default:
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'stem': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'special': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'core': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!curriculum) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No se encontró currículo</h2>
        <p className="text-muted-foreground">Contacta a tu administrador para configurar tu plan de estudios.</p>
      </div>
    )
  }

  const { grade, subjects } = curriculum

  // Group subjects by category
  const groupedSubjects: Record<string, Subject[]> = {}
  subjects.forEach((subject) => {
    const category = getSubjectCategory(subject)
    if (!groupedSubjects[category]) groupedSubjects[category] = []
    groupedSubjects[category].push(subject)
  })

  const categoryOrder = ['preschool', 'core', 'special', 'stem', 'other']
  const categoryNames: Record<string, string> = {
    preschool: '📚 Actividades Básicas',
    core: '📖 Materias Principales',
    special: '⭐ Materias Especiales',
    stem: '🤖 STEM (Ciencia, Tecnología, Ingeniería y Matemáticas)',
    other: '📋 Otras Materias',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mi Currículo</h1>
        <p className="text-muted-foreground">
          <span className="font-medium">{grade.name}</span> — {subjects.length} materias disponibles
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Progreso General</CardTitle>
          <CardDescription>Tu avance en {grade.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress
              value={subjects.reduce((acc, s) => acc + (s.progress?.percentage || 0), 0) / Math.max(subjects.length, 1)}
              className="h-3"
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {(subjects.reduce((acc, s) => acc + (s.progress?.percentage || 0), 0) / Math.max(subjects.length, 1)).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Subjects grouped by category */}
      {categoryOrder.map((category) => {
        const catSubjects = groupedSubjects[category]
        if (!catSubjects || catSubjects.length === 0) return null

        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {categoryNames[category] || category}
              <Badge className={getCategoryColor(category)}>{catSubjects.length}</Badge>
            </h2>

            <div className="grid gap-3">
              {catSubjects.map((subject) => {
                const icon = subjectIcons[subject.code.split('_')[0]] || '📚'

                return (
                  <Card key={subject.id} className={`border-l-4 ${getSubjectColor(subject)}`}>
                    <Link
                      to={`/student/subject/${subject.id}`}
                      className="block p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <h3 className="font-semibold text-base">{subject.name}</h3>
                            {subject.description && (
                              <p className="text-sm text-muted-foreground">{subject.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-medium">{subject.progress?.percentage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="w-20">
                            <Progress value={subject.progress?.percentage || 0} className="h-2" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

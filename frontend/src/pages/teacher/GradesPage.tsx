import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, ChevronRight, FolderOpen, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import api from '@/services/api'

interface Grade {
  id: string
  name: string
  level: number
  description?: string
  hasStemTrack: boolean
  subjectsCount: number
  subjects: Subject[]
}

interface Subject {
  id: string
  name: string
  code: string
  modulesCount: number
  modules: Module[]
}

interface Module {
  id: string
  name: string
  lessonsCount: number
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<string>('')

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await api.get('/content/grades')
      setGrades(Array.isArray(response.data.data) ? response.data.data : [])
    } catch (error) {
      console.error('Error fetching grades:', error)
      setGrades([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grados y Materias</h1>
        <p className="text-muted-foreground">Estructura académica (solo lectura — contacta al admin para cambios)</p>
      </div>

      <div className="grid gap-6">
        {(grades || []).map((grade) => (
          <Card key={grade.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {grade.name} - Nivel {grade.level}
                  </CardTitle>
                  {grade.description && (
                    <p className="text-sm text-muted-foreground mt-1">{grade.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {grade.hasStemTrack && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      STEM
                    </span>
                  )}
                  <Badge variant="outline">{(grade.subjects || []).length} materias</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(grade.subjects || []).length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(grade.subjects || []).map((subject) => (
                    <Card key={subject.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{subject.name}</h3>
                            <p className="text-xs text-muted-foreground">{subject.code}</p>
                          </div>
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {subject.modulesCount} módulos
                          </span>
                        </div>
                        {(subject.modules || []).length > 0 && (
                          <div className="mt-3 space-y-1">
                            {(subject.modules || []).map((module) => (
                              <div
                                key={module.id}
                                className="flex items-center justify-between text-xs py-1 border-b"
                              >
                                <span className="truncate">{module.name}</span>
                                <span className="text-muted-foreground">
                                  {module.lessonsCount} lecciones
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Link to={`/teacher/content?subject=${subject.id}`}>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            Gestionar Contenido
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay materias registradas</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedGrade(grade.id)
                      setIsSubjectDialogOpen(true)
                    }}
                  >
                    Agregar la primera materia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {grades.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay grados registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando el primer grado académico
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Grado
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

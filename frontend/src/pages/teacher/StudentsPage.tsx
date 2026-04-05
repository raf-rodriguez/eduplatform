import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, TrendingUp, BookOpen, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/services/api'

interface Student {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  averageScore: number
  completedLessons: number
  totalLessons: number
  progress: number
  lastLoginAt?: Date
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'progress'>('name')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      // Usa el endpoint que filtra por las asignaciones del maestro
      const response = await api.get('/teachers/my/students')
      setStudents(response.data.data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = (students || [])
    .filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.firstName.localeCompare(b.firstName)
      } else if (sortBy === 'score') {
        return b.averageScore - a.averageScore
      } else {
        return b.progress - a.progress
      }
    })

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
        <h1 className="text-3xl font-bold">Estudiantes</h1>
        <p className="text-muted-foreground">Gestiona y da seguimiento a tus estudiantes</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="score">Mejor Promedio</SelectItem>
            <SelectItem value="progress">Mayor Progreso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    to={`/teacher/students/${student.id}`}
                    className="font-semibold hover:underline"
                  >
                    {student.firstName} {student.lastName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {student.averageScore}%
                    </div>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {student.completedLessons}/{student.totalLessons}
                    </div>
                    <p className="text-xs text-muted-foreground">Lecciones</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>
                  <Link to={`/teacher/students/${student.id}`}>
                    <Button size="sm">Ver Detalle</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
              </h3>
              {searchTerm && (
                <p className="text-muted-foreground">
                  Intenta con otro término de búsqueda
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

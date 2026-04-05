import { useState } from 'react'
import { Search, TrendingUp, Award, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { getInitials } from '@/lib/utils'

const students = [
  {
    id: 1,
    name: 'María González',
    email: 'maria@email.com',
    grade: '3ro',
    progress: 85,
    averageScore: 92,
    lastActive: 'Hace 2 horas',
    status: 'good',
    avatar: '',
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    email: 'carlos@email.com',
    grade: '3ro',
    progress: 72,
    averageScore: 78,
    lastActive: 'Hace 1 día',
    status: 'average',
    avatar: '',
  },
  {
    id: 3,
    name: 'Pedro Sánchez',
    email: 'pedro@email.com',
    grade: '3ro',
    progress: 45,
    averageScore: 65,
    lastActive: 'Hace 3 días',
    status: 'at-risk',
    avatar: '',
  },
  {
    id: 4,
    name: 'Ana López',
    email: 'ana@email.com',
    grade: '3ro',
    progress: 95,
    averageScore: 98,
    lastActive: 'Hace 30 minutos',
    status: 'excellent',
    avatar: '',
  },
]

export default function StudentProgress() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progreso de Estudiantes</h1>
        <p className="text-muted-foreground">Monitorea el rendimiento de tus estudiantes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => s.status === 'at-risk').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Destacados</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => s.status === 'excellent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{student.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        student.status === 'excellent'
                          ? 'bg-green-100 text-green-700'
                          : student.status === 'good'
                          ? 'bg-blue-100 text-blue-700'
                          : student.status === 'average'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.status === 'excellent'
                        ? 'Excelente'
                        : student.status === 'good'
                        ? 'Bueno'
                        : student.status === 'average'
                        ? 'Regular'
                        : 'En riesgo'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.email} • {student.grade}
                  </p>
                </div>

                <div className="hidden md:block w-32">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-2" />
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold">{student.averageScore}%</div>
                  <div className="text-xs text-muted-foreground">promedio</div>
                </div>

                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

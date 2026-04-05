import { useState, useMemo } from 'react'
import {
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  Plus,
  Eye,
  Edit,
  BarChart3,
  TrendingUp,
  X,
  Search,
  UserPlus,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/lib/utils'

// ============================================================================
// TODO: Replace all simulated data with actual API calls to backend
// Endpoints:
//   GET  /api/admin/grades
//   GET  /api/admin/grades/:id/students
//   GET  /api/admin/grades/:id/teachers
//   GET  /api/admin/grades/:id/subjects
//   POST /api/admin/grades/:id/students
//   POST /api/admin/grades/:id/teachers/assign
//   DELETE /api/admin/grades/:id/students/:studentId
//   PATCH /api/admin/grades/:id/teachers/:teacherId
// ============================================================================

// ==================== TYPES ====================

interface GradeTeacher {
  id: string
  name: string
  subjects: string[]
}

interface GradeStudent {
  id: string
  name: string
  progress: number
  attendance: number
}

interface GradeSubject {
  id: string
  name: string
}

interface GradeData {
  id: number
  level: number
  name: string
  shortName: string
  students: GradeStudent[]
  teachers: GradeTeacher[]
  subjects: GradeSubject[]
  avgProgress: number
  avgAttendance: number
}

// ==================== SIMULATED DATA ====================

const GRADE_LEVELS = [
  { level: 0, name: 'Pre-K\xednder', shortName: 'Pre-K' },
  { level: 1, name: 'K\xednder', shortName: 'K\xednder' },
  { level: 2, name: 'Primer Grado', shortName: '1ro' },
  { level: 3, name: 'Segundo Grado', shortName: '2do' },
  { level: 4, name: 'Tercer Grado', shortName: '3ro' },
  { level: 5, name: 'Cuarto Grado', shortName: '4to' },
  { level: 6, name: 'Quinto Grado', shortName: '5to' },
  { level: 7, name: 'Sexto Grado', shortName: '6to' },
  { level: 8, name: 'S\xe9ptimo Grado', shortName: '7mo' },
  { level: 9, name: 'Octavo Grado', shortName: '8vo' },
  { level: 10, name: 'Noveno Grado', shortName: '9no' },
  { level: 11, name: 'D\xe9cimo Grado', shortName: '10mo' },
  { level: 12, name: 'Und\xe9cimo Grado', shortName: '11vo' },
  { level: 13, name: 'Duod\xe9cimo Grado', shortName: '12vo' },
]

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
]

function getAvatarColor(id: string): string {
  const index = parseInt(id, 10) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

const MOCK_GRADES: GradeData[] = GRADE_LEVELS.map((gl, idx) => {
  const studentCount = Math.floor(Math.random() * 30) + 15
  const teacherCount = idx < 2 ? 1 : Math.floor(Math.random() * 2) + 2
  const subjectCount = idx < 2 ? 3 : Math.floor(Math.random() * 4) + 5

  const allSubjects = [
    'Espa\xf1ol',
    'Matem\xe1ticas',
    'Ciencia',
    'Historia',
    'Ingl\xe9s',
    'Ingl\xe9s Conversacional',
    'Educaci\xf3n F\xedsica',
    'Arte',
    'M\xfasica',
    'Rob\xf3tica',
    'Finanzas',
    'Salud',
  ]

  const students: GradeStudent[] = Array.from({ length: studentCount }, (_, i) => {
    const firstNames = [
      'Sof\xeda', 'Mateo', 'Isabella', 'Daniel', 'Valentina',
      'Sebasti\xe1n', 'Camila', 'Alejandro', 'Luciana', 'Diego',
      'Mariana', 'Andr\xe9s', 'Gabriela', 'Carlos', 'Andrea',
      'Miguel', 'Laura', 'Javier', 'Carmen', 'Roberto',
      'Ana', 'Pedro', 'Maria', 'Juan', 'Elena',
    ]
    const lastNames = [
      'Gonz\xe1lez', 'Rodr\xedguez', 'Mart\xednez', 'L\xf3pez', 'P\xe9rez',
      'S\xe1nchez', 'Ram\xedrez', 'Torres', 'Flores', 'Rivera',
      'G\xf3mez', 'D\xedaz', 'Cruz', 'Morales', 'Reyes',
    ]
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`
    return {
      id: `s-${idx}-${i}`,
      name,
      progress: Math.floor(Math.random() * 40) + 60,
      attendance: Math.floor(Math.random() * 20) + 80,
    }
  })

  const teachers: GradeTeacher[] = Array.from({ length: teacherCount }, (_, i) => {
    const teacherNames = [
      'Ana L\xf3pez',
      'Laura Mart\xednez',
      'Miguel Ram\xedrez',
      'Javier Moreno',
      'Carmen D\xedaz',
      'Roberto Fern\xe1ndez',
      'Mar\xeda Herrera',
      'Carlos Mendoza',
    ]
    const subjectSubset = allSubjects.slice(i * 2, i * 2 + 2)
    return {
      id: `t-${idx}-${i}`,
      name: teacherNames[(idx + i) % teacherNames.length],
      subjects: subjectSubset.length > 0 ? subjectSubset : ['Espa\xf1ol'],
    }
  })

  const subjects: GradeSubject[] = allSubjects.slice(0, subjectCount).map((s, i) => ({
    id: `sub-${idx}-${i}`,
    name: s,
  }))

  return {
    id: idx,
    level: gl.level,
    name: gl.name,
    shortName: gl.shortName,
    students,
    teachers,
    subjects,
    avgProgress: Math.floor(Math.random() * 25) + 70,
    avgAttendance: Math.floor(Math.random() * 15) + 82,
  }
})

// ==================== MAIN COMPONENT ====================

export default function GradesOverview() {
  const [grades] = useState<GradeData[]>(MOCK_GRADES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<GradeData | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [assignTeacherDialogOpen, setAssignTeacherDialogOpen] = useState(false)
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false)
  const [activeGradeForAction, setActiveGradeForAction] = useState<GradeData | null>(null)
  const [newStudentName, setNewStudentName] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  // ==================== COMPUTED VALUES ====================

  const totalStudents = useMemo(() => grades.reduce((sum, g) => sum + g.students.length, 0), [grades])
  const totalTeachers = useMemo(() => {
    const teacherIds = new Set<string>()
    grades.forEach((g) => g.teachers.forEach((t) => teacherIds.add(t.id)))
    return teacherIds.size
  }, [grades])
  const avgStudentsPerGrade = grades.length > 0 ? Math.round(totalStudents / grades.length) : 0

  const filteredGrades = useMemo(() => {
    if (!searchQuery) return grades
    const q = searchQuery.toLowerCase()
    return grades.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.shortName.toLowerCase().includes(q) ||
        g.teachers.some((t) => t.name.toLowerCase().includes(q))
    )
  }, [grades, searchQuery])

  const filteredStudents = useMemo(() => {
    if (!selectedGrade || !studentSearch) return selectedGrade?.students || []
    const q = studentSearch.toLowerCase()
    return selectedGrade.students.filter((s) => s.name.toLowerCase().includes(q))
  }, [selectedGrade, studentSearch])

  // ==================== HANDLERS ====================

  const openGradeDetail = (grade: GradeData) => {
    setSelectedGrade(grade)
    setStudentSearch('')
    setDetailDialogOpen(true)
  }

  const openAssignTeacher = (grade: GradeData) => {
    setActiveGradeForAction(grade)
    setSelectedTeacherId('')
    setAssignTeacherDialogOpen(true)
  }

  const openAddStudent = (grade: GradeData) => {
    setActiveGradeForAction(grade)
    setNewStudentName('')
    setAddStudentDialogOpen(true)
  }

  const handleAssignTeacher = () => {
    if (!activeGradeForAction || !selectedTeacherId) return
    // TODO: API call POST /api/admin/grades/:id/teachers/assign { teacherId }
    setAssignTeacherDialogOpen(false)
    setActiveGradeForAction(null)
  }

  const handleAddStudent = () => {
    if (!activeGradeForAction || !newStudentName.trim()) return
    // TODO: API call POST /api/admin/grades/:id/students { name }
    setAddStudentDialogOpen(false)
    setActiveGradeForAction(null)
  }

  const handleRemoveStudent = (studentId: string) => {
    if (!selectedGrade) return
    // TODO: API call DELETE /api/admin/grades/:id/students/:studentId
    setSelectedGrade({
      ...selectedGrade,
      students: selectedGrade.students.filter((s) => s.id !== studentId),
    })
  }

  const getProgressColor = (value: number): string => {
    if (value >= 85) return 'bg-green-500'
    if (value >= 70) return 'bg-blue-500'
    if (value >= 55) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getProgressTextColor = (value: number): string => {
    if (value >= 85) return 'text-green-600'
    if (value >= 70) return 'text-blue-600'
    if (value >= 55) return 'text-yellow-600'
    return 'text-red-600'
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grados y Estudiantes</h1>
          <p className="text-muted-foreground mt-1">
            Vista general de todos los grados, estudiantes y maestros asignados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grado o maestro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* ===================== STATS CARDS ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Grados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Grados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pre-K\xednder a Duod\xe9cimo</p>
          </CardContent>
        </Card>

        {/* Total Estudiantes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString('es-ES')}</div>
            <p className="text-xs text-muted-foreground mt-1">En todos los grados</p>
          </CardContent>
        </Card>

        {/* Total Maestros */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Maestros</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground mt-1">Asignados a grados</p>
          </CardContent>
        </Card>

        {/* Promedio Estudiantes/Grado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Promedio Est/Grado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStudentsPerGrade}</div>
            <p className="text-xs text-muted-foreground mt-1">Estudiantes por grado</p>
          </CardContent>
        </Card>
      </div>

      {/* ===================== GRADE CARDS GRID ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGrades.map((grade) => (
          <Card
            key={grade.id}
            className="hover:shadow-md transition-shadow group relative"
          >
            {/* Clickable header area */}
            <div
              className="cursor-pointer"
              onClick={() => openGradeDetail(grade)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openGradeDetail(grade) }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {grade.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{grade.shortName}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
            </div>
            <CardContent className="space-y-4">
              {/* Students */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Estudiantes
                  </span>
                  <span className="font-medium">{grade.students.length}</span>
                </div>
                <div className="flex -space-x-2">
                  {grade.students.slice(0, 5).map((student, i) => (
                    <Avatar key={student.id} className="h-7 w-7 border-2 border-background">
                      <AvatarFallback className={`text-[10px] text-white ${getAvatarColor(String(i))}`}>
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {grade.students.length > 5 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                      +{grade.students.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Teachers */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <UserCheck className="h-3.5 w-3.5" />
                    Maestros
                  </span>
                  <span className="font-medium">{grade.teachers.length}</span>
                </div>
                <div className="space-y-1">
                  {grade.teachers.slice(0, 2).map((teacher) => (
                    <div key={teacher.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <span className="truncate">{teacher.name}</span>
                    </div>
                  ))}
                  {grade.teachers.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{grade.teachers.length - 2} m\xe1s
                    </span>
                  )}
                </div>
              </div>

              {/* Subjects */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  Materias
                </span>
                <Badge variant="secondary" className="text-xs">
                  {grade.subjects.length}
                </Badge>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Progreso Promedio
                  </span>
                  <span className={`font-medium text-sm ${getProgressTextColor(grade.avgProgress)}`}>
                    {grade.avgProgress}%
                  </span>
                </div>
                <Progress value={grade.avgProgress} className={`h-2 ${getProgressColor(grade.avgProgress)}`} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => openGradeDetail(grade)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Ver Estudiantes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => openAssignTeacher(grade)}
                >
                  <UserCheck className="mr-1 h-3 w-3" />
                  Asignar Maestro
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  onClick={() => openGradeDetail(grade)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGrades.length === 0 && searchQuery && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No se encontraron resultados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Intenta con otro t\xe9rmino de b\xfasqueda
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===================== GRADE DETAIL DIALOG ===================== */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedGrade && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedGrade.name}</DialogTitle>
                    <DialogDescription>
                      {selectedGrade.students.length} estudiantes \xb7 {selectedGrade.teachers.length} maestros \xb7 {selectedGrade.subjects.length} materias
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="flex items-center gap-3 py-3">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Progreso Promedio</p>
                        <p className={`text-lg font-bold ${getProgressTextColor(selectedGrade.avgProgress)}`}>
                          {selectedGrade.avgProgress}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 py-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Asistencia Promedio</p>
                        <p className="text-lg font-bold text-green-600">{selectedGrade.avgAttendance}%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Students List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Estudiantes ({selectedGrade.students.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="h-8 w-40 pl-7 text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => openAddStudent(selectedGrade)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs text-white ${getAvatarColor(student.id)}`}>
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{student.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Progreso: {student.progress}%</span>
                              <span>Asistencia: {student.attendance}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Progress value={student.progress} className="h-1.5 w-16" />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredStudents.length === 0 && studentSearch && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No se encontraron estudiantes
                      </p>
                    )}
                  </div>
                </div>

                {/* Assigned Teachers */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <UserCheck className="h-4 w-4" />
                    Maestros Asignados ({selectedGrade.teachers.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedGrade.teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-green-500 text-white">
                              {getInitials(teacher.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{teacher.name}</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {teacher.subjects.map((subject) => (
                                <Badge key={subject} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            setDetailDialogOpen(false)
                            openAssignTeacher(selectedGrade)
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Cambiar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4" />
                    Materias ({selectedGrade.subjects.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGrade.subjects.map((subject) => (
                      <Badge key={subject.id} variant="secondary" className="text-xs px-2.5 py-1">
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => openAddStudent(selectedGrade)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Agregar Estudiante
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== ASSIGN TEACHER DIALOG ===================== */}
      <Dialog open={assignTeacherDialogOpen} onOpenChange={setAssignTeacherDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Maestro</DialogTitle>
            <DialogDescription>
              {activeGradeForAction
                ? `Selecciona un maestro para asignar a ${activeGradeForAction.name}`
                : 'Selecciona un maestro'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Maestro</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar maestro..." />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch teachers from API GET /api/admin/teachers */}
                  {[
                    { id: 't1', name: 'Ana L\xf3pez', subjects: 'Espa\xf1ol, Historia' },
                    { id: 't2', name: 'Laura Mart\xednez', subjects: 'Matem\xe1ticas, Ciencia' },
                    { id: 't3', name: 'Miguel Ram\xedrez', subjects: 'Ingl\xe9s, Ingl\xe9s Conversacional' },
                    { id: 't4', name: 'Javier Moreno', subjects: 'Rob\xf3tica, Ciencia' },
                    { id: 't5', name: 'Carmen D\xedaz', subjects: 'Arte, M\xfasica' },
                    { id: 't6', name: 'Roberto Fern\xe1ndez', subjects: 'Educaci\xf3n F\xedsica, Salud' },
                  ].map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex flex-col">
                        <span>{teacher.name}</span>
                        <span className="text-xs text-muted-foreground">{teacher.subjects}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTeacherDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacherId}>
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== ADD STUDENT DIALOG ===================== */}
      <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Estudiante</DialogTitle>
            <DialogDescription>
              {activeGradeForAction
                ? `A\xf1adir un nuevo estudiante a ${activeGradeForAction.name}`
                : 'A\xf1adir un nuevo estudiante'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre completo del estudiante</label>
              <Input
                placeholder="Ej: Juan P\xe9rez Garc\xeda"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Este estudiante ser\xe1 agregado al grado seleccionado. Se crear\xe1 una cuenta con credenciales predeterminadas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStudent} disabled={!newStudentName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Estudiante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

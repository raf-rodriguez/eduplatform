import React, { useState } from 'react'
import {
  Award,
  Star,
  Trophy,
  Users,
  Plus,
  Gift,
  Crown,
  Search,
  TrendingUp,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

// --- Types ---

interface Badge {
  id: string
  name: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
  criteria: string
  awardedCount: number
  totalEligible: number
}

interface StudentBadgeRecord {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  badgeId: string
  badgeName: string
  badgeRarity: string
  awardedAt: string
  awardedBy: string
  reason?: string
  isAutoAwarded: boolean
}

interface Student {
  id: string
  name: string
  email: string
  badgeCount: number
}

// --- Simulated Data (TODO: Replace with API calls) ---

const BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Primera Leccion',
    description: 'Completa tu primera leccion exitosamente',
    rarity: 'common',
    icon: 'star',
    criteria: 'Completar 1 leccion',
    awardedCount: 45,
    totalEligible: 50,
  },
  {
    id: 'b2',
    name: 'Estudiante Dedicado',
    description: 'Completa 10 lecciones en un mes',
    rarity: 'uncommon',
    icon: 'award',
    criteria: '10 lecciones en 30 dias',
    awardedCount: 18,
    totalEligible: 50,
  },
  {
    id: 'b3',
    name: 'Perfeccionista',
    description: 'Obten 100% en 5 evaluaciones consecutivas',
    rarity: 'rare',
    icon: 'trophy',
    criteria: '5 examenes con puntaje perfecto',
    awardedCount: 5,
    totalEligible: 50,
  },
  {
    id: 'b4',
    name: 'Maestro del Conocimiento',
    description: 'Completa todas las lecciones de un curso',
    rarity: 'epic',
    icon: 'crown',
    criteria: 'Finalizar un curso completo',
    awardedCount: 2,
    totalEligible: 50,
  },
  {
    id: 'b5',
    name: 'Leyenda Académica',
    description: 'Manten un promedio perfecto durante todo el semestre',
    rarity: 'legendary',
    icon: 'crown',
    criteria: 'Promedio 100% en todo el semestre',
    awardedCount: 1,
    totalEligible: 50,
  },
  {
    id: 'b6',
    name: 'Explorador',
    description: 'Visita todas las secciones de la plataforma',
    rarity: 'common',
    icon: 'star',
    criteria: 'Explorar 5 secciones diferentes',
    awardedCount: 38,
    totalEligible: 50,
  },
  {
    id: 'b7',
    name: 'Trabajo en Equipo',
    description: 'Participa en 3 foros de discusion',
    rarity: 'uncommon',
    icon: 'users',
    criteria: 'Publicar en 3 foros distintos',
    awardedCount: 22,
    totalEligible: 50,
  },
  {
    id: 'b8',
    name: 'Racha de Fuego',
    description: 'Inicia sesion 30 dias consecutivos',
    rarity: 'rare',
    icon: 'award',
    criteria: '30 dias de racha consecutiva',
    awardedCount: 7,
    totalEligible: 50,
  },
  {
    id: 'b9',
    name: 'Ayudante Estelar',
    description: 'Ayuda a 5 compañeros con sus dudas',
    rarity: 'epic',
    icon: 'gift',
    criteria: 'Responder 5 preguntas de compañeros',
    awardedCount: 3,
    totalEligible: 50,
  },
  {
    id: 'b10',
    name: 'Genio Creativo',
    description: 'Presenta un proyecto final excepcional',
    rarity: 'legendary',
    icon: 'trophy',
    criteria: 'Proyecto final calificado con honores',
    awardedCount: 1,
    totalEligible: 50,
  },
]

const STUDENTS: Student[] = [
  { id: 's1', name: 'Ana Garcia', email: 'ana.garcia@escuela.edu', badgeCount: 6 },
  { id: 's2', name: 'Carlos Lopez', email: 'carlos.lopez@escuela.edu', badgeCount: 4 },
  { id: 's3', name: 'Maria Rodriguez', email: 'maria.rodriguez@escuela.edu', badgeCount: 7 },
  { id: 's4', name: 'Pedro Martinez', email: 'pedro.martinez@escuela.edu', badgeCount: 3 },
  { id: 's5', name: 'Sofia Hernandez', email: 'sofia.hernandez@escuela.edu', badgeCount: 5 },
  { id: 's6', name: 'Diego Sanchez', email: 'diego.sanchez@escuela.edu', badgeCount: 2 },
]

const BADGE_RECORDS: StudentBadgeRecord[] = [
  { id: 'r1', studentId: 's1', studentName: 'Ana Garcia', studentEmail: 'ana.garcia@escuela.edu', badgeId: 'b1', badgeName: 'Primera Leccion', badgeRarity: 'common', awardedAt: '2026-03-15', awardedBy: 'auto', isAutoAwarded: true },
  { id: 'r2', studentId: 's1', studentName: 'Ana Garcia', studentEmail: 'ana.garcia@escuela.edu', badgeId: 'b2', badgeName: 'Estudiante Dedicado', badgeRarity: 'uncommon', awardedAt: '2026-03-22', awardedBy: 'Prof. Demo', reason: 'Excelente dedicacion', isAutoAwarded: false },
  { id: 'r3', studentId: 's3', studentName: 'Maria Rodriguez', studentEmail: 'maria.rodriguez@escuela.edu', badgeId: 'b3', badgeName: 'Perfeccionista', badgeRarity: 'rare', awardedAt: '2026-03-10', awardedBy: 'auto', isAutoAwarded: true },
  { id: 'r4', studentId: 's3', studentName: 'Maria Rodriguez', studentEmail: 'maria.rodriguez@escuela.edu', badgeId: 'b4', badgeName: 'Maestro del Conocimiento', badgeRarity: 'epic', awardedAt: '2026-03-28', awardedBy: 'Prof. Demo', isAutoAwarded: false },
  { id: 'r5', studentId: 's5', studentName: 'Sofia Hernandez', studentEmail: 'sofia.hernandez@escuela.edu', badgeId: 'b1', badgeName: 'Primera Leccion', badgeRarity: 'common', awardedAt: '2026-03-18', awardedBy: 'auto', isAutoAwarded: true },
  { id: 'r6', studentId: 's2', studentName: 'Carlos Lopez', studentEmail: 'carlos.lopez@escuela.edu', badgeId: 'b6', badgeName: 'Explorador', badgeRarity: 'common', awardedAt: '2026-03-20', awardedBy: 'auto', isAutoAwarded: true },
  { id: 'r7', studentId: 's1', studentName: 'Ana Garcia', studentEmail: 'ana.garcia@escuela.edu', badgeId: 'b5', badgeName: 'Leyenda Academica', badgeRarity: 'legendary', awardedAt: '2026-04-01', awardedBy: 'Prof. Demo', reason: 'Promedio perfecto todo el semestre', isAutoAwarded: false },
  { id: 'r8', studentId: 's3', studentName: 'Maria Rodriguez', studentEmail: 'maria.rodriguez@escuela.edu', badgeId: 'b1', badgeName: 'Primera Leccion', badgeRarity: 'common', awardedAt: '2026-03-05', awardedBy: 'auto', isAutoAwarded: true },
]

// --- Helpers ---

const rarityConfig = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    badge: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    text: 'text-gray-600 dark:text-gray-400',
    ring: 'ring-gray-300',
    gradient: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
    label: 'Comun',
  },
  uncommon: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
    text: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-300',
    gradient: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    label: 'Poco Comun',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-300',
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    label: 'Raro',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-300 dark:border-purple-700',
    badge: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-300',
    gradient: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    label: 'Epico',
  },
  legendary: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
    text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-300',
    gradient: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
    label: 'Legendario',
  },
}

const getBadgeIcon = (icon: string) => {
  switch (icon) {
    case 'star':
      return Star
    case 'award':
      return Award
    case 'trophy':
      return Trophy
    case 'crown':
      return Crown
    case 'gift':
      return Gift
    case 'users':
      return Users
    default:
      return Award
  }
}

// --- Component ---

export default function BadgeManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [awardReason, setAwardReason] = useState('')
  const [autoAwardEnabled, setAutoAwardEnabled] = useState(true)
  const [records, setRecords] = useState<StudentBadgeRecord[]>(BADGE_RECORDS)

  // Filtered badges
  const filteredBadges = BADGES.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Stats calculations
  const mostAwardedBadge = [...BADGES].sort((a, b) => b.awardedCount - a.awardedCount)[0]
  const rarestBadge = [...BADGES].sort((a, b) => a.awardedCount - b.awardedCount)[0]
  const topStudent = [...STUDENTS].sort((a, b) => b.badgeCount - a.badgeCount)[0]
  const totalBadgesAwarded = records.length
  const autoAwardedCount = records.filter((r) => r.isAutoAwarded).length
  const manualAwardedCount = records.filter((r) => !r.isAutoAwarded).length

  // Student badge leaderboard
  const studentLeaderboard = STUDENTS.sort((a, b) => b.badgeCount - a.badgeCount)

  // Badge awarded to students mapping
  const getStudentsWithBadge = (badgeId: string) => {
    return records.filter((r) => r.badgeId === badgeId)
  }

  const handleAwardBadge = () => {
    if (!selectedBadge || !selectedStudent) return

    const student = STUDENTS.find((s) => s.id === selectedStudent)
    if (!student) return

    const newRecord: StudentBadgeRecord = {
      id: `r${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      badgeId: selectedBadge.id,
      badgeName: selectedBadge.name,
      badgeRarity: selectedBadge.rarity,
      awardedAt: new Date().toISOString().split('T')[0],
      awardedBy: 'Prof. Demo', // TODO: Get from auth context
      reason: awardReason || undefined,
      isAutoAwarded: false,
    }

    setRecords((prev) => [...prev, newRecord])
    // TODO: Call API to award badge: POST /badges/award
    setAwardDialogOpen(false)
    setSelectedStudent('')
    setAwardReason('')
  }

  const openAwardDialog = (badge: Badge) => {
    setSelectedBadge(badge)
    setAwardDialogOpen(true)
  }

  // --- Tab: Badges Disponibles ---
  const renderBadgesGallery = () => (
    <div className="space-y-6">
      {/* Search and auto-award toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="auto-award" className="text-sm">Otorgamiento automatico</Label>
          <Switch
            id="auto-award"
            checked={autoAwardEnabled}
            onCheckedChange={setAutoAwardEnabled}
          />
        </div>
      </div>

      {/* Badge cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const config = rarityConfig[badge.rarity]
          const IconComponent = getBadgeIcon(badge.icon)
          const studentsWithBadge = getStudentsWithBadge(badge.id)
          const awardRate = badge.totalEligible > 0
            ? Math.round((badge.awardedCount / badge.totalEligible) * 100)
            : 0

          return (
            <Card
              key={badge.id}
              className={`overflow-hidden border-2 ${config.border} transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group`}
            >
              <div className={`bg-gradient-to-br ${config.gradient} p-6 text-center`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-900 shadow-md ring-2 ${config.ring} mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`h-8 w-8 ${config.text}`} />
                </div>
                <h3 className="font-bold text-lg">{badge.name}</h3>
                <UIBadge className={`mt-2 ${config.badge}`}>
                  {config.label}
                </UIBadge>
              </div>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">{badge.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Criterio:</span>
                    <span className="font-medium">{badge.criteria}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Otorgados</span>
                      <span>{badge.awardedCount}/{badge.totalEligible} ({awardRate}%)</span>
                    </div>
                    <Progress value={awardRate} className="h-2" />
                  </div>
                </div>

                {studentsWithBadge.length > 0 && (
                  <div className="flex -space-x-2 pt-1">
                    {studentsWithBadge.slice(0, 4).map((record, idx) => (
                      <div
                        key={record.id}
                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                        title={record.studentName}
                      >
                        {record.studentName.charAt(0)}
                      </div>
                    ))}
                    {studentsWithBadge.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{studentsWithBadge.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => openAwardDialog(badge)}
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Otorgar Badge
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No se encontraron badges</h3>
          <p className="text-muted-foreground">Intenta con otro termino de busqueda</p>
        </div>
      )}
    </div>
  )

  // --- Tab: Otorgar Badge ---
  const renderAwardBadgeTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Otorgar Badge a Estudiante
          </CardTitle>
          <CardDescription>
            Selecciona un badge y un estudiante para otorgar manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Badge */}
          <div className="space-y-3">
            <Label>1. Selecciona un Badge</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BADGES.map((badge) => {
                const config = rarityConfig[badge.rarity]
                const IconComponent = getBadgeIcon(badge.icon)
                const isSelected = selectedBadge?.id === badge.id
                return (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${isSelected
                        ? `${config.border} ring-2 ${config.ring} shadow-md`
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} mb-2`}>
                      <IconComponent className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <p className="text-xs font-medium truncate">{badge.name}</p>
                    <UIBadge className={`mt-1 text-[10px] px-1.5 py-0 ${config.badge}`}>
                      {config.label}
                    </UIBadge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Select Student */}
          <div className="space-y-3">
            <Label>2. Selecciona un Estudiante</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estudiante..." />
              </SelectTrigger>
              <SelectContent>
                {STUDENTS.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 3: Reason */}
          <div className="space-y-3">
            <Label>3. Razon (opcional)</Label>
            <Textarea
              placeholder="Escribe una razon o comentario..."
              value={awardReason}
              onChange={(e) => setAwardReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedBadge && selectedStudent && (
            <Card className={`border-2 ${rarityConfig[selectedBadge.rarity].border}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${rarityConfig[selectedBadge.rarity].gradient}`}>
                    {React.createElement(getBadgeIcon(selectedBadge.icon), {
                      className: `h-6 w-6 ${rarityConfig[selectedBadge.rarity].text}`,
                    })}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      Otorgar &quot;{selectedBadge.name}&quot; a{' '}
                      {STUDENTS.find((s) => s.id === selectedStudent)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleAwardBadge}
            disabled={!selectedBadge || !selectedStudent}
            className="w-full gap-2"
            size="lg"
          >
            <Award className="h-5 w-5" />
            Otorgar Badge
          </Button>
        </CardContent>
      </Card>

      {/* Recent awards */}
      <Card>
        <CardHeader>
          <CardTitle>Otorgamientos Recientes</CardTitle>
          <CardDescription>Ultimos badges otorgados manualmente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records
              .filter((r) => !r.isAutoAwarded)
              .slice(-5)
              .reverse()
              .map((record) => {
                const config = rarityConfig[record.badgeRarity as keyof typeof rarityConfig]
                return (
                  <div
                    key={record.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${config.border} ${config.bg}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.badge}`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{record.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        Recibio &quot;{record.badgeName}&quot;
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{record.awardedAt}</p>
                      <p>por {record.awardedBy}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // --- Tab: Ranking de Badges ---
  const renderRanking = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking de Estudiantes por Badges
          </CardTitle>
          <CardDescription>
            Estudiantes ordenados por cantidad de badges obtenidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentLeaderboard.map((student, index) => {
              const isTop3 = index < 3
              const medals = ['1', '2', '3']
              const trophyColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${isTop3 ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/30' : 'border-border'
                    }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-lg">
                    {isTop3 ? (
                      <Trophy className={`h-6 w-6 ${trophyColors[index]}`} />
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{student.name}</p>
                      {index === 0 && (
                        <UIBadge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Lider
                        </UIBadge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: student.badgeCount }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{student.badgeCount}</p>
                    <p className="text-xs text-muted-foreground">badges</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge collection per student */}
      <Card>
        <CardHeader>
          <CardTitle>Colecciones de Badges por Estudiante</CardTitle>
          <CardDescription>
            Detalle de badges obtenidos por cada estudiante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {STUDENTS.map((student) => {
              const studentRecords = records.filter((r) => r.studentId === student.id)
              return (
                <div key={student.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-medium">{student.name}</span>
                    <UIBadge variant="secondary">{studentRecords.length} badges</UIBadge>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-10">
                    {studentRecords.length > 0 ? (
                      studentRecords.map((record) => {
                        const config = rarityConfig[record.badgeRarity as keyof typeof rarityConfig]
                        const IconComponent = getBadgeIcon(
                          BADGES.find((b) => b.id === record.badgeId)?.icon || 'award'
                        )
                        return (
                          <div
                            key={record.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${config.border} ${config.bg}`}
                            title={record.badgeName}
                          >
                            <IconComponent className={`h-4 w-4 ${config.text}`} />
                            <span className="font-medium">{record.badgeName}</span>
                            {record.isAutoAwarded ? (
                              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Gift className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Sin badges aun</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // --- Tab: Estadisticas ---
  const renderStatistics = () => {
    const badgesByRarity = BADGES.reduce(
      (acc, badge) => {
        acc[badge.rarity] = (acc[badge.rarity] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const autoAwardRate = totalBadgesAwarded > 0
      ? Math.round((autoAwardedCount / totalBadgesAwarded) * 100)
      : 0

    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totalBadgesAwarded}</p>
              <p className="text-sm text-muted-foreground">Total Otorgados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold">{autoAwardedCount}</p>
              <p className="text-sm text-muted-foreground">Auto-Otorgados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-3">
                <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{manualAwardedCount}</p>
              <p className="text-sm text-muted-foreground">Manuales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-3xl font-bold">{BADGES.length}</p>
              <p className="text-sm text-muted-foreground">Badges Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Rarity distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribucion por Rareza</CardTitle>
            <CardDescription>Cantidad de badges por nivel de rareza</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.entries(rarityConfig) as [keyof typeof rarityConfig, typeof rarityConfig[keyof typeof rarityConfig]][]).map(
                ([rarity, config]) => {
                  const count = badgesByRarity[rarity] || 0
                  const percentage = BADGES.length > 0 ? Math.round((count / BADGES.length) * 100) : 0
                  return (
                    <div key={rarity} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <UIBadge className={config.badge}>{config.label}</UIBadge>
                          <span className="text-muted-foreground">{count} badges</span>
                        </div>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most awarded & rarest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Badge Mas Otorgado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostAwardedBadge && (
                <div className={`p-4 rounded-lg bg-gradient-to-br ${rarityConfig[mostAwardedBadge.rarity].gradient} border-2 ${rarityConfig[mostAwardedBadge.rarity].border}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-md`}>
                      {React.createElement(getBadgeIcon(mostAwardedBadge.icon), {
                        className: `h-7 w-7 ${rarityConfig[mostAwardedBadge.rarity].text}`,
                      })}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{mostAwardedBadge.name}</p>
                      <p className="text-sm text-muted-foreground">{mostAwardedBadge.description}</p>
                      <p className="mt-1 font-semibold">
                        {mostAwardedBadge.awardedCount} otorgados
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Badge Mas Raro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rarestBadge && (
                <div className={`p-4 rounded-lg bg-gradient-to-br ${rarityConfig[rarestBadge.rarity].gradient} border-2 ${rarityConfig[rarestBadge.rarity].border}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-md`}>
                      {React.createElement(getBadgeIcon(rarestBadge.icon), {
                        className: `h-7 w-7 ${rarityConfig[rarestBadge.rarity].text}`,
                      })}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{rarestBadge.name}</p>
                      <p className="text-sm text-muted-foreground">{rarestBadge.description}</p>
                      <p className="mt-1 font-semibold">
                        Solo {rarestBadge.awardedCount} otorgado{rarestBadge.awardedCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Auto vs manual chart */}
        <Card>
          <CardHeader>
            <CardTitle>Metodo de Otorgamiento</CardTitle>
            <CardDescription>
              Distribucion entre otorgamiento automatico y manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{autoAwardRate}%</p>
                <p className="text-sm text-muted-foreground">Automatico</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <Gift className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{100 - autoAwardRate}%</p>
                <p className="text-sm text-muted-foreground">Manual</p>
              </div>
            </div>

            {/* TODO: Replace with actual chart library like recharts */}
            <div className="p-4 rounded-lg bg-muted/50 border text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                TODO: Integrar grafico de barras con recharts para mostrar tendencias de otorgamiento por semana
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Student with most badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Estudiante Destacado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStudent && (
              <div className="flex items-center gap-6 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-200 dark:border-yellow-800">
                <div className="w-16 h-16 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center text-2xl font-bold">
                  {topStudent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{topStudent.name}</p>
                  <p className="text-muted-foreground">{topStudent.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: topStudent.badgeCount }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{topStudent.badgeCount}</p>
                  <p className="text-sm text-muted-foreground">badges</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Main Render ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Gestion de Badges
          </h1>
          <p className="text-muted-foreground">
            Administra y otorga badges de logro a tus estudiantes
          </p>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Badges Disponibles</span>
            <span className="sm:hidden">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Otorgar Badge</span>
            <span className="sm:hidden">Otorgar</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Ranking de Badges</span>
            <span className="sm:hidden">Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Estadisticas</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">{renderBadgesGallery()}</TabsContent>
        <TabsContent value="award">{renderAwardBadgeTab()}</TabsContent>
        <TabsContent value="ranking">{renderRanking()}</TabsContent>
        <TabsContent value="stats">{renderStatistics()}</TabsContent>
      </Tabs>

      {/* Award Badge Dialog */}
      <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Otorgar Badge
            </DialogTitle>
            <DialogDescription>
              Otorgar &quot;{selectedBadge?.name}&quot; a un estudiante
            </DialogDescription>
          </DialogHeader>

          {selectedBadge && (
            <div className="space-y-4">
              {/* Badge preview */}
              <div className={`p-4 rounded-lg bg-gradient-to-br ${rarityConfig[selectedBadge.rarity].gradient} border-2 ${rarityConfig[selectedBadge.rarity].border}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow">
                    {React.createElement(getBadgeIcon(selectedBadge.icon), {
                      className: `h-6 w-6 ${rarityConfig[selectedBadge.rarity].text}`,
                    })}
                  </div>
                  <div>
                    <p className="font-bold">{selectedBadge.name}</p>
                    <UIBadge className={rarityConfig[selectedBadge.rarity].badge}>
                      {rarityConfig[selectedBadge.rarity].label}
                    </UIBadge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{selectedBadge.description}</p>
              </div>

              {/* Student selection */}
              <div className="space-y-2">
                <Label>Estudiante</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estudiante..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENTS.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Razon (opcional)</Label>
                <Textarea
                  placeholder="Escribe una razon..."
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAwardBadge}
              disabled={!selectedStudent}
              className="gap-2"
            >
              <Gift className="h-4 w-4" />
              Otorgar Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

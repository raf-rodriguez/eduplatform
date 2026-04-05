import { useState, useEffect } from 'react'
import { Mail, Phone, Calendar, BookOpen, Award, Edit2, Save, Camera, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { getInitials, formatDate } from '@/lib/utils'

const gradeNames: Record<number, string> = {
  0: 'Pre-Kínder', 1: 'Kínder', 2: 'Primer Grado', 3: 'Segundo Grado',
  4: 'Tercer Grado', 5: 'Cuarto Grado', 6: 'Quinto Grado', 7: 'Sexto Grado',
  8: 'Séptimo Grado', 9: 'Octavo Grado', 10: 'Noveno Grado', 11: 'Décimo Grado',
  12: 'Undécimo Grado', 13: 'Duodécimo Grado',
}

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
    gradeLevel: user?.gradeLevel,
    avatarUrl: user?.avatarUrl || '',
  })
  const [gamification, setGamification] = useState<{ level: number; totalXp: number; currentStreak: number } | null>(null)
  const [stats, setStats] = useState<{ completedLessons: number; assessments: number; avgScore: number } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamifRes, progressRes] = await Promise.all([
          api.get('/gamification/profile'),
          api.get('/progress/summary'),
        ])
        setGamification(gamifRes.data)
        setStats({
          completedLessons: progressRes.data?.completed || 0,
          assessments: progressRes.data?.totalAssessments || 0,
          avgScore: progressRes.data?.averageScore || 0,
        })
      } catch {
        // Silently fail - gamification might not be set up
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.put(`/users/${user?.id}`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gradeLevel: profile.gradeLevel,
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        birthDate: profile.birthDate,
        bio: profile.bio,
      })
      setUser({
        ...user!,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone,
        birthDate: profile.birthDate,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      })
      toast({ title: 'Perfil actualizado', description: 'Tu información ha sido guardada exitosamente.' })
      setIsEditing(false)
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el perfil.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || '',
      gradeLevel: user?.gradeLevel,
      avatarUrl: user?.avatarUrl || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-2xl">{getInitials(`${profile.firstName} ${profile.lastName}`)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">Estudiante</Badge>
                {profile.gradeLevel !== undefined && (
                  <Badge variant="outline">{gradeNames[profile.gradeLevel] || 'Grado desconocido'}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (xxx) xxx-xxxx"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Grado</Label>
                <select
                  id="gradeLevel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={profile.gradeLevel ?? ''}
                  onChange={(e) => setProfile({ ...profile, gradeLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                  <option value="">Seleccionar grado</option>
                  {Object.entries(gradeNames).map(([level, name]) => (
                    <option key={level} value={level}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.birthDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                      <p className="font-medium">{formatDate(profile.birthDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {profile.gradeLevel !== undefined && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Grado Actual</p>
                      <p className="font-medium">{gradeNames[profile.gradeLevel]}</p>
                    </div>
                  </div>
                )}
                {gamification && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">XP Total</p>
                      <p className="font-medium">{gamification.totalXp} XP (Nivel {gamification.level})</p>
                    </div>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Biografía</p>
                    <p className="font-medium">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lecciones Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.completedLessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.assessments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgScore.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

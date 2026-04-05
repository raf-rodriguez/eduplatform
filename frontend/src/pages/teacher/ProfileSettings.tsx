import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Save,
  Camera,
  Shield,
  BookOpen,
  Calendar,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationPrefs {
  emailNotifications: boolean
  inAppNotifications: boolean
  emailSubmissions: boolean
  emailAlerts: boolean
  inAppReminders: boolean
  inAppMessages: boolean
}

interface TeachingInfo {
  subjects: string
  grades: string
  bio: string
}

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('perfil')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile state
  const [profile, setProfile] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  })

  // Password state
  const [passwords, setPasswords] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNotifications: true,
    inAppNotifications: true,
    emailSubmissions: true,
    emailAlerts: true,
    inAppReminders: true,
    inAppMessages: true,
  })

  // Teaching info
  const [teachingInfo, setTeachingInfo] = useState<TeachingInfo>({
    subjects: '',
    grades: '',
    bio: profile.bio || '',
  })

  // TODO: Fetch profile data from GET /api/users/profile on mount
  // TODO: Fetch notification preferences from GET /api/users/:id/notifications
  // TODO: Fetch teaching info from GET /api/teachers/:id/info

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationToggle = (field: keyof NotificationPrefs) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleTeachingInfoChange = (field: keyof TeachingInfo, value: string) => {
    setTeachingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Solo se permiten archivos de imagen.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no debe superar los 5MB.' })
      return
    }

    setIsUploading(true)
    setMessage(null)

    try {
      // TODO: Backend endpoint POST /api/users/avatar for multipart upload
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const avatarUrl = response.data.data.avatarUrl
      setUser({ ...user!, avatarUrl })
      setMessage({ type: 'success', text: 'Foto de perfil actualizada correctamente.' })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al subir la imagen. Intente de nuevo.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Backend endpoint PUT /api/users/profile
      await api.put('/users/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
      })

      // Update local auth store
      setUser({
        ...user!,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
      })

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar el perfil.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' })
      return
    }

    if (passwords.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Backend endpoint POST /api/users/change-password
      await api.post('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar la contraseña.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Backend endpoint PUT /api/users/:id/notifications
      await api.put(`/users/${user?.id}/notifications`, notifications)
      setMessage({ type: 'success', text: 'Preferencias de notificación actualizadas.' })
    } catch (error: any) {
      console.error('Error updating notifications:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar las preferencias.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTeachingInfo = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Backend endpoint PUT /api/teachers/:id/info
      await api.put(`/teachers/${user?.id}/info`, teachingInfo)
      setMessage({ type: 'success', text: 'Información docente actualizada correctamente.' })
    } catch (error: any) {
      console.error('Error updating teaching info:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar la información docente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    return `${(profile.firstName?.[0] || '').toUpperCase()}${(profile.lastName?.[0] || '').toUpperCase()}`
  }

  // TODO: Fetch memberSince and lastLogin from GET /api/users/:id/account-info
  const memberSince = 'Enero 2025'
  const lastLogin = 'Hace 2 horas'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración de Perfil</h1>
        <p className="text-muted-foreground">Administra tu información personal y preferencias</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl} alt="Avatar" />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{profile.firstName} {profile.lastName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Haz clic en el ícono de cámara para cambiar tu foto de perfil
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="info-docente" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Info Docente
          </TabsTrigger>
        </TabsList>

        {/* Perfil Tab */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tus datos personales y cómo apareces ante los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        className="pl-10"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        className="pl-10"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+52 (000) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Cuéntales a tus estudiantes sobre tu experiencia y pasión por la enseñanza..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta biografía será visible para tus estudiantes.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad Tab */}
        <TabsContent value="seguridad">
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Asegúrate de usar una contraseña fuerte y única
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="pl-10"
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="pl-10"
                        placeholder="Mínimo 8 caracteres"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usa al menos 8 caracteres con mayúsculas, números y símbolos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="pl-10"
                        placeholder="Repite la nueva contraseña"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                      <Lock className="mr-2 h-4 w-4" />
                      {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Información de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Miembro desde</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Último acceso</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{lastLogin}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificación
              </CardTitle>
              <CardDescription>
                Elige cómo y cuándo deseas recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notificaciones por Correo
                </h4>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Notificaciones por correo</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibe actualizaciones generales en tu correo
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Entregas de estudiantes</Label>
                      <p className="text-xs text-muted-foreground">
                        Notificación cuando un estudiante entregue una tarea
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailSubmissions}
                      onCheckedChange={() => handleNotificationToggle('emailSubmissions')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Alertas de rendimiento</Label>
                      <p className="text-xs text-muted-foreground">
                        Alertas cuando un estudiante esté en riesgo
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={() => handleNotificationToggle('emailAlerts')}
                    />
                  </div>
                </div>
              </div>

              {/* In-App Notifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificaciones en la Aplicación
                </h4>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Notificaciones en la app</Label>
                      <p className="text-xs text-muted-foreground">
                        Activa las notificaciones dentro de la plataforma
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inAppNotifications}
                      onCheckedChange={() => handleNotificationToggle('inAppNotifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Recordatorios</Label>
                      <p className="text-xs text-muted-foreground">
                        Recordatorios de tareas y evaluaciones próximas
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inAppReminders}
                      onCheckedChange={() => handleNotificationToggle('inAppReminders')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Mensajes</Label>
                      <p className="text-xs text-muted-foreground">
                        Notificación cuando recibas un mensaje
                      </p>
                    </div>
                    <Switch
                      checked={notifications.inAppMessages}
                      onCheckedChange={() => handleNotificationToggle('inAppMessages')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Docente Tab */}
        <TabsContent value="info-docente">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Información Docente
              </CardTitle>
              <CardDescription>
                Configura las materias y niveles que impartes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTeachingInfo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subjects">Materias que Impartes</Label>
                  <Input
                    id="subjects"
                    value={teachingInfo.subjects}
                    onChange={(e) => handleTeachingInfoChange('subjects', e.target.value)}
                    placeholder="Ej: Matemáticas, Física, Química (separadas por comas)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separa cada materia con una coma.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grades">Grados / Niveles</Label>
                  <Input
                    id="grades"
                    value={teachingInfo.grades}
                    onChange={(e) => handleTeachingInfoChange('grades', e.target.value)}
                    placeholder="Ej: 1° Secundaria, 2° Secundaria, Preparatoria"
                  />
                  <p className="text-xs text-muted-foreground">
                    Indica los grados o niveles educativos en los que enseñas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachingBio">Biografía Profesional</Label>
                  <Textarea
                    id="teachingBio"
                    value={teachingInfo.bio}
                    onChange={(e) => handleTeachingInfoChange('bio', e.target.value)}
                    placeholder="Comparte tu experiencia docente, formación académica y filosofía de enseñanza..."
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta información ayuda a los estudiantes y padres a conocerte mejor.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Guardando...' : 'Guardar Información'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

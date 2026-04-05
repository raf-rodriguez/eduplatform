import { useState, useRef, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Save,
  Camera,
  Shield,
  Calendar,
  Activity,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'

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
  emailAlerts: boolean
  auditReports: boolean
  systemAlerts: boolean
  userActivityReports: boolean
}

export default function AdminProfile() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('perfil')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
    emailAlerts: true,
    auditReports: true,
    systemAlerts: true,
    userActivityReports: true,
  })

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newAvatarUrl = response.data.avatarUrl
      setUser({
        ...user!,
        avatarUrl: newAvatarUrl,
      })

      toast({
        title: 'Éxito',
        description: 'Foto de perfil actualizada correctamente',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar la foto de perfil',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleProfileSave = async () => {
    setIsLoading(true)
    try {
      await api.put(`/users/${user?.id}`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
      })

      setUser({
        ...user!,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone,
        bio: profile.bio,
      })

      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      })
      return
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await api.put(`/users/${user?.id}/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })

      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
      })

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar la contraseña',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    setIsLoading(true)
    try {
      await api.put(`/users/${user?.id}/notifications`, notifications)

      toast({
        title: 'Éxito',
        description: 'Preferencias de notificación actualizadas',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudieron actualizar las preferencias',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Administrador',
    TEACHER: 'Profesor',
    STUDENT: 'Estudiante',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu información personal y preferencias</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y foto de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user?.name || 'Admin')}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 cursor-pointer hover:bg-primary/90" onClick={handleAvatarClick}>
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <div className="flex gap-2 mt-2">
                    {user?.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {roleLabels[role] || role}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roles Activos</p>
                    <p className="text-2xl font-bold">{user?.roles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último Acceso</p>
                    <p className="text-2xl font-bold">Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="text-2xl font-bold text-green-600">Activo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="seguridad">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad de la Cuenta</CardTitle>
              <CardDescription>Información de seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
                </div>
                <Badge variant="secondary">No activado</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Último Cambio de Contraseña</p>
                  <p className="text-sm text-muted-foreground">Fecha de la última actualización</p>
                </div>
                <Badge variant="outline">N/A</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>Controla cómo y cuándo recibes notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-4">Notificaciones Generales</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones por Email</p>
                      <p className="text-sm text-muted-foreground">Recibe actualizaciones importantes por correo</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones en la App</p>
                      <p className="text-sm text-muted-foreground">Muestra alertas dentro de la plataforma</p>
                    </div>
                    <Switch
                      checked={notifications.inAppNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, inAppNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4">Alertas de Administrador</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas de Seguridad</p>
                      <p className="text-sm text-muted-foreground">Notificaciones sobre incidentes de seguridad</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, emailAlerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reportes de Auditoría</p>
                      <p className="text-sm text-muted-foreground">Resúmenes periódicos de actividad</p>
                    </div>
                    <Switch
                      checked={notifications.auditReports}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, auditReports: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas del Sistema</p>
                      <p className="text-sm text-muted-foreground">Problemas técnicos y mantenimiento</p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, systemAlerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reportes de Actividad de Usuarios</p>
                      <p className="text-sm text-muted-foreground">Resúmenes de actividad de usuarios</p>
                    </div>
                    <Switch
                      checked={notifications.userActivityReports}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, userActivityReports: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationSave} disabled={isLoading} className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

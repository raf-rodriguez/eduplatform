import { useState } from 'react'
import {
  Save,
  Settings,
  Shield,
  Lock,
  Mail,
  Database,
  Server,
  Key,
  Globe,
  Clock,
  Bell,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  HardDrive,
  FileText,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

// ============================================================
// TODO: Mover estas interfaces a un archivo de tipos compartido
// TODO: Reemplazar con llamadas reales al backend
// ============================================================

interface GeneralSettings {
  platformName: string
  supportEmail: string
  defaultLanguage: string
  timezone: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  maxLoginAttempts: number
}

interface SecuritySettings {
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecial: boolean
  passwordExpiryDays: string
  sessionTimeout: number
  rememberMeDuration: string
  concurrentSessions: string
  maxFailedAttempts: number
  lockoutDuration: number
  autoUnlock: boolean
}

interface AuthSettings {
  jwtExpiration: string
  refreshTokenExpiration: string
  enable2FA: boolean
  force2FAForAdmins: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  inAppNotifications: boolean
  notificationFrequency: string
  digestEmail: string
}

interface StorageSettings {
  storageProvider: string
  maxUploadSize: number
  allowedFileTypes: string
  storageUsed: number
  storageTotal: number
}

interface MaintenanceSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
  lastBackupDate: string
  lastBackupSize: string
  backupSchedule: string
}

interface APISettings {
  openaiApiKey: string
  stripeApiKey: string
  sendgridApiKey: string
  redisConnected: boolean
  rateLimitRequests: number
  rateLimitWindow: string
}

export default function SystemSettings() {
  const { toast } = useToast()

  // ==================== Estado de cada tab ====================
  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: 'EduPlatform',
    supportEmail: 'soporte@eduplatform.com',
    defaultLanguage: 'es',
    timezone: 'America/Mexico_City',
    maintenanceMode: false,
    registrationEnabled: true,
    maxLoginAttempts: 5,
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    passwordExpiryDays: '90',
    sessionTimeout: 30,
    rememberMeDuration: '7d',
    concurrentSessions: 'deny',
    maxFailedAttempts: 5,
    lockoutDuration: 30,
    autoUnlock: true,
  })

  const [auth, setAuth] = useState<AuthSettings>({
    jwtExpiration: '1h',
    refreshTokenExpiration: '7d',
    enable2FA: false,
    force2FAForAdmins: true,
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    inAppNotifications: true,
    notificationFrequency: 'immediate',
    digestEmail: 'weekly',
  })

  const [storage, setStorage] = useState<StorageSettings>({
    storageProvider: 'local',
    maxUploadSize: 50,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png,mp4,zip',
    storageUsed: 67,
    storageTotal: 100,
  })

  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    maintenanceMode: false,
    maintenanceMessage: 'El sistema se encuentra en mantenimiento. Vuelva pronto.',
    lastBackupDate: '2026-04-03 02:00:00',
    lastBackupSize: '2.4 GB',
    backupSchedule: 'daily',
  })

  const [api, setApi] = useState<APISettings>({
    openaiApiKey: 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    stripeApiKey: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    sendgridApiKey: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    redisConnected: true,
    rateLimitRequests: 100,
    rateLimitWindow: '15m',
  })

  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showStripeKey, setShowStripeKey] = useState(false)
  const [showSendgridKey, setShowSendgridKey] = useState(false)
  const [saving, setSaving] = useState(false)

  // ==================== Helpers ============================
  const maskKey = (key: string) => {
    if (key.length <= 8) return '****'
    return key.slice(0, 8) + '•'.repeat(Math.min(key.length - 8, 20))
  }

  const storagePercentage = Math.round((storage.storageUsed / storage.storageTotal) * 100)

  const handleSave = (tabName: string) => {
    setSaving(true)
    // TODO: Implementar llamada real al backend
    // await saveSettings(tabName, getSettingsForTab(tabName))
    setTimeout(() => {
      setSaving(false)
      toast({
        title: 'Configuracion guardada',
        description: `Los cambios de "${tabName}" se han aplicado correctamente.`,
      })
    }, 800)
  }

  const handleSaveAll = () => {
    setSaving(true)
    // TODO: Implementar llamada real al backend para guardar toda la configuracion
    // await saveAllSettings({ general, security, auth, notifications, storage, maintenance, api })
    setTimeout(() => {
      setSaving(false)
      toast({
        title: 'Configuracion guardada',
        description: 'Todos los cambios se han aplicado correctamente.',
      })
    }, 800)
  }

  const handleCreateBackup = () => {
    // TODO: Implementar llamada real al backend para crear backup
    // await createBackup()
    toast({
      title: 'Backup iniciado',
      description: 'La copia de seguridad se esta creando. Se notificara cuando este lista.',
    })
  }

  const handleClearCache = () => {
    // TODO: Implementar llamada real al backend para limpiar cache
    // await clearCache()
    toast({
      title: 'Cache limpiado',
      description: 'El cache del sistema ha sido eliminado correctamente.',
    })
  }

  const handleTestOpenAI = () => {
    // TODO: Implementar prueba de conexion real con OpenAI
    // const result = await testOpenAIConnection(api.openaiApiKey)
    toast({
      title: 'Probando conexion OpenAI',
      description: 'Verificando credenciales con la API de OpenAI...',
    })
    setTimeout(() => {
      toast({
        title: 'OpenAI conectado',
        description: 'La conexion con OpenAI es exitosa.',
      })
    }, 2000)
  }

  const handleCleanupOldFiles = () => {
    // TODO: Implementar limpieza de archivos antiguos
    toast({
      title: 'Limpieza iniciada',
      description: 'Los archivos antiguos se estan eliminando...',
    })
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracion del Sistema</h1>
        <p className="text-muted-foreground">
          Administra la configuracion global de la plataforma
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="autenticacion" className="flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Autenticacion</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="almacenamiento" className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Almacenamiento</span>
          </TabsTrigger>
          <TabsTrigger value="mantenimiento" className="flex items-center gap-1.5">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Mantenimiento</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1.5">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            TAB 1: General
        ================================================================ */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuracion General
              </CardTitle>
              <CardDescription>
                Ajustes basicos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="platformName">Nombre de la plataforma</Label>
                  <Input
                    id="platformName"
                    value={general.platformName}
                    onChange={(e) =>
                      setGeneral({ ...general, platformName: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">Email de soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) =>
                      setGeneral({ ...general, supportEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="defaultLanguage">Idioma predeterminado</Label>
                  <Select
                    value={general.defaultLanguage}
                    onValueChange={(value) =>
                      setGeneral({ ...general, defaultLanguage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Espanol</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Portugues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select
                    value={general.timezone}
                    onValueChange={(value) =>
                      setGeneral({ ...general, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">
                        America/Ciudad de Mexico (GMT-6)
                      </SelectItem>
                      <SelectItem value="America/Bogota">
                        America/Bogota (GMT-5)
                      </SelectItem>
                      <SelectItem value="America/Argentina/Buenos_Aires">
                        America/Buenos Aires (GMT-3)
                      </SelectItem>
                      <SelectItem value="Europe/Madrid">
                        Europa/Madrid (GMT+1)
                      </SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Modo mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar pagina de mantenimiento a los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={general.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setGeneral({ ...general, maintenanceMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Registro de usuarios</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir nuevos registros en la plataforma
                    </p>
                  </div>
                  <Switch
                    checked={general.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setGeneral({ ...general, registrationEnabled: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxLoginAttempts">
                  Intentos maximos de inicio de sesion
                </Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min={3}
                  max={10}
                  value={general.maxLoginAttempts}
                  onChange={(e) =>
                    setGeneral({
                      ...general,
                      maxLoginAttempts: parseInt(e.target.value) || 5,
                    })
                  }
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave('General')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 2: Seguridad
        ================================================================ */}
        <TabsContent value="seguridad" className="space-y-4">
          {/* Politica de contrasenas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Politica de Contrasenas
              </CardTitle>
              <CardDescription>
                Configura los requisitos minimimos para las contrasenas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="passwordMinLength">
                    Longitud minima: {security.passwordMinLength} caracteres
                  </Label>
                </div>
                <input
                  id="passwordMinLength"
                  type="range"
                  min={6}
                  max={20}
                  value={security.passwordMinLength}
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      passwordMinLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6</span>
                  <span>20</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Requerir mayusculas</Label>
                    <p className="text-xs text-muted-foreground">
                      Al menos una letra mayuscula (A-Z)
                    </p>
                  </div>
                  <Switch
                    checked={security.passwordRequireUppercase}
                    onCheckedChange={(checked) =>
                      setSecurity({
                        ...security,
                        passwordRequireUppercase: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Requerir numeros</Label>
                    <p className="text-xs text-muted-foreground">
                      Al menos un numero (0-9)
                    </p>
                  </div>
                  <Switch
                    checked={security.passwordRequireNumbers}
                    onCheckedChange={(checked) =>
                      setSecurity({
                        ...security,
                        passwordRequireNumbers: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Requerir caracteres especiales</Label>
                    <p className="text-xs text-muted-foreground">
                      Al menos un caracter especial (!@#$%^&*...)
                    </p>
                  </div>
                  <Switch
                    checked={security.passwordRequireSpecial}
                    onCheckedChange={(checked) =>
                      setSecurity({
                        ...security,
                        passwordRequireSpecial: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="passwordExpiry">Expiracion de contrasena</Label>
                <Select
                  value={security.passwordExpiryDays}
                  onValueChange={(value) =>
                    setSecurity({ ...security, passwordExpiryDays: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="never">Nunca expira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Configuracion de sesiones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuracion de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">
                    Tiempo de espera de sesion (minutos)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min={5}
                    max={480}
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rememberMeDuration">
                    Duracion de "Recordarme"
                  </Label>
                  <Select
                    value={security.rememberMeDuration}
                    onValueChange={(value) =>
                      setSecurity({ ...security, rememberMeDuration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 dia</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="14d">14 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                      <SelectItem value="90d">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="concurrentSessions">
                  Sesiones concurrentes
                </Label>
                <Select
                  value={security.concurrentSessions}
                  onValueChange={(value) =>
                    setSecurity({ ...security, concurrentSessions: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">
                      Permitir multiples sesiones
                    </SelectItem>
                    <SelectItem value="deny">
                      Denegar sesiones concurrentes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bloqueo de cuentas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Bloqueo de Cuentas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="maxFailedAttempts">
                    Intentos fallidos maximos
                  </Label>
                  <Input
                    id="maxFailedAttempts"
                    type="number"
                    min={3}
                    max={10}
                    value={security.maxFailedAttempts}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        maxFailedAttempts: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lockoutDuration">
                    Duracion del bloqueo (minutos)
                  </Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    min={5}
                    max={1440}
                    value={security.lockoutDuration}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        lockoutDuration: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center justify-between w-full rounded-lg border p-3">
                    <Label>Desbloqueo automatico</Label>
                    <Switch
                      checked={security.autoUnlock}
                      onCheckedChange={(checked) =>
                        setSecurity({ ...security, autoUnlock: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave('Seguridad')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 3: Autenticacion
        ================================================================ */}
        <TabsContent value="autenticacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Configuracion de Autenticacion
              </CardTitle>
              <CardDescription>
                Ajustes de tokens, 2FA y SSO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="jwtExpiration">
                    Expiracion del token JWT
                  </Label>
                  <Select
                    value={auth.jwtExpiration}
                    onValueChange={(value) =>
                      setAuth({ ...auth, jwtExpiration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutos</SelectItem>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="1h">1 hora</SelectItem>
                      <SelectItem value="2h">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="refreshTokenExpiration">
                    Expiracion del refresh token
                  </Label>
                  <Select
                    value={auth.refreshTokenExpiration}
                    onValueChange={(value) =>
                      setAuth({ ...auth, refreshTokenExpiration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="14d">14 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Activar 2FA (global)</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir autenticacion de dos factores para todos los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={auth.enable2FA}
                    onCheckedChange={(checked) =>
                      setAuth({ ...auth, enable2FA: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Forzar 2FA para administradores</Label>
                    <p className="text-sm text-muted-foreground">
                      Los administradores deben tener 2FA activado obligatoriamente
                    </p>
                  </div>
                  <Switch
                    checked={auth.force2FAForAdmins}
                    onCheckedChange={(checked) =>
                      setAuth({ ...auth, force2FAForAdmins: checked })
                    }
                    disabled={!auth.enable2FA}
                  />
                </div>
              </div>

              {/* SSO - TODO */}
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <Label className="text-base">Configuracion SSO</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      La configuracion de Single Sign-On (SAML/OIDC) estara disponible proximamente.
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      Proximamente
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('Autenticacion')}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 4: Notificaciones
        ================================================================ */}
        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuracion de Notificaciones
              </CardTitle>
              <CardDescription>
                Canales y frecuencia de notificaciones predeterminados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones al correo electronico del usuario
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Notificaciones en la aplicacion</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificaciones dentro de la plataforma
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inAppNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        inAppNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="notificationFrequency">
                    Frecuencia de notificaciones
                  </Label>
                  <Select
                    value={notifications.notificationFrequency}
                    onValueChange={(value) =>
                      setNotifications({
                        ...notifications,
                        notificationFrequency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Inmediata</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="digestEmail">
                    Resumen por email (digest)
                  </Label>
                  <Select
                    value={notifications.digestEmail}
                    onValueChange={(value) =>
                      setNotifications({
                        ...notifications,
                        digestEmail: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('Notificaciones')}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 5: Almacenamiento
        ================================================================ */}
        <TabsContent value="almacenamiento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Configuracion de Almacenamiento
              </CardTitle>
              <CardDescription>
                Proveedor, limites y uso de almacenamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="storageProvider">Proveedor de almacenamiento</Label>
                  <Select
                    value={storage.storageProvider}
                    onValueChange={(value) =>
                      setStorage({ ...storage, storageProvider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local (disco del servidor)</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="minio">MinIO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxUploadSize">
                    Tamano maximo de subida (MB)
                  </Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    min={1}
                    max={500}
                    value={storage.maxUploadSize}
                    onChange={(e) =>
                      setStorage({
                        ...storage,
                        maxUploadSize: parseInt(e.target.value) || 50,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allowedFileTypes">
                  Tipos de archivo permitidos (separados por coma)
                </Label>
                <Input
                  id="allowedFileTypes"
                  value={storage.allowedFileTypes}
                  onChange={(e) =>
                    setStorage({ ...storage, allowedFileTypes: e.target.value })
                  }
                />
              </div>

              {/* Uso de almacenamiento */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Uso de almacenamiento</Label>
                  <span className="text-sm font-medium">
                    {storage.storageUsed} GB / {storage.storageTotal} GB ({storagePercentage}%)
                  </span>
                </div>
                <Progress
                  value={storagePercentage}
                  className="h-3"
                // TODO: Agregar colores segun porcentaje (verde/amarillo/rojo)
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 GB</span>
                  <span>{storage.storageTotal} GB</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCleanupOldFiles}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar archivos antiguos
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('Almacenamiento')}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 6: Mantenimiento
        ================================================================ */}
        <TabsContent value="mantenimiento" className="space-y-4">
          {/* Modo mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Modo Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Activar modo mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos los usuarios veran un mensaje de mantenimiento
                  </p>
                </div>
                <Switch
                  checked={maintenance.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setMaintenance({ ...maintenance, maintenanceMode: checked })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maintenanceMessage">
                  Mensaje de mantenimiento
                </Label>
                <Textarea
                  id="maintenanceMessage"
                  rows={3}
                  value={maintenance.maintenanceMessage}
                  onChange={(e) =>
                    setMaintenance({
                      ...maintenance,
                      maintenanceMessage: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Backups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Copias de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <Label className="text-sm text-muted-foreground">
                    Ultimo backup
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {maintenance.lastBackupDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tamano: {maintenance.lastBackupSize}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="backupSchedule">
                    Programacion de backups
                  </Label>
                  <Select
                    value={maintenance.backupSchedule}
                    onValueChange={(value) =>
                      setMaintenance({ ...maintenance, backupSchedule: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreateBackup} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Crear backup ahora
              </Button>
            </CardContent>
          </Card>

          {/* Herramientas del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Herramientas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar cache
              </Button>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Visor de logs del sistema:{' '}
                  </span>
                  {/* TODO: Navegar a la pagina de logs del sistema */}
                  <Badge variant="secondary">Proximamente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('Mantenimiento')}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 7: API & Integraciones
        ================================================================ */}
        <TabsContent value="api" className="space-y-4">
          {/* Claves de API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Claves de API
              </CardTitle>
              <CardDescription>
                Configura las credenciales de servicios externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <Label className="text-base">OpenAI API Key</Label>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={api.openaiApiKey}
                      onChange={(e) =>
                        setApi({ ...api, openaiApiKey: e.target.value })
                      }
                      placeholder="sk-proj-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showOpenaiKey ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                      {showOpenaiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button variant="outline" onClick={handleTestOpenAI}>
                    Probar conexion
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vista previa: {maskKey(api.openaiApiKey)}
                </p>
              </div>

              {/* Stripe */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  <Label className="text-base">Stripe API Key</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showStripeKey ? 'text' : 'password'}
                    value={api.stripeApiKey}
                    onChange={(e) =>
                      setApi({ ...api, stripeApiKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeKey(!showStripeKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showStripeKey ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showStripeKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vista previa: {maskKey(api.stripeApiKey)}
                </p>
              </div>

              {/* SendGrid */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <Label className="text-base">SendGrid API Key</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showSendgridKey ? 'text' : 'password'}
                    value={api.sendgridApiKey}
                    onChange={(e) =>
                      setApi({ ...api, sendgridApiKey: e.target.value })
                    }
                    placeholder="SG.xxxxx..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowSendgridKey(!showSendgridKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showSendgridKey ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showSendgridKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vista previa: {maskKey(api.sendgridApiKey)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Redis y Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Redis y Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${api.redisConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}
                  />
                  <div>
                    <Label>Redis</Label>
                    <p className="text-sm text-muted-foreground">
                      Estado de la conexion
                    </p>
                  </div>
                </div>
                <Badge
                  variant={api.redisConnected ? 'default' : 'destructive'}
                >
                  {api.redisConnected ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Desconectado
                    </>
                  )}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="rateLimitRequests">
                    Solicitudes por ventana
                  </Label>
                  <Input
                    id="rateLimitRequests"
                    type="number"
                    min={10}
                    max={10000}
                    value={api.rateLimitRequests}
                    onChange={(e) =>
                      setApi({
                        ...api,
                        rateLimitRequests: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rateLimitWindow">
                    Tamano de la ventana
                  </Label>
                  <Select
                    value={api.rateLimitWindow}
                    onValueChange={(value) =>
                      setApi({ ...api, rateLimitWindow: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 minuto</SelectItem>
                      <SelectItem value="5m">5 minutos</SelectItem>
                      <SelectItem value="15m">15 minutos</SelectItem>
                      <SelectItem value="1h">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave('API & Integraciones')} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Boton global de guardar (fuera de los tabs) */}
      <div className="flex justify-end border-t pt-4">
        <Button size="lg" onClick={handleSaveAll} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando todo...' : 'Guardar Todos los Cambios'}
        </Button>
      </div>
    </div>
  )
}

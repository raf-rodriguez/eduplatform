import { useState } from 'react'
import { UserPlus, Users, Mail, GraduationCap, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import api from '@/services/api'

const grades = [
  { value: 0, label: 'Pre-Kínder' },
  { value: 1, label: 'Kínder' },
  { value: 2, label: '1er Grado' },
  { value: 3, label: '2do Grado' },
  { value: 4, label: '3er Grado' },
  { value: 5, label: '4to Grado' },
  { value: 6, label: '5to Grado' },
  { value: 7, label: '6to Grado' },
  { value: 8, label: '7mo Grado' },
  { value: 9, label: '8vo Grado' },
  { value: 10, label: '9no Grado' },
  { value: 11, label: '10mo Grado' },
  { value: 12, label: '11vo Grado' },
  { value: 13, label: '12vo Grado' },
]

export default function CreateStudents() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '',
    phone: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.gradeLevel) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      })
      return
    }

    if (form.password !== form.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      })
      return
    }

    if (form.password.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await api.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        gradeLevel: parseInt(form.gradeLevel),
        phone: form.phone,
        role: 'STUDENT',
      })

      toast({
        title: 'Éxito',
        description: `Estudiante "${form.firstName} ${form.lastName}" creado correctamente`,
      })

      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gradeLevel: '',
        phone: '',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el estudiante',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          Crear Estudiante
        </h1>
        <p className="text-muted-foreground mt-2">
          Registra un nuevo estudiante en la plataforma
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Información del Estudiante
            </CardTitle>
            <CardDescription>
              Completa los datos del nuevo estudiante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Datos Personales
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      placeholder="Pérez"
                      value={form.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="estudiante@escuela.edu"
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(787) 555-1234"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Academic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Datos Académicos
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grado Académico *</Label>
                  <select
                    id="gradeLevel"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={form.gradeLevel}
                    onChange={(e) => handleChange('gradeLevel', e.target.value)}
                  >
                    <option value="">Selecciona un grado</option>
                    {grades.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Separator />

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Seguridad
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite la contraseña"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando estudiante...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Estudiante
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Estudiantes registrados en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Grados Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{grades.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Desde Pre-Kínder hasta 12vo Grado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Nombre y apellido obligatorios</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Correo electrónico válido</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Contraseña de 8+ caracteres</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Seleccionar grado académico</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

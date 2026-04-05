import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, UserPlus, GraduationCap, BarChart3, Shield, Activity, Clock,
  AlertTriangle, CheckCircle, FileText, Settings, BookOpen, ClipboardList,
  Key, Ban, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'
import api from '@/services/api'

const gradeLabels: Record<number, string> = {
  0: 'Pre-K', 1: 'Kínder', 2: '1ro', 3: '2do', 4: '3ro', 5: '4to',
  6: '5to', 7: '6to', 8: '7mo', 9: '8vo', 10: '9no', 11: '10mo', 12: '11vo', 13: '12vo',
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Hace ${days}d`
}

function getActionLabel(action: string): string {
  const m: Record<string, string> = { LOGIN: 'Inicio sesión', LOGOUT: 'Cerró sesión', CREATE: 'Creó', UPDATE: 'Actualizó', DELETE: 'Eliminó', PASSWORD_CHANGE: 'Cambio contraseña', ROLE_CHANGE: 'Cambio rol' }
  return m[action] || action
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard')
      setData(res.data.data)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las estadísticas', variant: 'destructive' })
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading || !data) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>
  }

  const { users, content, security, recentUsers, recentActivity, studentsByGrade } = data

  const quickActions = [
    { icon: UserPlus, label: 'Crear Estudiante', action: () => navigate('/admin/students'), color: 'bg-blue-500/10 text-blue-600' },
    { icon: Users, label: 'Ver Maestros', action: () => navigate('/admin/teachers'), color: 'bg-green-500/10 text-green-600' },
    { icon: Key, label: 'Resetear Contraseña', action: () => navigate('/admin/users'), color: 'bg-amber-500/10 text-amber-600' },
    { icon: Activity, label: 'Ver Auditoría', action: () => navigate('/admin/audit'), color: 'bg-red-500/10 text-red-600' },
    { icon: Settings, label: 'Configuración', action: () => navigate('/admin/settings'), color: 'bg-gray-500/10 text-gray-600' },
    { icon: BookOpen, label: 'Contenido', action: () => navigate('/admin/content'), color: 'bg-purple-500/10 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Vista general del sistema</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Acciones Rápidas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={a.action}>
                <div className={`p-2 rounded-lg ${a.color}`}><a.icon className="h-5 w-5" /></div>
                <span className="text-xs font-medium">{a.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.total}</div>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>{users.students} estudiantes</span>
              <span>{users.teachers} maestros</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{users.activeStudents + users.activeTeachers}</div>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>{users.activeStudents} estudiantes</span>
              <span>{users.activeTeachers} maestros</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contenido</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{content.lessons}</div>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>{content.assessments} evaluaciones</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actividad Hoy</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{security.todayLogins}</div>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>{security.failedLoginsToday} fallos login</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Recent Users */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity?.length ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(a.userName)}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{a.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getActionLabel(a.action)} <span className="text-primary">{a.entityName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{timeAgo(a.timestamp)}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono">{a.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground text-sm">Sin actividad registrada</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Usuarios Recientes</CardTitle>
            <CardDescription>Últimos usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers?.length ? (
              <div className="space-y-3">
                {recentUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge variant={u.role === 'STUDENT' ? 'default' : u.role === 'TEACHER' ? 'secondary' : 'outline'} className="text-xs">
                        {u.role === 'STUDENT' ? 'Estudiante' : u.role === 'TEACHER' ? 'Maestro' : u.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{timeAgo(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground text-sm">Sin usuarios recientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students by Grade & System Health */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Estudiantes por Grado</CardTitle></CardHeader>
          <CardContent>
            {studentsByGrade?.length ? (
              <div className="space-y-3">
                {studentsByGrade.sort((a: any, b: any) => a.grade - b.grade).map((g: any) => (
                  <div key={g.grade} className="flex items-center gap-3">
                    <span className="text-sm w-16 shrink-0">{gradeLabels[g.grade] || 'N/A'}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(g.count * 3, 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{g.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground text-sm">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Resumen del Sistema</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: BarChart3, label: 'Evaluaciones', value: content.assessments, color: 'text-purple-600' },
                { icon: ClipboardList, label: 'Progreso esta semana', value: content.progressThisWeek, color: 'text-blue-600' },
                { icon: Shield, label: 'Logs de auditoría', value: security.totalAuditLogs, color: 'text-amber-600' },
                { icon: GraduationCap, label: 'Nuevos esta semana', value: users.studentsThisWeek, color: 'text-green-600' },
                { icon: GraduationCap, label: 'Nuevos este mes', value: users.studentsThisMonth, color: 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><item.icon className={`h-4 w-4 ${item.color}`} /></div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold">{item.value ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

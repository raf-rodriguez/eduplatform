import { useState, useMemo, useCallback } from 'react'
import {
  Shield,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  User,
  Lock,
  Key,
  Eye,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Calendar,
  AlertCircle,
  Globe,
  Monitor,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Database,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  EyeOff,
  Server,
  HardDrive,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import api from '@/services/api'

// ============================================================================
// TODO: Replace all simulated data with actual API calls
// Endpoints:
//   GET  /api/audit-logs?limit=50&offset=0&filters=...
//   GET  /api/admin/audit/stats
//   GET  /api/admin/audit/alerts
//   GET  /api/admin/audit/user-activity/:userId
//   POST /api/admin/audit/export
//   POST /api/admin/audit/export/pdf
// ============================================================================

// ==================== TYPES ====================

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE'
type EntityType = 'USER' | 'GRADE' | 'SUBJECT' | 'ASSESSMENT' | 'CONTENT'
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type UserRole = 'ESTUDIANTE' | 'MAESTRO' | 'PADRE' | 'ADMIN'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: UserRole
  action: ActionType
  entityType: EntityType
  entityName: string
  entityId: string
  ipAddress: string
  userAgent: string
  severity: Severity
  details?: {
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    description?: string
    metadata?: Record<string, unknown>
  }
  location?: string
  success: boolean
}

interface SecurityAlert {
  id: string
  type: 'FAILED_LOGINS' | 'ROLE_CHANGE' | 'MASS_DELETION' | 'UNUSUAL_LOCATION' | 'PASSWORD_CHANGE'
  title: string
  description: string
  severity: Severity
  timestamp: string
  userId?: string
  userName?: string
  ipAddress?: string
  details?: string
  acknowledged: boolean
}

interface UserActivitySummary {
  userId: string
  userName: string
  userRole: UserRole
  totalActions: number
  lastAction: string
  lastActionTime: string
  loginCount: number
  failedLogins: number
  actionsByType: Record<string, number>
  ipAddresses: string[]
}

// ==================== SIMULATED DATA ====================

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

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2026-04-04T10:30:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'CREATE',
    entityType: 'USER',
    entityName: 'Juan Perez',
    entityId: 'u101',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    details: {
      description: 'Se creo un nuevo usuario estudiante',
      newValues: { name: 'Juan Perez', email: 'juan.perez@escuela.edu', role: 'estudiante', grade: 5 },
    },
    success: true,
  },
  {
    id: '2',
    timestamp: '2026-04-04T09:45:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'UPDATE',
    entityType: 'GRADE',
    entityName: '6to Grado',
    entityId: 'g6',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    details: {
      description: 'Se actualizo la informacion del grado',
      oldValues: { capacity: 35 },
      newValues: { capacity: 40 },
    },
    success: true,
  },
  {
    id: '3',
    timestamp: '2026-04-04T09:15:00Z',
    userId: 'u3',
    userName: 'Maestra Lopez',
    userRole: 'MAESTRO',
    action: 'CREATE',
    entityType: 'ASSESSMENT',
    entityName: 'Examen de Matematicas',
    entityId: 'a50',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/121.0',
    severity: 'LOW',
    details: {
      description: 'Se creo un nuevo examen',
      newValues: { title: 'Examen de Matematicas', grade: 5, subject: 'Matematicas', totalQuestions: 25 },
    },
    success: true,
  },
  {
    id: '4',
    timestamp: '2026-04-04T08:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Principal',
    entityId: 'u1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    location: 'Santo Domingo, Republica Dominicana',
    success: true,
  },
  {
    id: '5',
    timestamp: '2026-04-03T17:30:00Z',
    userId: 'u2',
    userName: 'Admin Secundario',
    userRole: 'ADMIN',
    action: 'DELETE',
    entityType: 'USER',
    entityName: 'Usuario Temporal',
    entityId: 'u99',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/122.0',
    severity: 'HIGH',
    details: {
      description: 'Se elimino un usuario temporal',
      oldValues: { name: 'Usuario Temporal', email: 'temp@escuela.edu', role: 'estudiante' },
    },
    success: true,
  },
  {
    id: '6',
    timestamp: '2026-04-03T16:00:00Z',
    userId: 'u4',
    userName: 'Maestra Garcia',
    userRole: 'MAESTRO',
    action: 'UPDATE',
    entityType: 'SUBJECT',
    entityName: 'Ciencias Naturales',
    entityId: 's12',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0) Safari/604.1',
    severity: 'LOW',
    details: {
      description: 'Se actualizo el contenido de la materia',
      oldValues: { description: 'Introduccion a las ciencias' },
      newValues: { description: 'Introduccion a las ciencias naturales y biologia' },
    },
    success: true,
  },
  {
    id: '7',
    timestamp: '2026-04-03T15:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'LOGOUT',
    entityType: 'USER',
    entityName: 'Admin Principal',
    entityId: 'u1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    success: true,
  },
  {
    id: '8',
    timestamp: '2026-04-03T14:20:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'CREATE',
    entityType: 'USER',
    entityName: 'Maria Rodriguez',
    entityId: 'u102',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    details: {
      description: 'Se creo un nuevo usuario maestro',
      newValues: { name: 'Maria Rodriguez', email: 'maria.rodriguez@escuela.edu', role: 'maestro', department: 'Matematicas' },
    },
    success: true,
  },
  {
    id: '9',
    timestamp: '2026-04-03T13:10:00Z',
    userId: 'u5',
    userName: 'Maestro Ramirez',
    userRole: 'MAESTRO',
    action: 'UPDATE',
    entityType: 'ASSESSMENT',
    entityName: 'Quiz de Historia',
    entityId: 'a51',
    ipAddress: '192.168.1.108',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/121.0',
    severity: 'LOW',
    details: {
      description: 'Se modificaron las preguntas del quiz',
      oldValues: { totalQuestions: 20 },
      newValues: { totalQuestions: 25 },
    },
    success: true,
  },
  {
    id: '10',
    timestamp: '2026-04-03T12:00:00Z',
    userId: 'u2',
    userName: 'Admin Secundario',
    userRole: 'ADMIN',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Secundario',
    entityId: 'u2',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/122.0',
    severity: 'LOW',
    location: 'Santo Domingo, Republica Dominicana',
    success: true,
  },
  {
    id: '11',
    timestamp: '2026-04-03T11:30:00Z',
    userId: 'u6',
    userName: 'Usuario Desconocido',
    userRole: 'ESTUDIANTE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Usuario Desconocido',
    entityId: 'u6',
    ipAddress: '45.33.12.89',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
    severity: 'HIGH',
    location: 'Bogota, Colombia',
    success: false,
  },
  {
    id: '12',
    timestamp: '2026-04-03T11:31:00Z',
    userId: 'u6',
    userName: 'Usuario Desconocido',
    userRole: 'ESTUDIANTE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Usuario Desconocido',
    entityId: 'u6',
    ipAddress: '45.33.12.89',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
    severity: 'HIGH',
    location: 'Bogota, Colombia',
    success: false,
  },
  {
    id: '13',
    timestamp: '2026-04-03T11:32:00Z',
    userId: 'u6',
    userName: 'Usuario Desconocido',
    userRole: 'ESTUDIANTE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Usuario Desconocido',
    entityId: 'u6',
    ipAddress: '45.33.12.89',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
    severity: 'CRITICAL',
    location: 'Bogota, Colombia',
    success: false,
  },
  {
    id: '14',
    timestamp: '2026-04-03T10:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'ROLE_CHANGE',
    entityType: 'USER',
    entityName: 'Carlos Mendez',
    entityId: 'u103',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'MEDIUM',
    details: {
      description: 'Se cambio el rol del usuario de estudiante a maestro',
      oldValues: { role: 'estudiante' },
      newValues: { role: 'maestro' },
    },
    success: true,
  },
  {
    id: '15',
    timestamp: '2026-04-03T09:00:00Z',
    userId: 'u7',
    userName: 'Ana Torres',
    userRole: 'ESTUDIANTE',
    action: 'PASSWORD_CHANGE',
    entityType: 'USER',
    entityName: 'Ana Torres',
    entityId: 'u7',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1',
    severity: 'MEDIUM',
    location: 'Santiago, Republica Dominicana',
    success: true,
  },
  {
    id: '16',
    timestamp: '2026-04-03T08:30:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'DELETE',
    entityType: 'CONTENT',
    entityName: 'Material Obsoleto Q3 2025',
    entityId: 'c200',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'MEDIUM',
    details: {
      description: 'Se elimino contenido obsoleto del sistema',
      oldValues: { title: 'Material Obsoleto Q3 2025', type: 'PDF', size: '15MB' },
    },
    success: true,
  },
  {
    id: '17',
    timestamp: '2026-04-03T08:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Principal',
    entityId: 'u1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'LOW',
    location: 'Santo Domingo, Republica Dominicana',
    success: true,
  },
  {
    id: '18',
    timestamp: '2026-04-02T16:00:00Z',
    userId: 'u8',
    userName: 'Roberto Silva',
    userRole: 'MAESTRO',
    action: 'UPDATE',
    entityType: 'CONTENT',
    entityName: 'Guia de Estudios Cap. 5',
    entityId: 'c201',
    ipAddress: '192.168.1.120',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/122.0',
    severity: 'LOW',
    details: {
      description: 'Se actualizo la guia de estudios',
      oldValues: { version: '1.0' },
      newValues: { version: '2.0', lastModifiedBy: 'Roberto Silva' },
    },
    success: true,
  },
  {
    id: '19',
    timestamp: '2026-04-02T14:30:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'ROLE_CHANGE',
    entityType: 'USER',
    entityName: 'Laura Martinez',
    entityId: 'u104',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'MEDIUM',
    details: {
      description: 'Se asigno rol de administrador secundario',
      oldValues: { role: 'maestro' },
      newValues: { role: 'admin' },
    },
    success: true,
  },
  {
    id: '20',
    timestamp: '2026-04-02T11:00:00Z',
    userId: 'u9',
    userName: 'Intento No Autenticado',
    userRole: 'ESTUDIANTE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Principal',
    entityId: 'u1',
    ipAddress: '203.0.113.42',
    userAgent: 'python-requests/2.31.0',
    severity: 'CRITICAL',
    location: 'Moscu, Rusia',
    success: false,
  },
  {
    id: '21',
    timestamp: '2026-04-02T11:01:00Z',
    userId: 'u9',
    userName: 'Intento No Autenticado',
    userRole: 'ESTUDIANTE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Principal',
    entityId: 'u1',
    ipAddress: '203.0.113.42',
    userAgent: 'python-requests/2.31.0',
    severity: 'CRITICAL',
    location: 'Moscu, Rusia',
    success: false,
  },
  {
    id: '22',
    timestamp: '2026-04-02T10:00:00Z',
    userId: 'u3',
    userName: 'Maestra Lopez',
    userRole: 'MAESTRO',
    action: 'CREATE',
    entityType: 'CONTENT',
    entityName: 'Presentacion de Biologia',
    entityId: 'c202',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/121.0',
    severity: 'LOW',
    details: {
      description: 'Se subio una nueva presentacion',
      newValues: { title: 'Presentacion de Biologia', type: 'PPTX', size: '8MB', grade: 6 },
    },
    success: true,
  },
  {
    id: '23',
    timestamp: '2026-04-02T08:00:00Z',
    userId: 'u2',
    userName: 'Admin Secundario',
    userRole: 'ADMIN',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Admin Secundario',
    entityId: 'u2',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/122.0',
    severity: 'LOW',
    location: 'Santo Domingo, Republica Dominicana',
    success: true,
  },
  {
    id: '24',
    timestamp: '2026-04-01T17:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    userRole: 'ADMIN',
    action: 'DELETE',
    entityType: 'CONTENT',
    entityName: 'Archivos Temporales',
    entityId: 'c203',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
    severity: 'HIGH',
    details: {
      description: 'Limpieza de archivos temporales - 45 archivos eliminados',
      metadata: { filesDeleted: 45, spaceFreed: '120MB' },
    },
    success: true,
  },
  {
    id: '25',
    timestamp: '2026-04-01T15:00:00Z',
    userId: 'u10',
    userName: 'Padre Familia',
    userRole: 'PADRE',
    action: 'LOGIN',
    entityType: 'USER',
    entityName: 'Padre Familia',
    entityId: 'u10',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/122.0',
    severity: 'LOW',
    location: 'La Romana, Republica Dominicana',
    success: true,
  },
]

const MOCK_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'sa1',
    type: 'FAILED_LOGINS',
    title: 'Multiples intentos de inicio de sesion fallidos',
    description: 'Se detectaron 3 intentos fallidos consecutivos desde la IP 45.33.12.89 (Bogota, Colombia) para la cuenta de Usuario Desconocido.',
    severity: 'HIGH',
    timestamp: '2026-04-03T11:32:00Z',
    userId: 'u6',
    userName: 'Usuario Desconocido',
    ipAddress: '45.33.12.89',
    details: 'Ubicacion inusual: Bogota, Colombia. El usuario normalmente inicia sesion desde Santo Domingo.',
    acknowledged: false,
  },
  {
    id: 'sa2',
    type: 'FAILED_LOGINS',
    title: 'Posible ataque de fuerza bruta',
    description: 'Se detectaron 2 intentos de inicio de sesion con credenciales de administrador desde la IP 203.0.113.42 (Moscu, Rusia) usando un script automatizado.',
    severity: 'CRITICAL',
    timestamp: '2026-04-02T11:01:00Z',
    ipAddress: '203.0.113.42',
    details: 'User-Agent sospechoso: python-requests/2.31.0. IP bloqueada automaticamente.',
    acknowledged: false,
  },
  {
    id: 'sa3',
    type: 'ROLE_CHANGE',
    title: 'Cambio de rol: Estudiante a Maestro',
    description: 'El Admin Principal cambio el rol de Carlos Mendez de Estudiante a Maestro.',
    severity: 'MEDIUM',
    timestamp: '2026-04-03T10:00:00Z',
    userId: 'u103',
    userName: 'Carlos Mendez',
    ipAddress: '192.168.1.100',
    acknowledged: true,
  },
  {
    id: 'sa4',
    type: 'ROLE_CHANGE',
    title: 'Cambio de rol: Maestro a Admin',
    description: 'El Admin Principal cambio el rol de Laura Martinez de Maestro a Admin. Este cambio otorga privilegios elevados.',
    severity: 'HIGH',
    timestamp: '2026-04-02T14:30:00Z',
    userId: 'u104',
    userName: 'Laura Martinez',
    ipAddress: '192.168.1.100',
    acknowledged: false,
  },
  {
    id: 'sa5',
    type: 'MASS_DELETION',
    title: 'Eliminacion masiva de contenido',
    description: 'Se eliminaron 45 archivos temporales en una sola operacion, liberando 120MB de espacio.',
    severity: 'MEDIUM',
    timestamp: '2026-04-01T17:00:00Z',
    userId: 'u1',
    userName: 'Admin Principal',
    ipAddress: '192.168.1.100',
    acknowledged: true,
  },
  {
    id: 'sa6',
    type: 'PASSWORD_CHANGE',
    title: 'Cambio de contrasena - Ana Torres',
    description: 'La usuaria Ana Torres cambio su contrasena desde un dispositivo movil (iPhone).',
    severity: 'LOW',
    timestamp: '2026-04-03T09:00:00Z',
    userId: 'u7',
    userName: 'Ana Torres',
    ipAddress: '192.168.1.150',
    acknowledged: true,
  },
  {
    id: 'sa7',
    type: 'UNUSUAL_LOCATION',
    title: 'Inicio de sesion desde ubicacion inusual',
    description: 'Se detecto un intento de inicio de sesion desde Moscu, Rusia para una cuenta de administrador. La IP fue bloqueada automaticamente.',
    severity: 'CRITICAL',
    timestamp: '2026-04-02T11:00:00Z',
    ipAddress: '203.0.113.42',
    details: 'La cuenta objetivo fue Admin Principal. Se recomienda verificar la seguridad de la cuenta.',
    acknowledged: false,
  },
]

const MOCK_STATS = {
  totalEvents24h: 14,
  failedLogins: 5,
  roleChanges: 2,
  passwordResets: 1,
  suspiciousActivities: 3,
}

// ==================== HELPERS ====================

function getAvatarColor(id: string): string {
  const index = parseInt(id.replace(/\D/g, '') || '0', 10) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatFullTimestamp(ts: string): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getActionIcon(action: ActionType) {
  switch (action) {
    case 'CREATE': return <Plus className="h-4 w-4" />
    case 'UPDATE': return <Edit className="h-4 w-4" />
    case 'DELETE': return <Trash2 className="h-4 w-4" />
    case 'LOGIN': return <LogIn className="h-4 w-4" />
    case 'LOGOUT': return <LogOut className="h-4 w-4" />
    case 'PASSWORD_CHANGE': return <Key className="h-4 w-4" />
    case 'ROLE_CHANGE': return <Shield className="h-4 w-4" />
    default: return <Activity className="h-4 w-4" />
  }
}

function getActionLabel(action: ActionType): string {
  const labels: Record<ActionType, string> = {
    CREATE: 'Creacion',
    UPDATE: 'Actualizacion',
    DELETE: 'Eliminacion',
    LOGIN: 'Inicio de Sesion',
    LOGOUT: 'Cierre de Sesion',
    PASSWORD_CHANGE: 'Cambio de Contrasena',
    ROLE_CHANGE: 'Cambio de Rol',
  }
  return labels[action]
}

function getActionBadgeVariant(action: ActionType): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (action) {
    case 'CREATE': return 'default'
    case 'UPDATE': return 'secondary'
    case 'DELETE': return 'destructive'
    case 'LOGIN': return 'outline'
    case 'LOGOUT': return 'outline'
    case 'PASSWORD_CHANGE': return 'secondary'
    case 'ROLE_CHANGE': return 'default'
  }
}

function getActionIconColor(action: ActionType): string {
  switch (action) {
    case 'CREATE': return 'text-green-500'
    case 'UPDATE': return 'text-blue-500'
    case 'DELETE': return 'text-red-500'
    case 'LOGIN': return 'text-emerald-500'
    case 'LOGOUT': return 'text-gray-500'
    case 'PASSWORD_CHANGE': return 'text-amber-500'
    case 'ROLE_CHANGE': return 'text-purple-500'
  }
}

function getActionIconBg(action: ActionType): string {
  switch (action) {
    case 'CREATE': return 'bg-green-500/10'
    case 'UPDATE': return 'bg-blue-500/10'
    case 'DELETE': return 'bg-red-500/10'
    case 'LOGIN': return 'bg-emerald-500/10'
    case 'LOGOUT': return 'bg-gray-500/10'
    case 'PASSWORD_CHANGE': return 'bg-amber-500/10'
    case 'ROLE_CHANGE': return 'bg-purple-500/10'
  }
}

function getEntityIcon(entityType: EntityType) {
  switch (entityType) {
    case 'USER': return <User className="h-3.5 w-3.5" />
    case 'GRADE': return <GraduationCap className="h-3.5 w-3.5" />
    case 'SUBJECT': return <BookOpen className="h-3.5 w-3.5" />
    case 'ASSESSMENT': return <ClipboardList className="h-3.5 w-3.5" />
    case 'CONTENT': return <FileText className="h-3.5 w-3.5" />
  }
}

function getEntityLabel(entityType: EntityType): string {
  const labels: Record<EntityType, string> = {
    USER: 'Usuario',
    GRADE: 'Grado',
    SUBJECT: 'Materia',
    ASSESSMENT: 'Evaluacion',
    CONTENT: 'Contenido',
  }
  return labels[entityType]
}

function getSeverityBadge(severity: Severity): { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string; icon: React.ReactNode } {
  switch (severity) {
    case 'LOW': return { variant: 'outline', label: 'Baja', icon: <CheckCircle className="h-3 w-3" /> }
    case 'MEDIUM': return { variant: 'secondary', label: 'Media', icon: <AlertCircle className="h-3 w-3" /> }
    case 'HIGH': return { variant: 'destructive', label: 'Alta', icon: <AlertTriangle className="h-3 w-3" /> }
    case 'CRITICAL': return { variant: 'destructive', label: 'Critica', icon: <XCircle className="h-3 w-3" /> }
  }
}

function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    case 'MAESTRO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'ESTUDIANTE': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'PADRE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  }
}

function parseBrowserFromUserAgent(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('python')) return 'Python Script'
  if (ua.includes('curl')) return 'curl'
  return 'Otro'
}

function parseOSFromUserAgent(ua: string): string {
  if (ua.includes('Macintosh')) return 'macOS'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  return 'Desconocido'
}

function exportToCSV(logs: AuditLog[], filename: string): void {
  const headers = ['Fecha/Hora', 'Usuario', 'Rol', 'Accion', 'Tipo Entidad', 'Nombre Entidad', 'IP', 'Navegador', 'SO', 'Severidad', 'Exito', 'Descripcion']
  const sevLabels: Record<Severity, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Critica' }
  const rows = logs.map((log) => [
    formatFullTimestamp(log.timestamp),
    log.userName,
    log.userRole,
    getActionLabel(log.action),
    getEntityLabel(log.entityType),
    log.entityName,
    log.ipAddress,
    parseBrowserFromUserAgent(log.userAgent),
    parseOSFromUserAgent(log.userAgent),
    sevLabels[log.severity],
    log.success ? 'Si' : 'No',
    log.details?.description || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportToPDF(logs: AuditLog[]): void {
  // TODO: Implement PDF export using a library like jsPDF or send to backend
  // Backend endpoint: POST /api/admin/audit/export/pdf with { startDate, endDate, filters }
  // For now, generate a printable HTML page
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const rows = logs.map((log) => {
    const sevLabels: Record<Severity, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Critica' }
    return `<tr>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${formatFullTimestamp(log.timestamp)}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${log.userName}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${getActionLabel(log.action)}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${getEntityLabel(log.entityType)}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${log.entityName}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${log.ipAddress}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${sevLabels[log.severity]}</td>
    </tr>`
  }).join('')

  printWindow.document.write(`<!DOCTYPE html><html><head><title>Registro de Auditoria - EduPlatform</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #1e293b; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; }
      .meta { color: #64748b; font-size: 12px; margin-top: 10px; }
      @media print { body { margin: 0; } }
    </style></head><body>
    <h1>Registro de Auditoria - EduPlatform</h1>
    <p class="meta">Generado: ${new Date().toLocaleString('es-ES')} | Total de registros: ${logs.length}</p>
    <table><thead><tr>
      <th>Fecha/Hora</th><th>Usuario</th><th>Accion</th><th>Tipo Entidad</th><th>Nombre Entidad</th><th>IP</th><th>Severidad</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <script>window.onload = function() { window.print(); }</script>
    </body></html>`)
  printWindow.document.close()
}

// ==================== MAIN COMPONENT ====================

export default function AuditLogs() {
  // TODO: Replace all state with data fetching from backend
  // const { data: logs, isLoading } = useQuery({ queryKey: ['audit-logs', filters], queryFn: fetchAuditLogs })
  // const { data: stats } = useQuery({ queryKey: ['audit-stats'], queryFn: fetchAuditStats })

  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS)
  const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_SECURITY_ALERTS)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('ALL')
  const [entityFilter, setEntityFilter] = useState<string>('ALL')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Dialog
  const [detailsLog, setDetailsLog] = useState<AuditLog | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Export
  const [exportDateFrom, setExportDateFrom] = useState('')
  const [exportDateTo, setExportDateTo] = useState('')

  // ==================== COMPUTED VALUES ====================

  const filteredLogs = useMemo(() => {
    let result = [...logs]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(q) ||
          log.entityName.toLowerCase().includes(q) ||
          getActionLabel(log.action).toLowerCase().includes(q) ||
          log.ipAddress.includes(q)
      )
    }

    if (actionFilter !== 'ALL') {
      result = result.filter((log) => log.action === actionFilter)
    }

    if (entityFilter !== 'ALL') {
      result = result.filter((log) => log.entityType === entityFilter)
    }

    if (roleFilter !== 'ALL') {
      result = result.filter((log) => log.userRole === roleFilter)
    }

    if (severityFilter !== 'ALL') {
      result = result.filter((log) => log.severity === severityFilter)
    }

    if (dateFrom) {
      result = result.filter((log) => new Date(log.timestamp) >= new Date(dateFrom))
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter((log) => new Date(log.timestamp) <= endDate)
    }

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return result
  }, [logs, searchQuery, actionFilter, entityFilter, roleFilter, severityFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = useMemo(() => {
    const now = new Date()
    const last24h = logs.filter((log) => {
      const diff = now.getTime() - new Date(log.timestamp).getTime()
      return diff <= 24 * 60 * 60 * 1000
    })

    return {
      totalEvents24h: MOCK_STATS.totalEvents24h,
      failedLogins: logs.filter((log) => log.action === 'LOGIN' && !log.success).length,
      roleChanges: logs.filter((log) => log.action === 'ROLE_CHANGE').length,
      passwordResets: logs.filter((log) => log.action === 'PASSWORD_CHANGE').length,
      suspiciousActivities: MOCK_STATS.suspiciousActivities,
    }
  }, [logs])

  const userActivitySummary = useMemo((): UserActivitySummary[] => {
    const userMap = new Map<string, UserActivitySummary>()

    logs.forEach((log) => {
      const key = log.userId
      if (!userMap.has(key)) {
        userMap.set(key, {
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          totalActions: 0,
          lastAction: log.action,
          lastActionTime: log.timestamp,
          loginCount: 0,
          failedLogins: 0,
          actionsByType: {},
          ipAddresses: [],
        })
      }

      const summary = userMap.get(key)!
      summary.totalActions++
      summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1

      if (new Date(log.timestamp) > new Date(summary.lastActionTime)) {
        summary.lastAction = log.action
        summary.lastActionTime = log.timestamp
      }

      if (log.action === 'LOGIN') {
        summary.loginCount++
        if (!log.success) summary.failedLogins++
      }

      if (!summary.ipAddresses.includes(log.ipAddress)) {
        summary.ipAddresses.push(log.ipAddress)
      }
    })

    return Array.from(userMap.values()).sort((a, b) => b.totalActions - a.totalActions)
  }, [logs])

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH')

  // ==================== HANDLERS ====================

  const handleViewDetails = useCallback((log: AuditLog) => {
    setDetailsLog(log)
    setDetailsOpen(true)
  }, [])

  const handleDeleteLog = useCallback(async (id: string) => {
    setDeleteId(id)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await api.delete(`/audit/${deleteId}`)
      // Remove from local state
      setLogs(prev => prev.filter(log => log.id !== deleteId))
      setDeleteId(null)
    } catch (error: any) {
      console.error('Failed to delete audit log:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [deleteId])

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    // TODO: API call POST /api/admin/audit/alerts/:id/acknowledge
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)))
  }, [])

  const handleAcknowledgeAllAlerts = useCallback(() => {
    // TODO: API call POST /api/admin/audit/alerts/acknowledge-all
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })))
  }, [])

  const handleExportCSV = useCallback(() => {
    let logsToExport = [...logs]

    if (exportDateFrom) {
      logsToExport = logsToExport.filter((log) => new Date(log.timestamp) >= new Date(exportDateFrom))
    }
    if (exportDateTo) {
      const endDate = new Date(exportDateTo)
      endDate.setHours(23, 59, 59, 999)
      logsToExport = logsToExport.filter((log) => new Date(log.timestamp) <= endDate)
    }

    logsToExport.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // TODO: Backend endpoint POST /api/admin/audit/export/csv
    exportToCSV(logsToExport, `auditoria_eduplatform_${new Date().toISOString().slice(0, 10)}.csv`)
  }, [logs, exportDateFrom, exportDateTo])

  const handleExportPDF = useCallback(() => {
    let logsToExport = [...logs]

    if (exportDateFrom) {
      logsToExport = logsToExport.filter((log) => new Date(log.timestamp) >= new Date(exportDateFrom))
    }
    if (exportDateTo) {
      const endDate = new Date(exportDateTo)
      endDate.setHours(23, 59, 59, 999)
      logsToExport = logsToExport.filter((log) => new Date(log.timestamp) <= endDate)
    }

    logsToExport.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // TODO: Backend endpoint POST /api/admin/audit/export/pdf
    exportToPDF(logsToExport)
  }, [logs, exportDateFrom, exportDateTo])

  const resetFilters = () => {
    setSearchQuery('')
    setActionFilter('ALL')
    setEntityFilter('ALL')
    setRoleFilter('ALL')
    setSeverityFilter('ALL')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    actionFilter !== 'ALL',
    entityFilter !== 'ALL',
    roleFilter !== 'ALL',
    severityFilter !== 'ALL',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Registro de Auditoria
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo completo de todas las actividades del sistema
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Events */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate">Total Eventos (24h)</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents24h}</div>
            <p className="text-xs text-muted-foreground mt-1">Ultimas 24 horas</p>
          </CardContent>
        </Card>

        {/* Failed Logins */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate">Inicios Fallidos</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Lock className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atencion</p>
          </CardContent>
        </Card>

        {/* Role Changes */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate">Cambios de Rol</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.roleChanges}</div>
            <p className="text-xs text-muted-foreground mt-1">Ultimos cambios</p>
          </CardContent>
        </Card>

        {/* Password Resets */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate">Cambios Contrasena</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Key className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.passwordResets}</div>
            <p className="text-xs text-muted-foreground mt-1">Ultimos cambios</p>
          </CardContent>
        </Card>

        {/* Suspicious Activities */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate">Actividad Sospechosa</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren revision</p>
          </CardContent>
        </Card>
      </div>

      {/* ==================== MAIN TABS ==================== */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex justify-center gap-2 bg-muted/30 p-1 rounded-lg w-full lg:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:shadow-md">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Todos los Eventos</span>
            <span className="sm:hidden">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Actividad de Usuarios</span>
            <span className="sm:hidden">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2 relative">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Alertas de Seguridad</span>
            <span className="sm:hidden">Alertas</span>
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white z-10 shadow-sm">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:shadow-md">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: ALL EVENTS ==================== */}
        <TabsContent value="all" className="space-y-6">
          {/* Search & Filters */}
          <Card className="border-2 border-muted/20">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuario, accion, entidad, IP..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 h-11"
                  />
                </div>

                {/* Filter toggle */}
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 h-11"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-destructive hover:text-destructive">
                    <X className="mr-1 h-3 w-3" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Expanded filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-muted/50">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Action Type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        Tipo de Accion
                      </label>
                      <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todas</SelectItem>
                          <SelectItem value="CREATE">Creacion</SelectItem>
                          <SelectItem value="UPDATE">Actualizacion</SelectItem>
                          <SelectItem value="DELETE">Eliminacion</SelectItem>
                          <SelectItem value="LOGIN">Inicio de Sesion</SelectItem>
                          <SelectItem value="LOGOUT">Cierre de Sesion</SelectItem>
                          <SelectItem value="PASSWORD_CHANGE">Cambio de Contrasena</SelectItem>
                          <SelectItem value="ROLE_CHANGE">Cambio de Rol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Entity Type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        Tipo de Entidad
                      </label>
                      <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todas</SelectItem>
                          <SelectItem value="USER">Usuario</SelectItem>
                          <SelectItem value="GRADE">Grado</SelectItem>
                          <SelectItem value="SUBJECT">Materia</SelectItem>
                          <SelectItem value="ASSESSMENT">Evaluacion</SelectItem>
                          <SelectItem value="CONTENT">Contenido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* User Role */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Rol del Usuario
                      </label>
                      <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todos</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="MAESTRO">Maestro</SelectItem>
                          <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                          <SelectItem value="PADRE">Padre/Tutor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Severity */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        Severidad
                      </label>
                      <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todas</SelectItem>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="CRITICAL">Critica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Desde
                      </label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                        className="h-10"
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Hasta
                      </label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-md border border-muted/20">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}a{' '}<span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span>{' '}de{' '}<span className="font-semibold text-foreground">{filteredLogs.length}</span> eventos
            </p>
          </div>

          {/* Table */}
          <Card className="border-2 border-muted/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {/* Header row */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground border-b-2 bg-muted/50">
                  <div className="col-span-2">Fecha/Hora</div>
                  <div className="col-span-1.5">Usuario</div>
                  <div className="col-span-1.5">Accion</div>
                  <div className="col-span-1">Entidad</div>
                  <div className="col-span-1.5">Nombre Entidad</div>
                  <div className="col-span-1">IP</div>
                  <div className="col-span-1">Navegador / SO</div>
                  <div className="col-span-1">Severidad</div>
                  <div className="col-span-1">Detalles</div>
                </div>

                {/* Log entries */}
                {paginatedLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron eventos</p>
                    <p className="text-sm">Intenta ajustar los filtros de busqueda</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {paginatedLogs.map((log) => {
                      const actionBadge = getActionBadgeVariant(log.action)
                      const severityBadge = getSeverityBadge(log.severity)
                      const browser = parseBrowserFromUserAgent(log.userAgent)
                      const os = parseOSFromUserAgent(log.userAgent)

                      return (
                        <div
                          key={log.id}
                          className={`grid grid-cols-1 lg:grid-cols-12 gap-2 items-center px-4 py-3.5 transition-all duration-150 hover:bg-muted/60 rounded-md cursor-pointer border border-transparent hover:border-muted/40 ${!log.success ? 'bg-destructive/5 dark:bg-destructive/10' : ''
                            } ${log.severity === 'CRITICAL' ? 'border-l-4 border-l-destructive shadow-sm' : ''} ${log.severity === 'HIGH' ? 'border-l-4 border-l-orange-500 shadow-sm' : ''
                            } ${log.severity === 'MEDIUM' ? 'border-l-4 border-l-amber-500' : ''} ${log.severity === 'LOW' ? 'border-l-4 border-l-green-500' : ''
                            }`}
                        >
                          {/* Timestamp */}
                          <div className="col-span-2 flex items-center gap-1.5 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <div className="font-medium">{formatTimestamp(log.timestamp)}</div>
                              <div className="text-xs text-muted-foreground lg:hidden">
                                {formatFullTimestamp(log.timestamp)}
                              </div>
                            </div>
                          </div>

                          {/* User */}
                          <div className="col-span-1.5 flex items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarFallback className={`text-xs text-white ${getAvatarColor(log.userId)}`}>
                                {getInitials(log.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{log.userName}</div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(log.userRole)}`}>
                                {log.userRole}
                              </span>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="col-span-1.5 flex items-center gap-2">
                            <span className={getActionIconColor(log.action)}>
                              {getActionIcon(log.action)}
                            </span>
                            <Badge variant={actionBadge} className="text-xs">
                              {getActionLabel(log.action)}
                            </Badge>
                            {!log.success && (
                              <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            )}
                          </div>

                          {/* Entity Type */}
                          <div className="col-span-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            {getEntityIcon(log.entityType)}
                            <span className="truncate">{getEntityLabel(log.entityType)}</span>
                          </div>

                          {/* Entity Name */}
                          <div className="col-span-1.5 text-sm truncate" title={log.entityName}>
                            {log.entityName}
                          </div>

                          {/* IP Address */}
                          <div className="col-span-1 text-xs font-mono text-muted-foreground truncate">
                            {log.ipAddress}
                          </div>

                          {/* Browser / OS */}
                          <div className="col-span-1 text-xs text-muted-foreground hidden lg:block">
                            <div className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              <span>{browser}</span>
                            </div>
                            <div className="text-[10px]">{os}</div>
                          </div>

                          {/* Severity */}
                          <div className="col-span-1">
                            <Badge variant={severityBadge.variant} className="text-xs flex items-center gap-1 w-fit">
                              {severityBadge.icon}
                              {severityBadge.label}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(log)}
                              className="h-7 px-2 text-xs"
                              title="Ver detalles"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLog(log.id)}
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Eliminar registro"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t-2 border-muted/30 bg-muted/20 px-6 py-4 gap-4 rounded-b-lg">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Página <span className="font-semibold text-foreground">{currentPage}</span> de <span className="font-semibold text-foreground">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Filas:</span>
                      <Select value={String(itemsPerPage)} onValueChange={(v) => { setCurrentPage(1) }}>
                        <SelectTrigger className="h-8 w-20 text-xs font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="h-9 px-3 text-xs font-medium"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-9 px-3 text-xs font-medium"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 2: USER ACTIVITY ==================== */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actividad por Usuario</CardTitle>
              <CardDescription>
                Resumen de actividad de cada usuario en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivitySummary.map((summary) => {
                  const mostCommonAction = Object.entries(summary.actionsByType).sort((a, b) => b[1] - a[1])[0]

                  return (
                    <Card key={summary.userId} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          {/* User info */}
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`text-sm text-white ${getAvatarColor(summary.userId)}`}>
                                {getInitials(summary.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{summary.userName}</div>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(summary.userRole)}`}>
                                {summary.userRole}
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Total Acciones</div>
                              <div className="font-bold text-lg">{summary.totalActions}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Inicios Sesion</div>
                              <div className="font-bold text-lg">{summary.loginCount}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Fallidos</div>
                              <div className={`font-bold text-lg ${summary.failedLogins > 0 ? 'text-red-600' : ''}`}>
                                {summary.failedLogins}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">IPs Distintas</div>
                              <div className="font-bold text-lg">{summary.ipAddresses.length}</div>
                            </div>
                          </div>
                        </div>

                        {/* Activity breakdown */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(summary.actionsByType).map(([action, count]) => (
                              <Badge key={action} variant={getActionBadgeVariant(action as ActionType)} className="text-xs">
                                {getActionIcon(action as ActionType)}
                                <span className="ml-1">{getActionLabel(action as ActionType)}: {count}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Last action */}
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Ultima actividad: {getActionLabel(summary.lastAction as ActionType)} -- {formatTimestamp(summary.lastActionTime)}</span>
                        </div>

                        {/* IP addresses */}
                        {summary.ipAddresses.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1 text-xs">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            {summary.ipAddresses.map((ip) => (
                              <code key={ip} className="px-1.5 py-0.5 bg-muted rounded">{ip}</code>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 3: SECURITY ALERTS ==================== */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Alert summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
              <CardContent className="pt-4 flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter((a) => a.severity === 'CRITICAL').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Alertas Criticas</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {alerts.filter((a) => a.severity === 'HIGH').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Alertas Altas</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
              <CardContent className="pt-4 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.filter((a) => a.acknowledged).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Atendidas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acknowledge all button */}
          {unacknowledgedAlerts.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleAcknowledgeAllAlerts}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar todas como atendidas
              </Button>
            </div>
          )}

          {/* Alert list */}
          <div className="space-y-3">
            {alerts.map((alert) => {
              const alertTypeIcon = (() => {
                switch (alert.type) {
                  case 'FAILED_LOGINS': return <Lock className="h-5 w-5" />
                  case 'ROLE_CHANGE': return <Shield className="h-5 w-5" />
                  case 'MASS_DELETION': return <Trash2 className="h-5 w-5" />
                  case 'UNUSUAL_LOCATION': return <Globe className="h-5 w-5" />
                  case 'PASSWORD_CHANGE': return <Key className="h-5 w-5" />
                }
              })()

              const alertTypeColor = (() => {
                switch (alert.type) {
                  case 'FAILED_LOGINS': return 'text-red-500'
                  case 'ROLE_CHANGE': return 'text-purple-500'
                  case 'MASS_DELETION': return 'text-orange-500'
                  case 'UNUSUAL_LOCATION': return 'text-blue-500'
                  case 'PASSWORD_CHANGE': return 'text-amber-500'
                }
              })()

              const severityInfo = getSeverityBadge(alert.severity)

              return (
                <Card
                  key={alert.id}
                  className={`transition-all ${alert.acknowledged ? 'opacity-60' : ''
                    } ${alert.severity === 'CRITICAL'
                      ? 'border-l-4 border-l-red-500'
                      : alert.severity === 'HIGH'
                        ? 'border-l-4 border-l-orange-500'
                        : ''
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`mt-0.5 shrink-0 ${alertTypeColor}`}>
                        {alertTypeIcon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant={severityInfo.variant} className="text-xs">
                            {severityInfo.icon}
                            {severityInfo.label}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Atendida
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>

                        {alert.details && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{alert.details}</p>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatFullTimestamp(alert.timestamp)}
                          </span>
                          {alert.userName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {alert.userName}
                            </span>
                          )}
                          {alert.ipAddress && (
                            <span className="flex items-center gap-1 font-mono">
                              <Server className="h-3 w-3" />
                              {alert.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acknowledge button */}
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="shrink-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ==================== TAB 4: EXPORT ==================== */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Registros de Auditoria
              </CardTitle>
              <CardDescription>
                Descarga los registros de auditoria en formato CSV o PDF para analisis externo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date range selector */}
              <div>
                <h3 className="text-sm font-medium mb-3">Rango de Fechas</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fecha Inicio</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={exportDateFrom}
                        onChange={(e) => setExportDateFrom(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fecha Fin</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={exportDateTo}
                        onChange={(e) => setExportDateTo(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick date ranges */}
              <div>
                <h3 className="text-sm font-medium mb-3">Rangos Rapidos</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      setExportDateFrom(weekAgo.toISOString().slice(0, 10))
                      setExportDateTo(now.toISOString().slice(0, 10))
                    }}
                  >
                    Ultimos 7 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                      setExportDateFrom(monthAgo.toISOString().slice(0, 10))
                      setExportDateTo(now.toISOString().slice(0, 10))
                    }}
                  >
                    Ultimos 30 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      setExportDateFrom(today.toISOString().slice(0, 10))
                      setExportDateTo(now.toISOString().slice(0, 10))
                    }}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExportDateFrom('')
                      setExportDateTo('')
                    }}
                  >
                    Todos
                  </Button>
                </div>
              </div>

              {/* Export count preview */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Registros a exportar:</span>
                  </div>
                  <span className="font-bold text-lg">
                    {(() => {
                      let count = logs.length
                      if (exportDateFrom) count = count // simplified
                      if (exportDateTo) count = count // simplified
                      return count
                    })()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  TODO: El conteo exacto requiere filtrado por fechas desde el backend
                  (endpoint: <code className="text-xs">POST /api/admin/audit/export/count</code>)
                </p>
              </div>

              {/* Export buttons */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* CSV Export */}
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <FileSpreadsheet className="h-12 w-12 text-green-500 mb-3" />
                    <h3 className="font-semibold text-lg">Exportar como CSV</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Formato compatible con Excel, Google Sheets y otras herramientas
                    </p>
                    <Button className="mt-4 w-full" onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CSV
                    </Button>
                  </CardContent>
                </Card>

                {/* PDF Export */}
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <FileDown className="h-12 w-12 text-red-500 mb-3" />
                    <h3 className="font-semibold text-lg">Exportar como PDF</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Documento formateado listo para impresion o archivo
                    </p>
                    <Button className="mt-4 w-full" variant="outline" onClick={handleExportPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Backend integration note */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Integracion con Backend Pendiente</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      La exportacion actual se realiza del lado del cliente con datos simulados. Para exportaciones de produccion con grandes volumenes de datos, se deben implementar los siguientes endpoints:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
                      <li><code className="text-xs">POST /api/admin/audit/export/csv</code> -- Exportacion CSV del lado del servidor</li>
                      <li><code className="text-xs">POST /api/admin/audit/export/pdf</code> -- Generacion de PDF con puppeteer o similar</li>
                      <li><code className="text-xs">POST /api/admin/audit/export/count</code> -- Conteo de registros filtrados</li>
                      <li>Implementar exportacion asincrona con notificacion por email para conjuntos grandes de datos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== DETAILS DIALOG ==================== */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {detailsLog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-lg ${getActionIconBg(detailsLog.action)}`}>
                    <span className={getActionIconColor(detailsLog.action)}>
                      {getActionIcon(detailsLog.action)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{getActionLabel(detailsLog.action)}</div>
                    <div className="text-sm font-normal text-muted-foreground truncate max-w-[80%]">
                      {detailsLog.entityName}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Detalles completos del evento de auditoria
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic info grid */}
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-muted/20">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Fecha y Hora
                    </label>
                    <p className="text-sm font-medium mt-1.5">{formatFullTimestamp(detailsLog.timestamp)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(detailsLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" />
                      Severidad
                    </label>
                    <div className="mt-1.5">
                      {(() => {
                        const sev = getSeverityBadge(detailsLog.severity)
                        return (
                          <Badge variant={sev.variant} className="flex items-center gap-1 w-fit">
                            {sev.icon}
                            {sev.label}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* User info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informacion del Usuario
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`text-sm text-white ${getAvatarColor(detailsLog.userId)}`}>
                        {getInitials(detailsLog.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{detailsLog.userName}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(detailsLog.userRole)}`}>
                        {detailsLog.userRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Entity info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tipo de Entidad</label>
                    <div className="flex items-center gap-1.5 mt-0.5 text-sm">
                      {getEntityIcon(detailsLog.entityType)}
                      {getEntityLabel(detailsLog.entityType)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nombre de la Entidad</label>
                    <p className="text-sm font-medium mt-0.5">{detailsLog.entityName}</p>
                  </div>
                </div>

                {/* Technical info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Informacion Tecnica
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Direccion IP:</span>
                      <code className="font-mono text-xs">{detailsLog.ipAddress}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Navegador:</span>
                      <span className="text-xs">{parseBrowserFromUserAgent(detailsLog.userAgent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sistema Operativo:</span>
                      <span className="text-xs">{parseOSFromUserAgent(detailsLog.userAgent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className={detailsLog.success ? 'text-green-600' : 'text-red-600'}>
                        {detailsLog.success ? 'Exitoso' : 'Fallido'}
                      </span>
                    </div>
                    {detailsLog.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ubicacion:</span>
                        <span className="text-xs">{detailsLog.location}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">User Agent completo:</span>
                      <p className="text-xs font-mono mt-0.5 break-all">{detailsLog.userAgent}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {detailsLog.details?.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Descripcion</h4>
                    <p className="text-sm text-muted-foreground">{detailsLog.details.description}</p>
                  </div>
                )}

                {/* Old and New Values */}
                {detailsLog.details?.oldValues && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-red-500" />
                      Valores Anteriores
                    </h4>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-1">
                      {Object.entries(detailsLog.details.oldValues).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-red-700 dark:text-red-400 min-w-[120px]">{key}:</span>
                          <code className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailsLog.details?.newValues && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      Valores Nuevos
                    </h4>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg space-y-1">
                      {Object.entries(detailsLog.details.newValues).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-green-700 dark:text-green-400 min-w-[120px]">{key}:</span>
                          <code className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {detailsLog.details?.metadata && Object.keys(detailsLog.details.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Metadatos Adicionales
                    </h4>
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                      {Object.entries(detailsLog.details.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-sm">
                          <span className="font-medium min-w-[120px]">{key}:</span>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar este registro de auditoría. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  MoreHorizontal,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'

// ==================== TYPES ====================

type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
type PermissionLevel = 'SUPER_ADMIN' | 'ADMIN'
type ParentRelationship = 'MADRE' | 'PADRE' | 'TUTOR_LEGAL'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  grade?: number
  grades?: number[]
  subjects?: string[]
  parentEmail?: string
  birthDate?: string
  relationship?: ParentRelationship
  linkedStudentIds?: string[]
  permissionLevel?: PermissionLevel
  department?: string
  maxStudentsPerClass?: number
  avatarUrl?: string
  lastLogin?: string
  createdAt: string
  failedLoginAttempts: number
  isLocked: boolean
  requirePasswordChange: boolean
  twoFactorEnabled: boolean
  accountExpiryDate?: string
  maxFailedAttempts: number
  lastPasswordChange?: string
}

interface SecurityLog {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: string
  ip?: string
  details?: string
}

// ==================== CONSTANTS ====================

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

const TEACHER_SUBJECTS = [
  'Espa\xf1ol',
  'Matem\xe1ticas',
  'Ciencia',
  'Historia',
  'Ingl\xe9s',
  'Ingl\xe9s Conversacional',
  'Rob\xf3tica',
  'Finanzas',
  'Salud',
]

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Estudiante',
  TEACHER: 'Maestro',
  PARENT: 'Padre/Tutor',
  ADMIN: 'Administrador',
}

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-cyan-500',
]

// ==================== SIMULATED DATA ====================

const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Mar\xeda',
    lastName: 'Gonz\xe1lez',
    email: 'maria.gonzalez@eduplatform.com',
    phone: '809-555-0101',
    role: 'STUDENT',
    status: 'ACTIVE',
    grade: 7,
    avatarUrl: '',
    lastLogin: '2026-04-03T10:30:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-01-15T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Ruiz',
    email: 'carlos.ruiz@eduplatform.com',
    phone: '809-555-0102',
    role: 'STUDENT',
    status: 'ACTIVE',
    grade: 6,
    avatarUrl: '',
    lastLogin: '2026-04-02T14:20:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    failedLoginAttempts: 2,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-02-10T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Ana',
    lastName: 'L\xf3pez',
    email: 'maestro.lopez@eduplatform.com',
    phone: '809-555-0103',
    role: 'TEACHER',
    status: 'ACTIVE',
    subjects: ['Espa\xf1ol', 'Historia'],
    department: 'Humanidades',
    maxStudentsPerClass: 30,
    avatarUrl: '',
    lastLogin: '2026-04-03T08:00:00Z',
    createdAt: '2025-08-15T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: true,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-03-01T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Pedro',
    lastName: 'S\xe1nchez',
    email: 'estudiante.grado5@eduplatform.com',
    role: 'STUDENT',
    status: 'INACTIVE',
    grade: 5,
    avatarUrl: '',
    lastLogin: '2026-02-15T09:00:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    failedLoginAttempts: 5,
    isLocked: true,
    requirePasswordChange: true,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2025-12-01T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Laura',
    lastName: 'Mart\xednez',
    email: 'maestro.martinez@eduplatform.com',
    phone: '809-555-0105',
    role: 'TEACHER',
    status: 'ACTIVE',
    subjects: ['Matem\xe1ticas', 'Ciencia'],
    department: 'Ciencias',
    maxStudentsPerClass: 28,
    avatarUrl: '',
    lastLogin: '2026-04-03T07:45:00Z',
    createdAt: '2025-08-15T08:00:00Z',
    failedLoginAttempts: 1,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: true,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-03-15T00:00:00Z',
  },
  {
    id: '6',
    firstName: 'Roberto',
    lastName: 'Fern\xe1ndez',
    email: 'roberto.fernandez@eduplatform.com',
    phone: '809-555-0106',
    role: 'PARENT',
    status: 'ACTIVE',
    relationship: 'PADRE',
    linkedStudentIds: ['1'],
    avatarUrl: '',
    lastLogin: '2026-04-01T18:00:00Z',
    createdAt: '2025-09-10T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-01-20T00:00:00Z',
  },
  {
    id: '7',
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@eduplatform.com',
    phone: '809-555-0107',
    role: 'ADMIN',
    status: 'ACTIVE',
    permissionLevel: 'SUPER_ADMIN',
    avatarUrl: '',
    lastLogin: '2026-04-03T06:00:00Z',
    createdAt: '2025-01-01T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: true,
    maxFailedAttempts: 3,
    lastPasswordChange: '2026-04-01T00:00:00Z',
  },
  {
    id: '8',
    firstName: 'Sof\xeda',
    lastName: 'Torres',
    email: 'estudiante.grado3@eduplatform.com',
    role: 'STUDENT',
    status: 'SUSPENDED',
    grade: 3,
    avatarUrl: '',
    lastLogin: '2026-03-20T11:00:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    failedLoginAttempts: 3,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2025-11-15T00:00:00Z',
  },
  {
    id: '9',
    firstName: 'Miguel',
    lastName: 'Ram\xedrez',
    email: 'maestro.ramirez@eduplatform.com',
    phone: '809-555-0109',
    role: 'TEACHER',
    status: 'ACTIVE',
    subjects: ['Ingl\xe9s', 'Ingl\xe9s Conversacional'],
    department: 'Idiomas',
    maxStudentsPerClass: 25,
    avatarUrl: '',
    lastLogin: '2026-04-02T16:30:00Z',
    createdAt: '2025-08-20T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-02-28T00:00:00Z',
  },
  {
    id: '10',
    firstName: 'Carmen',
    lastName: 'D\xedaz',
    email: 'carmen.diaz@eduplatform.com',
    phone: '809-555-0110',
    role: 'PARENT',
    status: 'ACTIVE',
    relationship: 'MADRE',
    linkedStudentIds: ['2', '8'],
    avatarUrl: '',
    lastLogin: '2026-04-03T09:15:00Z',
    createdAt: '2025-09-05T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-03-10T00:00:00Z',
  },
  {
    id: '11',
    firstName: 'Javier',
    lastName: 'Moreno',
    email: 'maestro.moreno@eduplatform.com',
    phone: '809-555-0111',
    role: 'TEACHER',
    status: 'ACTIVE',
    subjects: ['Rob\xf3tica', 'Ciencia'],
    department: 'Tecnolog\xeda',
    maxStudentsPerClass: 20,
    avatarUrl: '',
    lastLogin: '2026-04-03T07:00:00Z',
    createdAt: '2025-08-10T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: true,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-03-20T00:00:00Z',
  },
  {
    id: '12',
    firstName: 'Isabella',
    lastName: 'Herrera',
    email: 'estudiante.grado9@eduplatform.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    grade: 9,
    avatarUrl: '',
    lastLogin: '2026-04-02T13:00:00Z',
    createdAt: '2025-09-01T08:00:00Z',
    failedLoginAttempts: 0,
    isLocked: false,
    requirePasswordChange: false,
    twoFactorEnabled: false,
    maxFailedAttempts: 5,
    lastPasswordChange: '2026-01-05T00:00:00Z',
  },
]

const MOCK_SECURITY_LOGS: SecurityLog[] = [
  { id: 's1', userId: '4', userName: 'Pedro S\xe1nchez', action: 'Intento de inicio de sesi\xf3n fallido', timestamp: '2026-04-03T09:00:00Z', ip: '192.168.1.100', details: 'Contrase\xf1a incorrecta' },
  { id: 's2', userId: '4', userName: 'Pedro S\xe1nchez', action: 'Intento de inicio de sesi\xf3n fallido', timestamp: '2026-04-03T09:01:00Z', ip: '192.168.1.100', details: 'Contrase\xf1a incorrecta' },
  { id: 's3', userId: '4', userName: 'Pedro S\xe1nchez', action: 'Cuenta bloqueada', timestamp: '2026-04-03T09:02:00Z', details: '5 intentos fallidos alcanzados' },
  { id: 's4', userId: '7', userName: 'Admin Principal', action: 'Contrase\xf1a cambiada', timestamp: '2026-04-01T10:00:00Z', ip: '10.0.0.1' },
  { id: 's5', userId: '3', userName: 'Ana L\xf3pez', action: 'Contrase\xf1a cambiada', timestamp: '2026-03-01T08:00:00Z', ip: '10.0.0.5' },
  { id: 's6', userId: '5', userName: 'Laura Mart\xednez', action: 'Contrase\xf1a cambiada', timestamp: '2026-03-15T14:00:00Z', ip: '10.0.0.8' },
  { id: 's7', userId: '8', userName: 'Sof\xeda Torres', action: 'Cuenta suspendida', timestamp: '2026-03-20T12:00:00Z', details: 'Suspendido por administrador' },
  { id: 's8', userId: '2', userName: 'Carlos Ruiz', action: 'Intento de inicio de sesi\xf3n fallido', timestamp: '2026-04-02T14:15:00Z', ip: '192.168.1.50', details: 'Contrase\xf1a incorrecta' },
]

// ==================== HELPER FUNCTIONS ====================

function getAvatarColor(id: string): string {
  const index = parseInt(id, 10) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score: 33, label: 'D\xe9bil', color: 'bg-red-500' }
  if (score <= 4) return { score: 66, label: 'Media', color: 'bg-yellow-500' }
  return { score: 100, label: 'Fuerte', color: 'bg-green-500' }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Nunca'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function generateStudentEmail(firstName: string, gradeLevel: number): string {
  return `estudiante.${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.grado${gradeLevel}@eduplatform.com`
}

function generateTeacherEmail(lastName: string): string {
  return `maestro.${lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@eduplatform.com`
}

// ==================== MAIN COMPONENT ====================

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('all-users')
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [securityLogs] = useState<SecurityLog[]>(MOCK_SECURITY_LOGS)

  // Tab 1 state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [gradeFilter, setGradeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'name' | 'email' | 'lastLogin'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 8

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [userAction, setUserAction] = useState<'activate' | 'deactivate' | 'delete'>('deactivate')

  // Selected user for dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Tab 2 state
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'STUDENT' as UserRole,
    grade: 0,
    subjects: [] as string[],
    grades: [] as number[],
    department: '',
    maxStudentsPerClass: 30,
    parentEmail: '',
    birthDate: '',
    relationship: 'MADRE' as ParentRelationship,
    linkedStudentIds: [] as string[],
    permissionLevel: 'ADMIN' as PermissionLevel,
    requirePasswordChange: true,
    twoFactorEnabled: false,
    accountExpiryDate: '',
    maxFailedAttempts: 5,
    enforcePasswordRequirements: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [createStep, setCreateStep] = useState(1)

  // Tab 4 state
  const [securitySearch, setSecuritySearch] = useState('')

  // ==================== COMPUTED VALUES ====================

  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (gradeFilter !== 'ALL') {
      const grade = parseInt(gradeFilter, 10)
      result = result.filter((u) => u.grade === grade)
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((u) => u.status === statusFilter)
    }

    if (subjectFilter !== 'ALL') {
      result = result.filter((u) => u.subjects?.includes(subjectFilter))
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email)
      } else if (sortField === 'lastLogin') {
        comparison = new Date(a.lastLogin || 0).getTime() - new Date(b.lastLogin || 0).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [users, searchQuery, roleFilter, gradeFilter, statusFilter, subjectFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'ACTIVE').length,
    inactive: users.filter((u) => u.status === 'INACTIVE').length,
    suspended: users.filter((u) => u.status === 'SUSPENDED').length,
    students: users.filter((u) => u.role === 'STUDENT').length,
    teachers: users.filter((u) => u.role === 'TEACHER').length,
    parents: users.filter((u) => u.role === 'PARENT').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    locked: users.filter((u) => u.isLocked).length,
  }), [users])

  const passwordStrength = getPasswordStrength(createForm.password)

  // ==================== HANDLERS ====================

  const handleSort = (field: 'name' | 'email' | 'lastLogin') => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllSelection = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((u) => u.id)))
    }
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return
    // TODO: API call DELETE /api/admin/users/:id
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
    setDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const executeBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'changeRole') => {
    // TODO: API call POST /api/admin/users/bulk with { ids, action }
    if (action === 'delete') {
      setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)))
    } else if (action === 'activate') {
      setUsers((prev) => prev.map((u) => (selectedUsers.has(u.id) ? { ...u, status: 'ACTIVE' as const } : u)))
    } else if (action === 'deactivate') {
      setUsers((prev) => prev.map((u) => (selectedUsers.has(u.id) ? { ...u, status: 'INACTIVE' as const } : u)))
    }
    setSelectedUsers(new Set())
  }

  const handleResetPassword = () => {
    if (!selectedUser) return
    // TODO: API call POST /api/admin/users/:id/reset-password
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, requirePasswordChange: true, lastPasswordChange: new Date().toISOString() }
          : u
      )
    )
    setResetPasswordDialogOpen(false)
    setSelectedUser(null)
  }

  const handleUnlockAccount = (userId: string) => {
    // TODO: API call POST /api/admin/users/:id/unlock
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isLocked: false, failedLoginAttempts: 0 } : u))
    )
  }

  const handleUserStatusChange = (userId: string, status: UserStatus) => {
    // TODO: API call PATCH /api/admin/users/:id { status }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)))
  }

  // Auto-generate email on create form
  const handleFirstNameChange = (value: string) => {
    setCreateForm((prev) => {
      const updated = { ...prev, firstName: value }
      if (prev.role === 'STUDENT' && value && prev.grade) {
        updated.email = generateStudentEmail(value, prev.grade)
      }
      return updated
    })
  }

  const handleLastNameChange = (value: string) => {
    setCreateForm((prev) => {
      const updated = { ...prev, lastName: value }
      if (prev.role === 'TEACHER' && value) {
        updated.email = generateTeacherEmail(value)
      }
      return updated
    })
  }

  const handleRoleChange = (role: UserRole) => {
    setCreateForm((prev) => {
      const updated = { ...prev, role, subjects: [], grades: [], department: '' }
      if (role === 'STUDENT' && prev.firstName && prev.grade) {
        updated.email = generateStudentEmail(prev.firstName, prev.grade)
      } else if (role === 'TEACHER' && prev.lastName) {
        updated.email = generateTeacherEmail(prev.lastName)
      } else {
        updated.email = ''
      }
      return updated
    })
  }

  const toggleSubject = (subject: string) => {
    setCreateForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const toggleGrade = (grade: number) => {
    setCreateForm((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade],
    }))
  }

  const handleCreateUser = () => {
    if (createForm.password !== createForm.confirmPassword) return
    // TODO: API call POST /api/users with form data
    const newUser: User = {
      id: String(users.length + 1),
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      email: createForm.email,
      phone: createForm.phone || undefined,
      role: createForm.role,
      status: 'ACTIVE',
      grade: createForm.role === 'STUDENT' ? createForm.grade : undefined,
      subjects: createForm.role === 'TEACHER' ? createForm.subjects : undefined,
      department: createForm.role === 'TEACHER' ? createForm.department : undefined,
      maxStudentsPerClass: createForm.role === 'TEACHER' ? createForm.maxStudentsPerClass : undefined,
      parentEmail: createForm.role === 'STUDENT' ? createForm.parentEmail || undefined : undefined,
      birthDate: createForm.role === 'STUDENT' ? createForm.birthDate || undefined : undefined,
      relationship: createForm.role === 'PARENT' ? createForm.relationship : undefined,
      linkedStudentIds: createForm.role === 'PARENT' ? createForm.linkedStudentIds : undefined,
      permissionLevel: createForm.role === 'ADMIN' ? createForm.permissionLevel : undefined,
      avatarUrl: '',
      lastLogin: undefined,
      createdAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false,
      requirePasswordChange: createForm.requirePasswordChange,
      twoFactorEnabled: createForm.twoFactorEnabled,
      accountExpiryDate: createForm.accountExpiryDate || undefined,
      maxFailedAttempts: createForm.maxFailedAttempts,
      lastPasswordChange: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])
    // Reset form
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'STUDENT',
      grade: 0,
      subjects: [],
      grades: [],
      department: '',
      maxStudentsPerClass: 30,
      parentEmail: '',
      birthDate: '',
      relationship: 'MADRE',
      linkedStudentIds: [],
      permissionLevel: 'ADMIN',
      requirePasswordChange: true,
      twoFactorEnabled: false,
      accountExpiryDate: '',
      maxFailedAttempts: 5,
      enforcePasswordRequirements: true,
    })
    setCreateStep(1)
  }

  // ==================== RENDER HELPERS ====================

  const renderStatusBadge = (status: UserStatus) => {
    const variant = status === 'ACTIVE' ? 'default' : status === 'INACTIVE' ? 'secondary' : 'destructive'
    const icon =
      status === 'ACTIVE' ? (
        <CheckCircle className="mr-1 h-3 w-3" />
      ) : status === 'SUSPENDED' ? (
        <AlertTriangle className="mr-1 h-3 w-3" />
      ) : (
        <XCircle className="mr-1 h-3 w-3" />
      )
    return (
      <Badge variant={variant}>
        {icon}
        {STATUS_LABELS[status]}
      </Badge>
    )
  }

  const renderRoleBadge = (role: UserRole) => {
    const colorMap: Record<UserRole, string> = {
      STUDENT: 'bg-blue-100 text-blue-800',
      TEACHER: 'bg-purple-100 text-purple-800',
      PARENT: 'bg-green-100 text-green-800',
      ADMIN: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[role]}`}>
        {ROLE_LABELS[role]}
      </span>
    )
  }

  // ==================== TAB 1: ALL USERS ====================

  const renderAllUsers = () => (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-purple-100">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.teachers}</p>
                <p className="text-xs text-muted-foreground">Maestros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-red-100">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.locked}</p>
                <p className="text-xs text-muted-foreground">Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los roles</SelectItem>
                  <SelectItem value="STUDENT">Estudiante</SelectItem>
                  <SelectItem value="TEACHER">Maestro</SelectItem>
                  <SelectItem value="PARENT">Padre/Tutor</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={(v) => { setGradeFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los grados</SelectItem>
                  {GRADE_LEVELS.map((g) => (
                    <SelectItem key={g.level} value={String(g.level)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={(v) => { setSubjectFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las materias</SelectItem>
                  {TEACHER_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setRoleFilter('ALL')
                  setGradeFilter('ALL')
                  setStatusFilter('ALL')
                  setSubjectFilter('ALL')
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                title="Limpiar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk actions bar */}
          {selectedUsers.size > 0 && (
            <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers.size} usuario(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => executeBulkAction('activate')}>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Activar
                </Button>
                <Button size="sm" variant="outline" onClick={() => executeBulkAction('deactivate')}>
                  <XCircle className="mr-1 h-3 w-3" />
                  Desactivar
                </Button>
                <Button size="sm" variant="outline" onClick={() => executeBulkAction('changeRole')}>
                  <UserCheck className="mr-1 h-3 w-3" />
                  Cambiar Rol
                </Button>
                <Button size="sm" variant="destructive" onClick={() => executeBulkAction('delete')}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Eliminar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Users table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden md:table-cell">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden lg:table-cell">Grado/Materias</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden sm:table-cell">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden xl:table-cell">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('lastLogin')}
                    >
                      \xdaltimo Acceso
                      {sortField === 'lastLogin' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm w-16">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground font-medium">No se encontraron usuarios</p>
                        <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors last:border-b-0">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className={`text-white text-xs ${getAvatarColor(user.id)}`}>
                              {getInitials(`${user.firstName} ${user.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                            {user.isLocked && (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Bloqueado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell"><span className="truncate block max-w-[200px]">{user.email}</span></td>
                      <td className="py-3 px-4">{renderRoleBadge(user.role)}</td>
                      <td className="py-3 px-4 text-sm">
                        {user.role === 'STUDENT' && user.grade !== undefined && (
                          <span className="text-muted-foreground">{GRADE_LEVELS[user.grade]?.name || 'N/A'}</span>
                        )}
                        {user.role === 'TEACHER' && user.subjects && (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.subjects.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {(user.role === 'PARENT' || user.role === 'ADMIN') && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditDialogOpen(true) }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setResetPasswordDialogOpen(true) }}>
                              <Key className="mr-2 h-4 w-4" />
                              Restablecer contrase\xf1a
                            </DropdownMenuItem>
                            {user.isLocked ? (
                              <DropdownMenuItem onClick={() => handleUnlockAccount(user.id)}>
                                <Unlock className="mr-2 h-4 w-4" />
                                Desbloquear cuenta
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user)
                                setUserAction('deactivate')
                                setDeleteDialogOpen(true)
                              }}>
                                <Lock className="mr-2 h-4 w-4" />
                                Bloquear cuenta
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setChangeRoleDialogOpen(true) }}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Cambiar rol
                            </DropdownMenuItem>
                            {user.status === 'ACTIVE' ? (
                              <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, 'INACTIVE')}>
                                <UserX className="mr-2 h-4 w-4" />
                                Desactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, 'ACTIVE')}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setSelectedUser(user)
                                setUserAction('delete')
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * usersPerPage + 1} a{' '}
                {Math.min(currentPage * usersPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  P\xe1gina {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // ==================== TAB 2: CREATE USER ====================

  const renderCreateUser = () => {
    const canProceed = () => {
      if (createStep === 1) {
        return createForm.firstName.trim() && createForm.lastName.trim() && createForm.email.trim()
      }
      if (createStep === 2) {
        if (createForm.role === 'STUDENT') return createForm.grade > 0
        if (createForm.role === 'TEACHER') return createForm.subjects.length > 0 && createForm.grades.length > 0
        if (createForm.role === 'PARENT') return createForm.linkedStudentIds.length > 0
        return true
      }
      return true
    }

    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              {[
                { step: 1, label: 'Informaci\xf3n B\xe1sica' },
                { step: 2, label: 'Detalles de Rol' },
                { step: 3, label: 'Seguridad' },
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${createStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {step}
                  </div>
                  <span className={`ml-2 text-sm ${createStep >= step ? 'font-medium' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${createStep > step ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {createStep === 1 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold">Informaci\xf3n Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nombre *</label>
                    <Input
                      value={createForm.firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Apellido *</label>
                    <Input
                      value={createForm.lastName}
                      onChange={(e) => handleLastNameChange(e.target.value)}
                      placeholder="Apellido"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Email *
                    {createForm.email && (
                      <span className="text-xs text-muted-foreground ml-2">(Auto-generado)</span>
                    )}
                  </label>
                  <Input
                    value={createForm.email}
                    onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@eduplatform.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tel\xe9fono (opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={createForm.phone}
                      onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="809-555-0000"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contrase\xf1a *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="M\xednimo 8 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                  {createForm.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Fortaleza</span>
                        <span className="text-xs font-medium">{passwordStrength.label}</span>
                      </div>
                      <Progress value={passwordStrength.score} className="h-2" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Confirmar Contrase\xf1a *</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={createForm.confirmPassword}
                      onChange={(e) => setCreateForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Repite la contrase\xf1a"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                  {createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Las contrase\xf1as no coinciden
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rol *</label>
                  <Select value={createForm.role} onValueChange={(v) => handleRoleChange(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Estudiante</SelectItem>
                      <SelectItem value="TEACHER">Maestro</SelectItem>
                      <SelectItem value="PARENT">Padre/Tutor</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Role-specific details */}
            {createStep === 2 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* STUDENT fields */}
                {createForm.role === 'STUDENT' && (
                  <>
                    <h3 className="text-lg font-semibold">Detalles de Estudiante</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Grado *</label>
                      <Select
                        value={String(createForm.grade)}
                        onValueChange={(v) => {
                          const grade = parseInt(v, 10)
                          setCreateForm((p) => ({
                            ...p,
                            grade,
                            email: p.firstName ? generateStudentEmail(p.firstName, grade) : p.email,
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADE_LEVELS.map((g) => (
                            <SelectItem key={g.level} value={String(g.level)}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email del Padre/Tutor (opcional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={createForm.parentEmail}
                          onChange={(e) => setCreateForm((p) => ({ ...p, parentEmail: e.target.value }))}
                          placeholder="padre@email.com"
                          type="email"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Fecha de Nacimiento</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={createForm.birthDate}
                          onChange={(e) => setCreateForm((p) => ({ ...p, birthDate: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* TEACHER fields */}
                {createForm.role === 'TEACHER' && (
                  <>
                    <h3 className="text-lg font-semibold">Detalles de Maestro</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Materias *</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {TEACHER_SUBJECTS.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => toggleSubject(subject)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${createForm.subjects.includes(subject)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background hover:bg-muted'
                              }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Grados que ense\xf1a *</label>
                      <div className="grid grid-cols-3 gap-2 mt-1 max-h-40 overflow-y-auto">
                        {GRADE_LEVELS.map((g) => (
                          <button
                            key={g.level}
                            type="button"
                            onClick={() => toggleGrade(g.level)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${createForm.grades.includes(g.level)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background hover:bg-muted'
                              }`}
                          >
                            {g.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Departamento</label>
                      <Input
                        value={createForm.department}
                        onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))}
                        placeholder="Ej: Humanidades, Ciencias..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">M\xe1x. estudiantes por clase</label>
                      <Input
                        type="number"
                        value={createForm.maxStudentsPerClass}
                        onChange={(e) =>
                          setCreateForm((p) => ({ ...p, maxStudentsPerClass: parseInt(e.target.value, 10) }))
                        }
                        min={10}
                        max={50}
                      />
                    </div>
                  </>
                )}

                {/* PARENT fields */}
                {createForm.role === 'PARENT' && (
                  <>
                    <h3 className="text-lg font-semibold">Detalles de Padre/Tutor</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Relaci\xf3n</label>
                      <Select
                        value={createForm.relationship}
                        onValueChange={(v) =>
                          setCreateForm((p) => ({ ...p, relationship: v as ParentRelationship }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MADRE">Madre</SelectItem>
                          <SelectItem value="PADRE">Padre</SelectItem>
                          <SelectItem value="TUTOR_LEGAL">Tutor Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Vincular a Estudiantes *</label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Seleccione los estudiantes que estar\xe1n vinculados a esta cuenta
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {users
                          .filter((u) => u.role === 'STUDENT')
                          .map((student) => (
                            <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={createForm.linkedStudentIds.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCreateForm((p) => ({
                                      ...p,
                                      linkedStudentIds: [...p.linkedStudentIds, student.id],
                                    }))
                                  } else {
                                    setCreateForm((p) => ({
                                      ...p,
                                      linkedStudentIds: p.linkedStudentIds.filter((id) => id !== student.id),
                                    }))
                                  }
                                }}
                                className="rounded"
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className={`text-white text-xs ${getAvatarColor(student.id)}`}>
                                  {getInitials(`${student.firstName} ${student.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {student.firstName} {student.lastName} -{' '}
                                {student.grade !== undefined ? GRADE_LEVELS[student.grade]?.shortName : ''}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ADMIN fields */}
                {createForm.role === 'ADMIN' && (
                  <>
                    <h3 className="text-lg font-semibold">Detalles de Administrador</h3>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nivel de Permiso</label>
                      <Select
                        value={createForm.permissionLevel}
                        onValueChange={(v) =>
                          setCreateForm((p) => ({ ...p, permissionLevel: v as PermissionLevel }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Security */}
            {createStep === 3 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold">Configuraci\xf3n de Seguridad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Forzar cambio de contrase\xf1a en primer inicio de sesi\xf3n</p>
                      <p className="text-sm text-muted-foreground">
                        El usuario deber\xe1 cambiar su contrase\xf1a al entrar por primera vez
                      </p>
                    </div>
                    <Switch
                      checked={createForm.requirePasswordChange}
                      onCheckedChange={(v) => setCreateForm((p) => ({ ...p, requirePasswordChange: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Habilitar Autenticaci\xf3n de 2 Factores (2FA)</p>
                      <p className="text-sm text-muted-foreground">
                        Requerir verificaci\xf3n adicional al iniciar sesi\xf3n
                      </p>
                    </div>
                    <Switch
                      checked={createForm.twoFactorEnabled}
                      onCheckedChange={(v) => setCreateForm((p) => ({ ...p, twoFactorEnabled: v }))}
                    />
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <label className="text-sm font-medium">M\xe1x. intentos fallidos de inicio de sesi\xf3n</label>
                    <Input
                      type="number"
                      value={createForm.maxFailedAttempts}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, maxFailedAttempts: parseInt(e.target.value, 10) }))
                      }
                      min={3}
                      max={10}
                      className="max-w-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      La cuenta se bloquear\xe1 autom\xe1ticamente despu\xe9s de este n\xfamero de intentos fallidos
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-3">
                    <label className="text-sm font-medium">Fecha de Expiraci\xf3n de Cuenta (opcional)</label>
                    <Input
                      type="date"
                      value={createForm.accountExpiryDate}
                      onChange={(e) => setCreateForm((p) => ({ ...p, accountExpiryDate: e.target.value }))}
                      className="max-w-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      La cuenta se desactivar\xe1 autom\xe1ticamente en esta fecha
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {createStep > 1 ? (
                <Button variant="outline" onClick={() => setCreateStep((s) => s - 1)}>
                  Anterior
                </Button>
              ) : (
                <div />
              )}
              {createStep < 3 ? (
                <Button onClick={() => setCreateStep((s) => s + 1)} disabled={!canProceed()}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleCreateUser}
                  disabled={
                    !createForm.firstName ||
                    !createForm.lastName ||
                    !createForm.email ||
                    !createForm.password ||
                    createForm.password !== createForm.confirmPassword
                  }
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== TAB 3: BY GRADE ====================

  const renderByGrade = () => {
    // For mock data, assign teachers to grades based on subjects
    const teachersByGrade: Record<number, User[]> = {}
    users.filter((u) => u.role === 'TEACHER').forEach((teacher) => {
      // Assign to random grades for demo
      const grades = [6, 7, 8, 9, 10, 11, 12]
      grades.forEach((g) => {
        if (!teachersByGrade[g]) teachersByGrade[g] = []
        teachersByGrade[g].push(teacher)
      })
    })

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Estudiantes por Grado</h2>
            <p className="text-muted-foreground">Organizaci\xf3n de estudiantes y maestros asignados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setActiveTab('create-user')}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Estudiante
            </Button>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']}>
          {GRADE_LEVELS.map((grade) => {
            const students = users.filter((u) => u.role === 'STUDENT' && u.grade === grade.level)
            const teachers = users.filter(
              (u) => u.role === 'TEACHER'
            ) // Show all teachers per grade for demo

            return (
              <AccordionItem key={grade.level} value={String(grade.level)}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold">{grade.name}</span>
                    <Badge variant="secondary">{students.length} estudiantes</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Assigned teachers */}
                    {teachers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          Maestros Asignados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {teachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200"
                            >
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className={`text-white text-xs ${getAvatarColor(teacher.id)}`}>
                                  {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {teacher.firstName} {teacher.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {teacher.subjects?.join(', ')}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            Cambiar Maestro
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Students list */}
                    {students.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Estudiantes ({students.length})</h4>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            Agregar Estudiante
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={`text-white text-sm ${getAvatarColor(student.id)}`}>
                                  {getInitials(`${student.firstName} ${student.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStatusBadge(student.status)}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => { setSelectedUser(student); setEditDialogOpen(true) }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(student)
                                    setUserAction('delete')
                                    setDeleteDialogOpen(true)
                                  }}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No hay estudiantes en este grado</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Plus className="mr-1 h-3 w-3" />
                          Agregar Estudiante
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    )
  }

  // ==================== TAB 4: SECURITY ====================

  const renderSecurity = () => {
    const lockedUsers = users.filter((u) => u.isLocked)
    const recentPasswordChanges = securityLogs.filter((l) => l.action.includes('Contrase\xf1a cambiada'))
    const failedAttempts = securityLogs.filter((l) => l.action.includes('fallido'))

    return (
      <div className="space-y-6">
        {/* Password Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Restablecer Contrase\xf1a
            </CardTitle>
            <CardDescription>
              Busca un usuario y restablece su contrase\xf1a
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuario por nombre o email..."
                  value={securitySearch}
                  onChange={(e) => setSecuritySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  const found = users.find(
                    (u) =>
                      u.firstName.toLowerCase().includes(securitySearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(securitySearch.toLowerCase())
                  )
                  if (found) {
                    setSelectedUser(found)
                    setResetPasswordDialogOpen(true)
                  }
                }}
                disabled={!securitySearch}
              >
                Restablecer
              </Button>
            </div>
            {securitySearch && (
              <div className="mt-3 space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                {users
                  .filter(
                    (u) =>
                      u.firstName.toLowerCase().includes(securitySearch.toLowerCase()) ||
                      u.lastName.toLowerCase().includes(securitySearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(securitySearch.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        setSelectedUser(u)
                        setResetPasswordDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className={`text-white text-xs ${getAvatarColor(u.id)}`}>
                            {getInitials(`${u.firstName} ${u.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      {renderRoleBadge(u.role)}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Locked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Cuentas Bloqueadas ({lockedUsers.length})
            </CardTitle>
            <CardDescription>
              Cuentas bloqueadas por m\xfaltiples intentos fallidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lockedUsers.length > 0 ? (
              <div className="space-y-3">
                {lockedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-white text-sm ${getAvatarColor(user.id)}`}>
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {user.failedLoginAttempts} intentos fallidos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlockAccount(user.id)}
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Desbloquear
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No hay cuentas bloqueadas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Login Attempts Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Registro de Intentos Fallidos
            </CardTitle>
            <CardDescription>
              \xdaltimos intentos de inicio de sesi\xf3n fallidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium">Acci\xf3n</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha/Hora</th>
                    <th className="text-left py-3 px-4 font-medium">IP</th>
                    <th className="text-left py-3 px-4 font-medium">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {failedAttempts.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <span className="font-medium">{log.userName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="destructive">{log.action}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatDate(log.timestamp)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{log.ip || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Password Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              \xdaltimos Cambios de Contrase\xf1a
            </CardTitle>
            <CardDescription>
              Historial de cambios de contrase\xf1a recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPasswordChanges.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Key className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{log.userName}</p>
                      <p className="text-sm text-muted-foreground">{log.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Resumen de Actividad de Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Cuentas Activas</span>
                </div>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">de {stats.total} totales</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Con 2FA</span>
                </div>
                <p className="text-3xl font-bold">{users.filter((u) => u.twoFactorEnabled).length}</p>
                <p className="text-xs text-muted-foreground">usuarios protegidos</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Bloqueadas</span>
                </div>
                <p className="text-3xl font-bold">{stats.locked}</p>
                <p className="text-xs text-muted-foreground">requieren atenci\xf3n</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Suspendidas</span>
                </div>
                <p className="text-3xl font-bold">{stats.suspended}</p>
                <p className="text-xs text-muted-foreground">cuentas suspendidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== DIALOGS ====================

  // Edit User Dialog
  const renderEditDialog = () => {
    if (!selectedUser) return null
    return (
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la informaci\xf3n de {selectedUser.firstName} {selectedUser.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className={`text-white text-xl ${getAvatarColor(selectedUser.id)}`}>
                  {getInitials(`${selectedUser.firstName} ${selectedUser.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                {renderRoleBadge(selectedUser.role)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <Input
                  defaultValue={selectedUser.firstName}
                  id="edit-firstName"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Apellido</label>
                <Input
                  defaultValue={selectedUser.lastName}
                  id="edit-lastName"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input defaultValue={selectedUser.email} type="email" id="edit-email" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tel\xe9fono</label>
              <Input defaultValue={selectedUser.phone || ''} id="edit-phone" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select defaultValue={selectedUser.status}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUser.role === 'STUDENT' && selectedUser.grade !== undefined && (
              <div>
                <label className="text-sm font-medium mb-1 block">Grado</label>
                <Select defaultValue={String(selectedUser.grade)}>
                  <SelectTrigger id="edit-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((g) => (
                      <SelectItem key={g.level} value={String(g.level)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedUser.role === 'TEACHER' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Materias</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUser.subjects?.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Autenticaci\xf3n 2FA</p>
                <p className="text-sm text-muted-foreground">Autenticaci\xf3n de dos factores</p>
              </div>
              <Switch defaultChecked={selectedUser.twoFactorEnabled} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // TODO: API call PUT /api/admin/users/:id
                setEditDialogOpen(false)
              }}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Delete Confirmation Dialog
  const renderDeleteDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userAction === 'delete' ? (
              <>
                <Trash2 className="h-5 w-5 text-red-500" />
                Eliminar Usuario
              </>
            ) : userAction === 'deactivate' ? (
              <>
                <UserX className="h-5 w-5 text-yellow-500" />
                Desactivar Usuario
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-red-500" />
                Bloquear Cuenta
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {userAction === 'delete'
              ? `\xbfEst\xe1s seguro de que deseas eliminar a ${selectedUser?.firstName} ${selectedUser?.lastName}? Esta acci\xf3n no se puede deshacer.`
              : userAction === 'deactivate'
                ? `\xbfEst\xe1s seguro de que deseas desactivar la cuenta de ${selectedUser?.firstName} ${selectedUser?.lastName}?`
                : `\xbfEst\xe1s seguro de que deseas bloquear la cuenta de ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant={userAction === 'delete' ? 'destructive' : 'default'}
            onClick={() => {
              if (userAction === 'delete') {
                handleDeleteUser()
              } else if (userAction === 'deactivate' && selectedUser) {
                handleUserStatusChange(selectedUser.id, 'INACTIVE')
                setDeleteDialogOpen(false)
              }
            }}
          >
            {userAction === 'delete' ? 'Eliminar' : userAction === 'deactivate' ? 'Desactivar' : 'Bloquear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Change Role Dialog
  const renderChangeRoleDialog = () => (
    <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Cambiar Rol de Usuario
          </DialogTitle>
          <DialogDescription>
            Cambiar el rol de {selectedUser?.firstName} {selectedUser?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-white text-sm ${getAvatarColor(selectedUser?.id || '')}`}>
                {getInitials(`${selectedUser?.firstName} ${selectedUser?.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</p>
              <p className="text-sm text-muted-foreground">Rol actual: {ROLE_LABELS[selectedUser?.role || 'STUDENT']}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Nuevo Rol</label>
            <Select defaultValue={selectedUser?.role}>
              <SelectTrigger id="change-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Estudiante</SelectItem>
                <SelectItem value="TEACHER">Maestro</SelectItem>
                <SelectItem value="PARENT">Padre/Tutor</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              Cambiar el rol puede afectar los permisos y accesos del usuario
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // TODO: API call PATCH /api/admin/users/:id/role
              setChangeRoleDialogOpen(false)
            }}
          >
            Confirmar Cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Reset Password Dialog
  const renderResetPasswordDialog = () => (
    <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Restablecer Contrase\xf1a
          </DialogTitle>
          <DialogDescription>
            Generar nueva contrase\xf1a para {selectedUser?.firstName} {selectedUser?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-white text-sm ${getAvatarColor(selectedUser?.id || '')}`}>
                {getInitials(`${selectedUser?.firstName} ${selectedUser?.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Se generar\xe1 una contrase\xf1a temporal y se enviar\xe1 por email al usuario
            </p>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Forzar cambio en primer inicio de sesi\xf3n</p>
              <p className="text-sm text-muted-foreground">El usuario deber\xe1 cambiar la contrase\xf1a al entrar</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleResetPassword}>
            <Key className="mr-2 h-4 w-4" />
            Generar y Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ==================== MAIN RENDER ====================

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gesti\xf3n de Usuarios</h1>
          <p className="text-muted-foreground">Administra estudiantes, maestros, padres y administradores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all-users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Todos los Usuarios</span>
            <span className="sm:hidden">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="create-user" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Crear Usuario</span>
            <span className="sm:hidden">Crear</span>
          </TabsTrigger>
          <TabsTrigger value="by-grade" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Por Grado</span>
            <span className="sm:hidden">Grado</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="mt-6">
          {renderAllUsers()}
        </TabsContent>

        <TabsContent value="create-user" className="mt-6">
          {renderCreateUser()}
        </TabsContent>

        <TabsContent value="by-grade" className="mt-6">
          {renderByGrade()}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          {renderSecurity()}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {renderEditDialog()}
      {renderDeleteDialog()}
      {renderChangeRoleDialog()}
      {renderResetPasswordDialog()}
    </div>
  )
}

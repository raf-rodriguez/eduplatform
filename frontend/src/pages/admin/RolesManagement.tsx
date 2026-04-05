import { useState, useMemo, useCallback } from 'react'
import * as React from 'react'
import {
  Shield,
  Key,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  Lock,
  Unlock,
  Search,
  Table as TableIcon,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============================================================================
// TODO: Replace all simulated data with actual API calls
// Endpoints:
//   GET    /api/roles
//   GET    /api/roles/:id
//   POST   /api/roles
//   PUT    /api/roles/:id
//   DELETE /api/roles/:id  (only custom roles)
//   GET    /api/roles/:id/users/count
// ============================================================================

// ==================== TYPES ====================

type PermissionCategory =
  | 'users'
  | 'content'
  | 'assessments'
  | 'progress'
  | 'reports'
  | 'gamification'
  | 'messaging'
  | 'forum'
  | 'system'
  | 'billing'

type RoleKey = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | string

interface RolePermission {
  category: PermissionCategory
  permissions: string[]
}

interface Role {
  id: string
  key: RoleKey
  name: string
  description: string
  isDefault: boolean
  userCount: number
  color: string
  icon: string
  permissions: RolePermission[]
}

interface PermissionToggleState {
  [category: string]: { [perm: string]: boolean }
}

// ==================== CONSTANTS ====================

const PERMISSION_CATEGORIES: {
  key: PermissionCategory
  label: string
  icon: React.ReactNode
  description: string
  permissions: { key: string; label: string }[]
}[] = [
    {
      key: 'users',
      label: 'Usuarios',
      icon: <Users className="h-4 w-4" />,
      description: 'Gestion de usuarios del sistema',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Actualizar' },
        { key: 'delete', label: 'Eliminar' },
        { key: 'assign_roles', label: 'Asignar roles' },
      ],
    },
    {
      key: 'content',
      label: 'Contenido',
      icon: <Shield className="h-4 w-4" />,
      description: 'Gestion de contenido educativo',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Actualizar' },
        { key: 'delete', label: 'Eliminar' },
        { key: 'publish', label: 'Publicar' },
      ],
    },
    {
      key: 'assessments',
      label: 'Evaluaciones',
      icon: <Key className="h-4 w-4" />,
      description: 'Gestion de examenes y evaluaciones',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'create', label: 'Crear' },
        { key: 'update', label: 'Actualizar' },
        { key: 'delete', label: 'Eliminar' },
        { key: 'grade', label: 'Calificar' },
      ],
    },
    {
      key: 'progress',
      label: 'Progreso',
      icon: <Eye className="h-4 w-4" />,
      description: 'Seguimiento del progreso estudiantil',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'update', label: 'Actualizar' },
        { key: 'export', label: 'Exportar' },
      ],
    },
    {
      key: 'reports',
      label: 'Reportes',
      icon: <Shield className="h-4 w-4" />,
      description: 'Generacion y gestion de reportes',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'generate', label: 'Generar' },
        { key: 'export', label: 'Exportar' },
      ],
    },
    {
      key: 'gamification',
      label: 'Gamificacion',
      icon: <Key className="h-4 w-4" />,
      description: 'Sistema de gamificacion y recompensas',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'assign_badges', label: 'Asignar insignias' },
        { key: 'modify_xp', label: 'Modificar XP' },
      ],
    },
    {
      key: 'messaging',
      label: 'Mensajeria',
      icon: <Eye className="h-4 w-4" />,
      description: 'Sistema de mensajeria interna',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'send', label: 'Enviar' },
        { key: 'moderate', label: 'Moderar' },
      ],
    },
    {
      key: 'forum',
      label: 'Foro',
      icon: <Users className="h-4 w-4" />,
      description: 'Foros de discusion',
      permissions: [
        { key: 'read', label: 'Leer' },
        { key: 'create', label: 'Crear' },
        { key: 'moderate', label: 'Moderar' },
        { key: 'delete', label: 'Eliminar' },
      ],
    },
    {
      key: 'system',
      label: 'Sistema',
      icon: <Settings className="h-4 w-4" />,
      description: 'Configuracion y administracion del sistema',
      permissions: [
        { key: 'settings', label: 'Configuracion' },
        { key: 'audit_logs', label: 'Registros de auditoria' },
        { key: 'backups', label: 'Copias de seguridad' },
      ],
    },
    {
      key: 'billing',
      label: 'Facturacion',
      icon: <Key className="h-4 w-4" />,
      description: 'Gestion de planes y suscripciones',
      permissions: [
        { key: 'view_plans', label: 'Ver planes' },
        { key: 'manage_subscriptions', label: 'Gestionar suscripciones' },
      ],
    },
  ]

const ALL_PERMISSIONS: string[] = PERMISSION_CATEGORIES.flatMap(
  (cat) => cat.permissions.map((p) => `${cat.key}:${p.key}`)
)

// ==================== SIMULATED DATA ====================

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    key: 'SUPER_ADMIN',
    name: 'Super Administrador',
    description: 'Acceso completo a todas las funcionalidades del sistema sin restricciones.',
    isDefault: true,
    userCount: 2,
    color: 'from-red-500 to-red-700',
    icon: 'Lock',
    permissions: ALL_PERMISSIONS.map((p) => {
      const [cat, perm] = p.split(':') as [PermissionCategory, string]
      return { category: cat, permissions: [perm] }
    }).reduce((acc: RolePermission[], curr) => {
      const existing = acc.find((a) => a.category === curr.category)
      if (existing) {
        existing.permissions.push(...curr.permissions)
      } else {
        acc.push({ category: curr.category, permissions: [...curr.permissions] })
      }
      return acc
    }, []),
  },
  {
    id: '2',
    key: 'ADMIN',
    name: 'Administrador',
    description: 'Gestion de usuarios, contenido y configuraciones del sistema. Sin acceso a copias de seguridad.',
    isDefault: true,
    userCount: 5,
    color: 'from-purple-500 to-purple-700',
    icon: 'Unlock',
    permissions: [
      { category: 'users', permissions: ['read', 'create', 'update', 'delete', 'assign_roles'] },
      { category: 'content', permissions: ['read', 'create', 'update', 'delete', 'publish'] },
      { category: 'assessments', permissions: ['read', 'create', 'update', 'delete', 'grade'] },
      { category: 'progress', permissions: ['read', 'update', 'export'] },
      { category: 'reports', permissions: ['read', 'generate', 'export'] },
      { category: 'gamification', permissions: ['read', 'assign_badges', 'modify_xp'] },
      { category: 'messaging', permissions: ['read', 'send', 'moderate'] },
      { category: 'forum', permissions: ['read', 'create', 'moderate', 'delete'] },
      { category: 'system', permissions: ['settings', 'audit_logs'] },
      { category: 'billing', permissions: ['view_plans', 'manage_subscriptions'] },
    ],
  },
  {
    id: '3',
    key: 'TEACHER',
    name: 'Maestro',
    description: 'Gestion de contenido, evaluaciones y seguimiento de estudiantes. Sin acceso administrativo.',
    isDefault: true,
    userCount: 24,
    color: 'from-blue-500 to-blue-700',
    icon: 'Users',
    permissions: [
      { category: 'users', permissions: ['read'] },
      { category: 'content', permissions: ['read', 'create', 'update', 'publish'] },
      { category: 'assessments', permissions: ['read', 'create', 'update', 'grade'] },
      { category: 'progress', permissions: ['read', 'update', 'export'] },
      { category: 'reports', permissions: ['read', 'generate', 'export'] },
      { category: 'gamification', permissions: ['read', 'assign_badges'] },
      { category: 'messaging', permissions: ['read', 'send'] },
      { category: 'forum', permissions: ['read', 'create', 'moderate'] },
    ],
  },
  {
    id: '4',
    key: 'STUDENT',
    name: 'Estudiante',
    description: 'Acceso a contenido, evaluaciones y seguimiento de su propio progreso.',
    isDefault: true,
    userCount: 342,
    color: 'from-green-500 to-green-700',
    icon: 'Eye',
    permissions: [
      { category: 'users', permissions: ['read'] },
      { category: 'content', permissions: ['read'] },
      { category: 'assessments', permissions: ['read'] },
      { category: 'progress', permissions: ['read'] },
      { category: 'reports', permissions: ['read'] },
      { category: 'gamification', permissions: ['read'] },
      { category: 'messaging', permissions: ['read', 'send'] },
      { category: 'forum', permissions: ['read', 'create'] },
    ],
  },
  {
    id: '5',
    key: 'PARENT',
    name: 'Padre / Tutor',
    description: 'Visualizacion del progreso de sus hijos y comunicacion con maestros.',
    isDefault: true,
    userCount: 128,
    color: 'from-orange-500 to-orange-700',
    icon: 'Users',
    permissions: [
      { category: 'users', permissions: ['read'] },
      { category: 'content', permissions: ['read'] },
      { category: 'progress', permissions: ['read'] },
      { category: 'reports', permissions: ['read', 'export'] },
      { category: 'gamification', permissions: ['read'] },
      { category: 'messaging', permissions: ['read', 'send'] },
      { category: 'forum', permissions: ['read'] },
    ],
  },
  {
    id: '6',
    key: 'COORDINATOR',
    name: 'Coordinador Academico',
    description: 'Supervision de maestros, contenido y reportes academicos.',
    isDefault: false,
    userCount: 4,
    color: 'from-teal-500 to-teal-700',
    icon: 'Shield',
    permissions: [
      { category: 'users', permissions: ['read', 'update'] },
      { category: 'content', permissions: ['read', 'create', 'update', 'publish'] },
      { category: 'assessments', permissions: ['read', 'create', 'update', 'grade'] },
      { category: 'progress', permissions: ['read', 'update', 'export'] },
      { category: 'reports', permissions: ['read', 'generate', 'export'] },
      { category: 'gamification', permissions: ['read', 'assign_badges', 'modify_xp'] },
      { category: 'messaging', permissions: ['read', 'send', 'moderate'] },
      { category: 'forum', permissions: ['read', 'create', 'moderate'] },
    ],
  },
  {
    id: '7',
    key: 'TUTOR',
    name: 'Tutor de Apoyo',
    description: 'Acceso limitado para apoyo academico y revision de contenido basico.',
    isDefault: false,
    userCount: 8,
    color: 'from-cyan-500 to-cyan-700',
    icon: 'Eye',
    permissions: [
      { category: 'users', permissions: ['read'] },
      { category: 'content', permissions: ['read'] },
      { category: 'assessments', permissions: ['read'] },
      { category: 'progress', permissions: ['read'] },
      { category: 'reports', permissions: ['read'] },
      { category: 'messaging', permissions: ['read', 'send'] },
      { category: 'forum', permissions: ['read'] },
    ],
  },
]

// ==================== HELPERS ====================

function getRolePermissionMap(role: Role): PermissionToggleState {
  const state: PermissionToggleState = {}
  role.permissions.forEach((rp) => {
    state[rp.category] = {}
    const catDef = PERMISSION_CATEGORIES.find((c) => c.key === rp.category)
    if (catDef) {
      catDef.permissions.forEach((p) => {
        state[rp.category][p.key] = rp.permissions.includes(p.key)
      })
    }
  })
  // Fill missing categories
  PERMISSION_CATEGORIES.forEach((cat) => {
    if (!state[cat.key]) {
      state[cat.key] = {}
      cat.permissions.forEach((p) => {
        state[cat.key][p.key] = false
      })
    }
  })
  return state
}

function getPermissionCount(role: Role): number {
  return role.permissions.reduce((sum, rp) => sum + rp.permissions.length, 0)
}

function getTotalPermissions(): number {
  return PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0)
}

function hasPermission(role: Role, category: PermissionCategory, perm: string): boolean {
  const rp = role.permissions.find((p) => p.category === category)
  return rp ? rp.permissions.includes(perm) : false
}

function getIconComponent(iconName: string): React.ReactNode {
  switch (iconName) {
    case 'Lock': return <Lock className="h-5 w-5" />
    case 'Unlock': return <Unlock className="h-5 w-5" />
    case 'Users': return <Users className="h-5 w-5" />
    case 'Eye': return <Eye className="h-5 w-5" />
    case 'Shield': return <Shield className="h-5 w-5" />
    case 'Key': return <Key className="h-5 w-5" />
    default: return <Shield className="h-5 w-5" />
  }
}

function getCategoryLabel(category: PermissionCategory): string {
  const cat = PERMISSION_CATEGORIES.find((c) => c.key === category)
  return cat?.label || category
}

// ==================== COMPONENTS ====================

function PermissionPicker({
  permissions,
  onChange,
  readOnly = false,
}: {
  permissions: PermissionToggleState
  onChange?: (permissions: PermissionToggleState) => void
  readOnly?: boolean
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<PermissionCategory>>(
    new Set(PERMISSION_CATEGORIES.map((c) => c.key))
  )

  const toggleCategory = useCallback((key: PermissionCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const togglePerm = useCallback(
    (category: PermissionCategory, perm: string) => {
      if (readOnly || !onChange) return
      const newPermissions = { ...permissions }
      newPermissions[category] = { ...newPermissions[category] }
      newPermissions[category][perm] = !newPermissions[category][perm]
      onChange(newPermissions)
    },
    [permissions, onChange, readOnly]
  )

  const toggleAllInCategory = useCallback(
    (category: PermissionCategory) => {
      if (readOnly || !onChange) return
      const cat = PERMISSION_CATEGORIES.find((c) => c.key === category)
      if (!cat) return
      const allEnabled = cat.permissions.every((p) => permissions[category]?.[p.key])
      const newPermissions = { ...permissions }
      newPermissions[category] = { ...newPermissions[category] }
      cat.permissions.forEach((p) => {
        newPermissions[category][p.key] = !allEnabled
      })
      onChange(newPermissions)
    },
    [permissions, onChange, readOnly]
  )

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {PERMISSION_CATEGORIES.map((cat) => {
        const isExpanded = expandedCategories.has(cat.key)
        const catPerms = permissions[cat.key] || {}
        const enabledCount = Object.values(catPerms).filter(Boolean).length
        const totalCount = cat.permissions.length
        const allEnabled = enabledCount === totalCount

        return (
          <div
            key={cat.key}
            className="border rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-800/50"
          >
            <button
              type="button"
              onClick={() => toggleCategory(cat.key)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">{cat.icon}</span>
                <div className="text-left">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {enabledCount}/{totalCount} permisos
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAllInCategory(cat.key)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        toggleAllInCategory(cat.key)
                      }
                    }}
                    className="text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {allEnabled ? 'Ninguno' : 'Todos'}
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 pt-0 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{cat.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {cat.permissions.map((perm) => {
                    const enabled = catPerms[perm.key] || false
                    return (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                          )}
                          <Label
                            htmlFor={`perm-${cat.key}-${perm.key}`}
                            className={`text-sm cursor-pointer ${readOnly ? 'cursor-default' : ''
                              }`}
                          >
                            {perm.label}
                          </Label>
                        </div>
                        <Switch
                          id={`perm-${cat.key}-${perm.key}`}
                          checked={enabled}
                          onCheckedChange={() => togglePerm(cat.key, perm.key)}
                          disabled={readOnly}
                          className="scale-75"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RoleCard({
  role,
  onEdit,
  onDelete,
  onView,
}: {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onView: (role: Role) => void
}) {
  const permCount = getPermissionCount(role)
  const totalPerms = getTotalPermissions()
  const percentage = Math.round((permCount / totalPerms) * 100)

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${role.color}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color} text-white`}>
              {getIconComponent(role.icon)}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {role.name}
                {role.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Predeterminado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {role.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800">
            <Users className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios</p>
              <p className="text-sm font-semibold">{role.userCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800">
            <Key className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permisos</p>
              <p className="text-sm font-semibold">
                {permCount}/{totalPerms}
              </p>
            </div>
          </div>
        </div>

        {/* Permission bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Cobertura de permisos</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${role.color} rounded-full transition-all`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Permission summary */}
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 4).map((rp) => (
            <Badge key={rp.category} variant="secondary" className="text-xs">
              {getCategoryLabel(rp.category)}
            </Badge>
          ))}
          {role.permissions.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 4}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onView(role)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onEdit(role)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
          {!role.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
              onClick={() => onDelete(role)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PermissionMatrixTable({ roles }: { roles: Role[] }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<PermissionCategory>>(
    new Set(PERMISSION_CATEGORIES.map((c) => c.key))
  )

  const toggleCategory = (key: PermissionCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[180px]">
              Permiso
            </th>
            {roles.map((role) => (
              <th key={role.id} className="p-3 text-center min-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${role.color} text-white`}>
                    {getIconComponent(role.icon)}
                  </div>
                  <span className="text-xs font-medium">{role.name}</span>
                  <span className="text-xs text-slate-400">({role.userCount})</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategories.has(cat.key)
            return (
              <React.Fragment key={cat.key}>
                <tr
                  className="border-b bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => toggleCategory(cat.key)}
                >
                  <td className="p-3 font-medium sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </td>
                  {roles.map((role) => {
                    const catPerms = role.permissions.find((rp) => rp.category === cat.key)
                    const count = catPerms?.permissions.length || 0
                    const total = cat.permissions.length
                    return (
                      <td key={role.id} className="p-3 text-center">
                        <Badge
                          variant={count === total ? 'default' : count > 0 ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {count}/{total}
                        </Badge>
                      </td>
                    )
                  })}
                </tr>
                {isExpanded &&
                  cat.permissions.map((perm) => (
                    <tr key={`${cat.key}-${perm.key}`} className="border-b">
                      <td className="p-2 pl-10 text-xs text-slate-600 dark:text-slate-400 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        {perm.label}
                      </td>
                      {roles.map((role) => {
                        const has = hasPermission(role, cat.key, perm.key)
                        return (
                          <td key={role.id} className="p-2 text-center">
                            {has ? (
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ==================== MAIN PAGE ====================

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Dialogs
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Edit/Create form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPermissions, setFormPermissions] = useState<PermissionToggleState>({})

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles
    const q = searchQuery.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q)
    )
  }, [roles, searchQuery])

  const totalUsers = useMemo(() => roles.reduce((sum, r) => sum + r.userCount, 0), [roles])
  const customRolesCount = useMemo(() => roles.filter((r) => !r.isDefault).length, [roles])

  const openViewDialog = useCallback((role: Role) => {
    setSelectedRole(role)
    setShowViewDialog(true)
  }, [])

  const openEditDialog = useCallback((role: Role) => {
    setSelectedRole(role)
    setFormName(role.name)
    setFormDescription(role.description)
    setFormPermissions(getRolePermissionMap(role))
    setShowEditDialog(true)
  }, [])

  const openCreateDialog = useCallback(() => {
    setSelectedRole(null)
    setFormName('')
    setFormDescription('')
    const emptyPerms: PermissionToggleState = {}
    PERMISSION_CATEGORIES.forEach((cat) => {
      emptyPerms[cat.key] = {}
      cat.permissions.forEach((p) => {
        emptyPerms[cat.key][p.key] = false
      })
    })
    setFormPermissions(emptyPerms)
    setShowCreateDialog(true)
  }, [])

  const openDeleteDialog = useCallback((role: Role) => {
    setSelectedRole(role)
    setShowDeleteDialog(true)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!selectedRole) return
    // TODO: POST /api/roles/:id
    const newPermissions: RolePermission[] = []
    Object.entries(formPermissions).forEach(([category, perms]) => {
      const enabled = Object.entries(perms)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
      if (enabled.length > 0) {
        newPermissions.push({ category: category as PermissionCategory, permissions: enabled })
      }
    })
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole.id
          ? { ...r, name: formName, description: formDescription, permissions: newPermissions }
          : r
      )
    )
    setShowEditDialog(false)
  }, [selectedRole, formName, formDescription, formPermissions])

  const handleCreateRole = useCallback(() => {
    if (!formName.trim()) return
    // TODO: POST /api/roles
    const newPermissions: RolePermission[] = []
    Object.entries(formPermissions).forEach(([category, perms]) => {
      const enabled = Object.entries(perms)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
      if (enabled.length > 0) {
        newPermissions.push({ category: category as PermissionCategory, permissions: enabled })
      }
    })
    const newRole: Role = {
      id: String(Date.now()),
      key: formName.toUpperCase().replace(/\s+/g, '_'),
      name: formName,
      description: formDescription,
      isDefault: false,
      userCount: 0,
      color: 'from-slate-500 to-slate-700',
      icon: 'Shield',
      permissions: newPermissions,
    }
    setRoles((prev) => [...prev, newRole])
    setShowCreateDialog(false)
  }, [formName, formDescription, formPermissions])

  const handleDeleteRole = useCallback(() => {
    if (!selectedRole || selectedRole.isDefault) return
    // TODO: DELETE /api/roles/:id
    setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id))
    setShowDeleteDialog(false)
    setSelectedRole(null)
  }, [selectedRole])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Gestion de Roles y Permisos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Administra los roles del sistema y sus permisos asociados
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Rol Personalizado
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roles.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total de Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{customRolesCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Roles Personalizados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{getTotalPermissions()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permisos Disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar roles por nombre o descripcion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="gap-1.5"
          >
            <LayoutGrid className="h-4 w-4" />
            Tarjetas
          </Button>
          <Button
            variant={viewMode === 'matrix' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('matrix')}
            className="gap-1.5"
          >
            <TableIcon className="h-4 w-4" />
            Matriz
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No se encontraron roles que coincidan con la busqueda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onView={openViewDialog}
              />
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz de Permisos</CardTitle>
            <CardDescription>
              Vista completa de todos los permisos por rol. Haz clic en una categoria para expandir.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <PermissionMatrixTable roles={filteredRoles} />
          </CardContent>
        </Card>
      )}

      {/* ==================== VIEW DIALOG ==================== */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole && (
                <div className={`p-1.5 rounded-md bg-gradient-to-br ${selectedRole.color} text-white`}>
                  {getIconComponent(selectedRole.icon)}
                </div>
              )}
              {selectedRole?.name}
              {selectedRole?.isDefault && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Predeterminado
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedRole?.description}</DialogDescription>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {selectedRole?.userCount} usuarios
              </span>
              <span className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                {selectedRole ? getPermissionCount(selectedRole) : 0} permisos activos
              </span>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 mt-2">
            {selectedRole && (
              <PermissionPicker
                permissions={getRolePermissionMap(selectedRole)}
                readOnly
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== EDIT DIALOG ==================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Rol: {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Modifica el nombre, descripcion y permisos de este rol.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-role-name">Nombre del Rol</Label>
                <Input
                  id="edit-role-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Coordinador Academico"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-role-description">Descripcion</Label>
                <Input
                  id="edit-role-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe las responsabilidades de este rol..."
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-base font-medium flex items-center gap-2 mb-3">
                <Key className="h-4 w-4" />
                Permisos
              </Label>
              <PermissionPicker
                permissions={formPermissions}
                onChange={setFormPermissions}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="gap-2">
              <Check className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== CREATE DIALOG ==================== */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Rol Personalizado
            </DialogTitle>
            <DialogDescription>
              Define un nuevo rol con permisos especificos para tu organizacion.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor="create-role-name">Nombre del Rol *</Label>
                <Input
                  id="create-role-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Supervisor de Area"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-role-description">Descripcion</Label>
                <Input
                  id="create-role-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe las responsabilidades de este rol..."
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-base font-medium flex items-center gap-2 mb-3">
                <Key className="h-4 w-4" />
                Permisos
              </Label>
              <PermissionPicker
                permissions={formPermissions}
                onChange={setFormPermissions}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={!formName.trim()} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Eliminar Rol
            </DialogTitle>
            <DialogDescription>
              Estas seguro de que deseas eliminar el rol{' '}
              <span className="font-semibold text-foreground">&quot;{selectedRole?.name}&quot;</span>?
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && selectedRole.userCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Atencion</p>
                <p>
                  Este rol tiene <strong>{selectedRole.userCount} usuario(s)</strong> asignado(s).
                  Deberas reasignar estos usuarios antes de eliminar el rol.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Eliminar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
